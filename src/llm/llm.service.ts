import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { getConfig } from '../config';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

type Provider = {
  name: string;
  url: string;
  headers: Record<string, string>;
  model: string;
  extra: Record<string, unknown>;
};

/**
 * OpenAI-compatible chat completions over plain fetch. Groq answers first;
 * Cloudflare Workers AI takes over when Groq is out of quota or down.
 */
@Injectable()
export class LlmService {
  private readonly log = new Logger(LlmService.name);

  private providers(): Provider[] {
    const c = getConfig();
    const out: Provider[] = [];
    if (c.groq.apiKey) {
      out.push({
        name: 'groq',
        url: `${c.groq.baseUrl}/chat/completions`,
        headers: { Authorization: `Bearer ${c.groq.apiKey}` },
        model: c.groq.model,
        extra: c.groq.extra,
      });
    }
    if (c.cloudflare.accountId && c.cloudflare.apiToken) {
      out.push({
        name: 'cloudflare',
        url: `https://api.cloudflare.com/client/v4/accounts/${c.cloudflare.accountId}/ai/v1/chat/completions`,
        headers: { Authorization: `Bearer ${c.cloudflare.apiToken}` },
        model: c.cloudflare.chatModel,
        extra: {},
      });
    }
    if (out.length === 0) throw new ServiceUnavailableException('No LLM provider is configured.');
    return out;
  }

  private fail(errors: string[], detail: string) {
    errors.push(detail);
    this.log.warn(`LLM provider failed, trying next: ${detail}`);
  }

  private request(p: Provider, messages: ChatMessage[], maxTokens: number, stream: boolean) {
    return fetch(p.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...p.headers },
      body: JSON.stringify({ model: p.model, messages, max_tokens: maxTokens, temperature: 0.3, stream, ...p.extra }),
      signal: AbortSignal.timeout(45_000),
    });
  }

  /** Whole answer at once. Moves to the next provider on any failure. */
  async complete(messages: ChatMessage[], maxTokens: number): Promise<{ text: string; provider: string }> {
    const errors: string[] = [];
    for (const p of this.providers()) {
      try {
        const res = await this.request(p, messages, maxTokens, false);
        if (!res.ok) {
          this.fail(errors, `${p.name} ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
          continue;
        }
        const json: any = await res.json();
        const text = String(json?.choices?.[0]?.message?.content ?? '').trim();
        if (!text) {
          this.fail(errors, `${p.name}: empty answer`);
          continue;
        }
        return { text, provider: p.name };
      } catch (err) {
        this.fail(errors, `${p.name}: ${(err as Error).message}`);
      }
    }
    this.log.error(`All LLM providers failed: ${errors.join(' | ')}`);
    throw new ServiceUnavailableException('The assistant is unavailable right now. Please try again in a minute.');
  }

  /**
   * Streams answer text. Falls back to the next provider only before the
   * first token; after that the stream is committed to one provider.
   */
  async *stream(messages: ChatMessage[], maxTokens: number): AsyncGenerator<string, string, void> {
    const errors: string[] = [];
    for (const p of this.providers()) {
      let res: Response;
      try {
        res = await this.request(p, messages, maxTokens, true);
      } catch (err) {
        this.fail(errors, `${p.name}: ${(err as Error).message}`);
        continue;
      }
      if (!res.ok || !res.body) {
        this.fail(errors, `${p.name} ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
        continue;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let emitted = false;
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let newline: number;
          while ((newline = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, newline).trim();
            buffer = buffer.slice(newline + 1);
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (data === '[DONE]') return p.name;
            let json: any;
            try {
              json = JSON.parse(data);
            } catch {
              continue;
            }
            const delta = json?.choices?.[0]?.delta?.content;
            if (typeof delta === 'string' && delta) {
              emitted = true;
              yield delta;
            }
          }
        }
        if (emitted) return p.name;
        this.fail(errors, `${p.name}: stream ended without content`);
      } catch (err) {
        if (emitted) throw err;
        this.fail(errors, `${p.name}: ${(err as Error).message}`);
      }
    }
    this.log.error(`All LLM providers failed: ${errors.join(' | ')}`);
    throw new ServiceUnavailableException('The assistant is unavailable right now. Please try again in a minute.');
  }
}

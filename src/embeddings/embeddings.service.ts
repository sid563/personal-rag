import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getConfig } from '../config';

/**
 * Cloudflare Workers AI, model BAAI/bge-small-en-v1.5 (384 dimensions).
 * Up to 100 texts per call; chunks stay under the model's 512-token input.
 */
@Injectable()
export class EmbeddingsService {
  async embed(text: string): Promise<number[]> {
    const [vector] = await this.embedBatch([text]);
    return vector;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const cf = getConfig().cloudflare;
    if (!cf.accountId || !cf.apiToken) {
      throw new InternalServerErrorException('Embeddings are not configured: set CF_ACCOUNT_ID and CF_API_TOKEN.');
    }
    const url = `https://api.cloudflare.com/client/v4/accounts/${cf.accountId}/ai/run/${cf.embeddingModel}`;
    const out: number[][] = [];
    for (let i = 0; i < texts.length; i += 100) {
      const batch = texts.slice(i, i + 100);
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${cf.apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: batch }),
        signal: AbortSignal.timeout(30_000),
      });
      const json: any = await res.json().catch(() => null);
      if (!res.ok || !json?.success || !Array.isArray(json?.result?.data)) {
        const detail = JSON.stringify(json?.errors ?? json?.messages ?? '').slice(0, 300);
        throw new InternalServerErrorException(`Embedding call failed (${res.status}) ${detail}`);
      }
      out.push(...(json.result.data as number[][]));
    }
    return out;
  }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Groq from 'groq-sdk';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { ChatMessageDto } from './chat.dto';

@Injectable()
export class ChatService {
  private groq: Groq;

  constructor(
    private embeddingsService: EmbeddingsService,
    private knowledgeService: KnowledgeService,
  ) {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async chat(dto: ChatMessageDto): Promise<{ answer: string; sources: string[] }> {
    const { message, history = [] } = dto;
    const ownerName = process.env.OWNER_NAME || 'the person';

    // ── Step 1: Embed the user's question ──
    const queryVector = await this.embeddingsService.embed(message);

    // ── Step 2: Retrieve top 5 relevant knowledge chunks ──
    const chunks = await this.knowledgeService.vectorSearch(queryVector, 5);

    if (chunks.length === 0) {
      return {
        answer: `I don't have enough information about that yet. Try asking something else about ${ownerName}!`,
        sources: [],
      };
    }

    // ── Step 3: Build context from retrieved chunks ──
    const context = chunks
      .map((c, i) => `[${i + 1}] (${c.category}): ${c.content}`)
      .join('\n\n');

    const sources = [...new Set(chunks.map((c) => c.category))];

    // ── Step 4: Build the prompt ──
    const systemPrompt = `You are a helpful assistant that answers questions about ${ownerName}.
You ONLY answer based on the context provided below. 
If the context doesn't contain enough info to answer, say so honestly.
Keep answers concise, friendly, and professional.
Speak as if you know ${ownerName} personally — use "he/his" pronouns.

CONTEXT ABOUT ${ownerName.toUpperCase()}:
${context}`;

    // ── Step 5: Call Groq (Llama 3.3 70B — free, very capable) ──
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      // Include recent conversation history for multi-turn context
      ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 512,
      });

      const answer = completion.choices[0]?.message?.content || 'No response generated.';
      return { answer, sources };
    } catch (err) {
      throw new InternalServerErrorException(`LLM call failed: ${err.message}`);
    }
  }
}

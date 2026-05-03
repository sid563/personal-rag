import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmbeddingsService {
  // Using HuggingFace Inference API — free tier
  // Model: BAAI/bge-small-en-v1.5 (384 dim, fast, accurate, free)
  private readonly HF_URL =
    'https://router.huggingface.co/hf-inference/models/BAAI/bge-small-en-v1.5/pipeline/feature-extraction';

  async embed(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        this.HF_URL,
        { inputs: text, options: { wait_for_model: true } },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // HF returns nested array for some models — flatten if needed
      const data = response.data;
      const vector = Array.isArray(data[0]) ? data[0] : data;

      if (!Array.isArray(vector) || vector.length === 0) {
        throw new Error('Invalid embedding response from HuggingFace');
      }

      return vector as number[];
    } catch (err) {
      throw new InternalServerErrorException(
        `Embedding generation failed: ${err.message}`,
      );
    }
  }

  // Embed multiple texts — used for batch operations
  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }
}

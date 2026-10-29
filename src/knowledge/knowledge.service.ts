import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Knowledge, KnowledgeDocument } from './knowledge.schema';
import { CreateKnowledgeDto, UpdateKnowledgeDto } from './knowledge.dto';
import { EmbeddingsService } from '../embeddings/embeddings.service';

export type SearchHit = {
  _id: unknown;
  category: string;
  content: string;
  metadata: Record<string, any>;
  /** Atlas vectorSearchScore: (1 + cosine) / 2, so 0.5 is unrelated and 1 is identical. */
  score: number;
};

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectModel(Knowledge.name) private model: Model<KnowledgeDocument>,
    private embeddingsService: EmbeddingsService,
  ) {}

  // Add a new knowledge entry — auto-generates embedding
  async create(dto: CreateKnowledgeDto): Promise<KnowledgeDocument> {
    const embedding = await this.embeddingsService.embed(dto.content);
    const doc = new this.model({
      category: dto.category,
      content: dto.content,
      embedding,
      metadata: dto.metadata || {},
    });
    return doc.save();
  }

  // Add multiple entries at once (bulk seed)
  async bulkCreate(items: CreateKnowledgeDto[]): Promise<{ inserted: number }> {
    const docs = await Promise.all(
      items.map(async (item) => ({
        category: item.category,
        content: item.content,
        embedding: await this.embeddingsService.embed(item.content),
        metadata: item.metadata || {},
      })),
    );
    await this.model.insertMany(docs);
    return { inserted: docs.length };
  }

  // Update — if content changed, regenerate embedding
  async update(id: string, dto: UpdateKnowledgeDto): Promise<KnowledgeDocument> {
    const existing = await this.model.findById(id);
    if (!existing) throw new NotFoundException(`Knowledge ${id} not found`);

    if (dto.content && dto.content !== existing.content) {
      existing.embedding = await this.embeddingsService.embed(dto.content);
      existing.content = dto.content;
    }
    if (dto.category) existing.category = dto.category;
    if (dto.metadata) existing.metadata = dto.metadata;

    return existing.save();
  }

  // Delete a single entry
  async delete(id: string): Promise<{ deleted: boolean }> {
    const res = await this.model.findByIdAndDelete(id);
    if (!res) throw new NotFoundException(`Knowledge ${id} not found`);
    return { deleted: true };
  }

  // List all entries (for admin/debug)
  async findAll(category?: string): Promise<KnowledgeDocument[]> {
    const filter = category ? { category } : {};
    return this.model.find(filter).select('-embedding').sort({ createdAt: -1 });
  }

  // Vector similarity search: top K chunks for a query vector, with scores.
  async vectorSearch(queryEmbedding: number[], topK = 6): Promise<SearchHit[]> {
    return this.model.aggregate<SearchHit>([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: Math.max(topK * 10, 60),
          limit: topK,
        },
      },
      {
        $project: {
          content: 1,
          category: 1,
          metadata: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);
  }
}

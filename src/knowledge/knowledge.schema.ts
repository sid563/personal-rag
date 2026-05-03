import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type KnowledgeDocument = Knowledge & Document;

@Schema({ timestamps: true })
export class Knowledge {
  // A short label for this entry e.g. "work_experience", "skills", "about"
  @Prop({ required: true, index: true })
  category: string;

  // The original raw text you stored
  @Prop({ required: true })
  content: string;

  // The embedding vector (384-dim from BAAI/bge-small-en-v1.5)
  @Prop({ type: [Number], required: true })
  embedding: number[];

  // Optional metadata — anything extra you want to tag
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const KnowledgeSchema = SchemaFactory.createForClass(Knowledge);

// MongoDB Atlas Vector Search index — create this manually in Atlas UI:
// Field: "embedding", Dimensions: 384, Similarity: cosine
// Index name: "vector_index"
// (instructions in README)

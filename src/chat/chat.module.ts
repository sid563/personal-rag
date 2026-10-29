import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { LlmModule } from '../llm/llm.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [EmbeddingsModule, KnowledgeModule, LlmModule, CommonModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}

import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [EmbeddingsModule, KnowledgeModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}

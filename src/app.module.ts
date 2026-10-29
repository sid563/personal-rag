import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';
import { CommonModule } from './common/common.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { HealthController } from './health/health.controller';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { LlmModule } from './llm/llm.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    CommonModule,
    EmbeddingsModule,
    LlmModule,
    SessionModule,
    KnowledgeModule,
    ChatModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

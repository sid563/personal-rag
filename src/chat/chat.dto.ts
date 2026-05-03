import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string; // the user's question

  @IsOptional()
  @IsArray()
  history?: { role: 'user' | 'assistant'; content: string }[]; // last N messages for context
}

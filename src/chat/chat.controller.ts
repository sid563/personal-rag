import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessageDto } from './chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // POST /api/chat
  // Body: { message: string, history?: [{role, content}] }
  // Returns: { answer: string, sources: string[] }
  @Post()
  chat(@Body() dto: ChatMessageDto) {
    return this.chatService.chat(dto);
  }
}

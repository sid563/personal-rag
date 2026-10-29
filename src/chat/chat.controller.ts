import { Body, Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ChatKeyGuard } from '../common/chat-key.guard';
import { clientIp } from '../common/client-ip';
import { RateLimitService } from '../common/rate-limit.service';
import { ChatMessageDto } from './chat.dto';
import { ChatService } from './chat.service';

type HttpRes = {
  status(code: number): HttpRes;
  set(headers: Record<string, string>): HttpRes;
  flushHeaders(): void;
  write(chunk: string): boolean;
  end(): void;
};

/** The key check runs before the rate limiter, so unauthenticated calls never touch the budget. */
@Controller('chat')
@UseGuards(ChatKeyGuard)
export class ChatController {
  constructor(
    private readonly chat: ChatService,
    private readonly limiter: RateLimitService,
  ) {}

  /** POST /api/chat → { answer, sources, provider } */
  @Post()
  @HttpCode(200)
  async ask(@Body() dto: ChatMessageDto, @Req() req: any) {
    await this.limiter.check(clientIp(req));
    return this.chat.chat(dto);
  }

  /**
   * POST /api/chat/stream → server-sent events, one JSON object per `data:` line:
   * {type:"sources"} first, then {type:"token"} repeatedly, then {type:"done"} or {type:"error"}.
   */
  @Post('stream')
  async stream(@Body() dto: ChatMessageDto, @Req() req: any, @Res() res: HttpRes) {
    await this.limiter.check(clientIp(req)); // throws a normal 429 before any header is sent

    res.status(200).set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();
    const send = (event: object) => res.write(`data: ${JSON.stringify(event)}\n\n`);

    try {
      for await (const event of this.chat.chatStream(dto)) send(event);
    } catch (err) {
      const message = (err as any)?.response?.message ?? (err as Error).message ?? 'Something went wrong.';
      send({ type: 'error', message: String(message) });
    } finally {
      res.end();
    }
  }
}

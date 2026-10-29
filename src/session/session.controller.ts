import { Body, Controller, ForbiddenException, HttpCode, Post, Req, ServiceUnavailableException } from '@nestjs/common';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { clientIp } from '../common/client-ip';
import { RateLimitService } from '../common/rate-limit.service';
import { SessionService } from './session.service';

export class SessionRequestDto {
  /** The Turnstile response token from the browser widget. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  token: string;
}

@Controller('session')
export class SessionController {
  constructor(
    private readonly sessions: SessionService,
    private readonly limiter: RateLimitService,
  ) {}

  /** POST /api/session { token } → { session, expiresAt } */
  @Post()
  @HttpCode(200)
  async create(@Body() dto: SessionRequestDto, @Req() req: any) {
    if (!this.sessions.enabled()) {
      throw new ServiceUnavailableException('Browser verification is not configured on this API.');
    }
    const ip = clientIp(req);
    await this.limiter.hit(`session:${ip}`, 60, 20, 'Too many verification attempts. Give it a moment.');
    const { ok, codes } = await this.sessions.verifyTurnstile(dto.token, ip);
    if (!ok) throw new ForbiddenException({ statusCode: 403, message: 'Browser verification failed.', codes });
    return this.sessions.issue();
  }
}

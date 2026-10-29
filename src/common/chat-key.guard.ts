import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { getConfig } from '../config';

/**
 * Optional shared key for the chat routes, sent by the site as `x-chat-key`.
 * The site's copy lives in its public bundle, so this is a deterrent against
 * scanners and casual scripts, not a secret; the rate limits are the real cap.
 * When CHAT_API_KEY is unset the routes stay open.
 */
@Injectable()
export class ChatKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = getConfig().chatKey;
    if (!expected) return true;
    const req = context.switchToHttp().getRequest();
    const given = String(req.headers['x-chat-key'] ?? '');
    const a = Buffer.from(given);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Missing or invalid chat key');
    }
    return true;
  }
}

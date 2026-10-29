import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { getConfig } from '../config';
import { SessionService } from '../session/session.service';

/**
 * Who may call the chat routes, strongest configured method first:
 * 1. Turnstile configured → a valid `Authorization: Bearer <session>` from POST /api/session.
 * 2. Else CHAT_API_KEY configured → the `x-chat-key` header (a deterrent only; the key is in the site's bundle).
 * 3. Else open.
 * Runs before the rate limiter, so rejected calls never consume the budget.
 */
@Injectable()
export class ChatAccessGuard implements CanActivate {
  constructor(private readonly sessions: SessionService) {}

  canActivate(context: ExecutionContext): boolean {
    const c = getConfig();
    const req = context.switchToHttp().getRequest();

    if (c.turnstile.secret) {
      const auth = String(req.headers.authorization ?? '');
      const session = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
      if (!session) {
        throw new UnauthorizedException({ statusCode: 401, message: 'Browser verification required.', code: 'session_required' });
      }
      const state = this.sessions.verify(session);
      if (state !== 'ok') {
        throw new UnauthorizedException({
          statusCode: 401,
          message: state === 'expired' ? 'Session expired.' : 'Invalid session.',
          code: state === 'expired' ? 'session_expired' : 'session_invalid',
        });
      }
      return true;
    }

    if (c.chatKey) {
      const given = String(req.headers['x-chat-key'] ?? '');
      const a = Buffer.from(given);
      const b = Buffer.from(c.chatKey);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        throw new UnauthorizedException('Missing or invalid chat key');
      }
    }
    return true;
  }
}

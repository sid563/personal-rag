import { Injectable, Logger } from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { getConfig } from '../config';

export type SessionState = 'ok' | 'expired' | 'invalid';

/**
 * Browser verification: a Cloudflare Turnstile token (single use, minted in
 * the visitor's browser on the site's domain) is exchanged for a signed
 * session token the widget sends with every chat request.
 * Token format: `<expiresAtMs>.<nonce>.<hmac>`; the HMAC key is
 * SESSION_SECRET, falling back to the Turnstile secret.
 */
@Injectable()
export class SessionService {
  private readonly log = new Logger(SessionService.name);

  enabled(): boolean {
    return Boolean(getConfig().turnstile.secret);
  }

  async verifyTurnstile(token: string, ip: string): Promise<{ ok: boolean; codes: string[] }> {
    const body = new URLSearchParams({ secret: getConfig().turnstile.secret, response: token });
    if (ip && ip !== 'unknown') body.set('remoteip', ip);
    try {
      const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(10_000),
      });
      const json: any = await res.json().catch(() => ({}));
      const codes: string[] = Array.isArray(json?.['error-codes']) ? json['error-codes'] : [];
      if (!json?.success) this.log.warn(`Turnstile rejected a token: ${codes.join(',') || res.status}`);
      return { ok: Boolean(json?.success), codes };
    } catch (err) {
      this.log.error(`Turnstile verification call failed: ${(err as Error).message}`);
      return { ok: false, codes: ['verify-unreachable'] };
    }
  }

  issue(): { session: string; expiresAt: number } {
    const expiresAt = Date.now() + getConfig().sessionTtlSeconds * 1000;
    const payload = `${expiresAt}.${randomBytes(12).toString('base64url')}`;
    return { session: `${payload}.${this.sign(payload)}`, expiresAt };
  }

  verify(session: string): SessionState {
    const parts = session.split('.');
    if (parts.length !== 3) return 'invalid';
    const [expiresAt, nonce, signature] = parts;
    const expected = this.sign(`${expiresAt}.${nonce}`);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return 'invalid';
    if (!/^\d+$/.test(expiresAt) || Number(expiresAt) < Date.now()) return 'expired';
    return 'ok';
  }

  private sign(payload: string): string {
    const c = getConfig();
    return createHmac('sha256', c.sessionSecret || c.turnstile.secret).update(payload).digest('base64url');
  }
}

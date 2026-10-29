import { Controller, Get } from '@nestjs/common';
import { getConfig } from '../config';

@Controller('health')
export class HealthController {
  /** Liveness plus a shape check of the configuration (never the values). */
  @Get()
  health() {
    const c = getConfig();
    const secret = c.turnstile.secret;
    return {
      ok: true,
      service: 'personal-rag',
      time: new Date().toISOString(),
      config: {
        embeddings: Boolean(c.cloudflare.accountId && c.cloudflare.apiToken),
        groq: Boolean(c.groq.apiKey),
        turnstile: {
          enabled: Boolean(secret),
          secretLength: secret.length,
          secretPrefixOk: secret.startsWith('0x4'),
          secretTrimmed: secret === secret.trim() && !/^["']|["']$/.test(secret),
        },
      },
    };
  }
}

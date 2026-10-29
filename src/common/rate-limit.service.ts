import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getConfig } from '../config';
import { RateLimit } from './rate-limit.schema';

export class TooManyRequestsException extends HttpException {
  constructor(message: string, public readonly retryAfterSeconds: number) {
    super({ statusCode: HttpStatus.TOO_MANY_REQUESTS, message, retryAfter: retryAfterSeconds }, HttpStatus.TOO_MANY_REQUESTS);
  }
}

/**
 * Fixed-window counters in MongoDB, so every serverless instance shares them.
 * One atomic upsert per window; no extra service to run.
 */
@Injectable()
export class RateLimitService {
  constructor(@InjectModel(RateLimit.name) private readonly model: Model<RateLimit>) {}

  async hit(key: string, windowSeconds: number, limit: number, label: string): Promise<void> {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const bucket = Math.floor(now / windowMs);
    const id = `${key}:${windowSeconds}:${bucket}`;
    const windowEnd = (bucket + 1) * windowMs;

    const doc = await this.model.findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(windowEnd + 60_000) } },
      { upsert: true, returnDocument: 'after', lean: true },
    );

    if (doc && doc.count > limit) {
      const retry = Math.max(1, Math.ceil((windowEnd - now) / 1000));
      throw new TooManyRequestsException(label, retry);
    }
  }

  /** Per-minute and per-day limits for one visitor, then a daily budget for everyone. */
  async check(ip: string): Promise<void> {
    const { limits } = getConfig();
    await this.hit(`ip:${ip}`, 60, limits.perMinute, 'Too many questions in a minute. Give it a moment and try again.');
    await this.hit(`ip:${ip}`, 86_400, limits.perDay, "You've reached today's limit for this chat. Email Sidharth for anything else.");
    await this.hit('global', 86_400, limits.globalPerDay, 'The chat has hit its daily budget. Please try again tomorrow or email Sidharth.');
  }
}

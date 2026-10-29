import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** One counter per (key, window). Atlas deletes rows once `expiresAt` passes. */
@Schema({ collection: 'ratelimits', versionKey: false })
export class RateLimit {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ default: 0 })
  count: number;

  @Prop({ required: true })
  expiresAt: Date;
}

export const RateLimitSchema = SchemaFactory.createForClass(RateLimit);
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

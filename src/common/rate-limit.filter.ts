import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TooManyRequestsException } from './rate-limit.service';

/** Adds the standard Retry-After header to 429 responses. */
@Catch(TooManyRequestsException)
export class RateLimitFilter implements ExceptionFilter {
  catch(exception: TooManyRequestsException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    res.setHeader('Retry-After', String(exception.retryAfterSeconds));
    res.status(429).json(exception.getResponse());
  }
}

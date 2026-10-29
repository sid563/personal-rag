import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { getConfig } from '../config';

/** Protects the knowledge endpoints with the `x-admin-token` header. */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = getConfig().adminToken;
    if (!expected) {
      throw new ForbiddenException('Knowledge endpoints are disabled. Set ADMIN_TOKEN to enable them.');
    }
    const req = context.switchToHttp().getRequest();
    const given = String(req.headers['x-admin-token'] ?? '');
    const a = Buffer.from(given);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid admin token');
    }
    return true;
  }
}

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PUBLIC_CACHE_CONTROL } from '../cache/ttl-cache';

@Injectable()
export class PublicCacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    return next.handle().pipe(tap(() => reply.header('Cache-Control', PUBLIC_CACHE_CONTROL)));
  }
}

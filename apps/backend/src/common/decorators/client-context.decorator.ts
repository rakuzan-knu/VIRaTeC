import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ClientContext {
  userAgent?: string | null;
  ipAddress?: string | null;
}

const USER_AGENT_MAX = 512;

interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
}

export const Client = createParamDecorator((_: unknown, ctx: ExecutionContext): ClientContext => {
  const request = ctx.switchToHttp().getRequest<RequestLike>();
  const userAgent = request.headers['user-agent'];
  return {
    userAgent:
      (Array.isArray(userAgent) ? userAgent[0] : userAgent)?.slice(0, USER_AGENT_MAX) || null,
    ipAddress: request.ip || null,
  };
});

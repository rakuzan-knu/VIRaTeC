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

const firstHeader = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const Client = createParamDecorator((_: unknown, ctx: ExecutionContext): ClientContext => {
  const request = ctx.switchToHttp().getRequest<RequestLike>();
  const forwardedFor = firstHeader(request.headers['x-forwarded-for'])?.split(',')[0]?.trim();
  const userAgent = firstHeader(request.headers['user-agent'])?.slice(0, USER_AGENT_MAX);
  return {
    userAgent: userAgent || null,
    ipAddress: forwardedFor || request.ip || null,
  };
});

# Stage 1: Base
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@10.5.2 --activate
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY packages ./packages/
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma/

ENV CI=true
RUN pnpm install --frozen-lockfile --filter @viratec/backend...
RUN pnpm --filter @viratec/backend db:generate

# Stage 3: Builder
FROM deps AS builder

COPY apps/backend ./apps/backend
RUN pnpm --filter @viratec/contracts build \
    && pnpm --filter @viratec/utils build \
    && pnpm --filter @viratec/backend build

# Stage 4: Production Runner
FROM node:22-alpine AS runner

RUN apk add --no-cache tini openssl
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S -G appgroup appuser

WORKDIR /app
ENV NODE_ENV=production PORT=3000

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/packages ./packages
COPY apps/backend/package.json ./apps/backend/package.json
COPY package.json ./

USER appuser
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/backend/dist/main"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

# Stage 1: Builder
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.5.2 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml turbo.json ./
COPY packages ./packages/
COPY apps/web/package.json ./apps/web/

ENV CI=true
RUN pnpm install --frozen-lockfile --filter @viratec/web...

COPY apps/web ./apps/web
RUN pnpm --filter @viratec/contracts build \
    && pnpm --filter @viratec/utils build \
    && pnpm --filter @viratec/web build

# Stage 2: Production Nginx
FROM nginx:1.27-alpine AS production

RUN apk add --no-cache curl
RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]

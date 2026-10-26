# Backend — overview

The backend lives in `apps/backend` (`@viratec/backend`). **A frontend agent does not write or change code here without an explicit request from the user** — this file exists so you understand what the frontend integrates with and do not design the contract blindly.

If you are writing backend code, go here: [**architecture.md**](architecture.md). It covers NestJS modules, layers, DI, DTOs, errors, Prisma and copyable skeletons. A short human-oriented version — `docs/architecture/backend-modular.md`.

## Stack

- NestJS 11 on the Fastify adapter (`@nestjs/platform-fastify`, Fastify 5)
- `class-validator` + `class-transformer` — DTO validation through a global `ValidationPipe`; zod from `@viratec/contracts` — for JSON fields and shared schemas
- PostgreSQL + Prisma 6 (`prisma/schema.prisma`, migrations in `prisma/migrations`, `prisma.config.ts`)
- `@nestjs/config` — config from env (`src/config/configuration.ts`)
- `@nestjs/jwt` + Passport (`passport-jwt`) — authentication, `argon2` — password hashes, `google-auth-library` — Google sign-in
- `nestjs-pino` — logging, `@nestjs/swagger` — OpenAPI at `/docs`, `@nestjs/terminus` — health checks
- `@fastify/helmet`, `@fastify/compress`, `@fastify/cookie`

## Where it runs

- **Production** — Vercel (the `api` service in `vercel.json`, `framework: nestjs`) and Neon Postgres, Frankfurt region. `prisma migrate deploy` runs during the build. Neon creates a separate database branch for every preview. Details — `docs/deployment/vercel.md`.
- **Locally** — `pnpm docker:dev:up` starts Postgres (and Redis) from `docker-compose.dev.yml`, then `pnpm dev:backend` (`nest start --watch`) on port 3000. Env — `.env` at the root (template `.env.example`).

Because of Vercel the backend is effectively stateless between requests: the in-memory cache (`TtlCache`) and timers live only within a single instance. That is why rate limits and audit are stored in Postgres (`RateLimitBucket`, `AuditLog`), not in memory.

## Architecture in a nutshell

A modular monolith: one NestJS module per domain (`auth`, `users`, `projects`, `research`, `events`, `publications`, `community`, `content`, `admin`, `health`), infrastructure in the global `PrismaModule` and `SecurityModule` and in `src/common`. All responses use the `{ data }` envelope, all errors use the `AllExceptionsFilter` shape. The contract with the frontend — [`../api-contract.md`](../api-contract.md), the data model — [`../product.md`](../product.md#data-model).

## Not specified

- Redis, MinIO and Kubernetes are mentioned in `README.md`, `CONTRIBUTING.md` and `docker-compose.*`, but the backend code does not use them (Redis is only declared in config). Do not introduce them into code without a task.
- File uploads other than the avatar (stored in Postgres, `UserAvatar`) are not implemented.

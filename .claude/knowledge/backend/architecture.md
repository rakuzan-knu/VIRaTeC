# Backend — architecture and coding rules

A working document for whoever writes the VIRaTeC backend (human or AI). Read it top to bottom: first what we build, then the hard rules, then code skeletons you can copy.

The product is described in [`../product.md`](../product.md), the contract with the frontend in [`../api-contract.md`](../api-contract.md). Request and response shapes are **not duplicated** here: what `GET /api/v1/projects` returns lives in DTOs, contracts and Swagger.

---

## 0. In 30 seconds

The VIRaTeC platform API: accounts and security (cookie sessions, 2FA, Google, audit, rate limiting), catalogs of projects, research, events and publications, saved items, community, the admin panel and a Contentful proxy.

Almost everything is synchronous CRUD over Postgres through Prisma. There are no background queues; the only periodic work is `CleanupService` (removing expired tokens and buckets) on `setInterval`.

---

## 1. Stack (fixed)

| What                     | With                                                             |
| ------------------------ | ---------------------------------------------------------------- |
| HTTP                     | NestJS 11 + `@nestjs/platform-fastify` (Fastify 5)               |
| Input validation         | `class-validator` + `class-transformer`, global `ValidationPipe` |
| Shared schemas and enums | `@viratec/contracts` (zod)                                       |
| Database                 | PostgreSQL (production — Neon)                                   |
| ORM and migrations       | Prisma 6                                                         |
| Config                   | `@nestjs/config` + `src/config/configuration.ts`                 |
| Authentication           | `@nestjs/jwt`, Passport JWT, `argon2`, `google-auth-library`     |
| Logging                  | `nestjs-pino`                                                    |
| Documentation            | `@nestjs/swagger`                                                |

Everything that touches the network or the database is `async`. Synchronous blocking calls (`fs.*Sync`, `crypto.*Sync` on large data, `execSync`) never appear in request handlers.

---

## 2. Three non-negotiable rules

### 2.1 Layers and dependency direction

```
Controller  →  Service  →  PrismaService (@prisma/client)
     ↑
    DTO (class-validator)        Guards / Interceptors / Filters — src/common
```

- **Controller** knows about HTTP: route, method, guards, parameter decorators, DTOs, Swagger. It contains no business logic and does not touch `PrismaService` (the only exception is `health.controller.ts`, where `SELECT 1` is the readiness check itself).
- **Service** knows business rules and data: Prisma queries, checks, cache, audit. It knows nothing about Fastify `request`/`reply` — everything it needs from the request (user id, `ClientContext`) arrives as arguments through controller decorators.
- **PrismaService** is the only access point to the database, injected through DI. Application code never creates `new PrismaClient()` (the exception is the CLI script `src/cli/assign-owner.ts`, which runs outside Nest).

The project has no repository layer: services use `PrismaService` directly. Do not introduce one for a single task — it would be a new pattern for the whole backend. Repeated `select`/`include` objects become module constants with `satisfies Prisma.<Model>Select` (`LEAD_SELECT` in `projects.service.ts`), repeated logic becomes functions next to the service (`users/public-profile.ts`); anything several domains need goes into `security/` or `common/` (`security/account.ts`).

### 2.2 Module = domain

Each domain is a NestJS module with its own controllers, services and DTOs. A module exports only what other modules actually need (`exports: [ProjectsService]`). Another domain's service is used only by importing its module into `imports`, never through `new` or by importing private files directly. Global modules are infrastructure only: `PrismaModule`, `SecurityModule`, `ConfigModule`.

### 2.3 SOLID

Not as a mantra but as a review check — specifically for this project, see section 5.

---

## 3. Directory structure

```
apps/backend/
├── prisma/
│   ├── schema.prisma            # data model
│   └── migrations/              # Prisma migrations, one folder per change
├── prisma.config.ts             # schema and migrations path, .env loading
├── src/
│   ├── main.ts                  # Fastify app assembly: plugins, CSRF, CORS, prefix, pipes, filter, interceptor, Swagger
│   ├── app.module.ts            # root module: Config, Logger, all domains
│   ├── config/configuration.ts  # reading and validating env
│   ├── prisma/                  # NOT a domain: PrismaModule (@Global) + PrismaService
│   ├── security/                # NOT a domain: @Global — AuditService, RateLimitService, CleanupService, crypto, staff, account (toAccount), authenticated-user
│   ├── common/                  # NOT a domain: shared HTTP infrastructure
│   │   ├── guards/              # JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard, StaffGuard
│   │   ├── decorators/          # @CurrentUser, @Roles, @RequirePermissions/@OwnerOnly/@RequireStepUp, @Client
│   │   ├── filters/             # AllExceptionsFilter
│   │   ├── interceptors/        # TransformInterceptor, PublicCacheInterceptor
│   │   ├── pagination/          # cursor pagination
│   │   ├── dto/                 # CursorQueryDto
│   │   └── cache/               # TtlCache
│   ├── auth/                    # DOMAIN: sign-in, registration, sessions, 2FA, Google
│   ├── users/                   # DOMAIN: profile, privacy, avatar, export, saved items
│   ├── projects/ research/ events/ publications/ community/
│   ├── content/                 # DOMAIN: Contentful Delivery API proxy
│   ├── admin/                   # DOMAIN: staff admin panel
│   ├── health/                  # health checks
│   └── cli/                     # one-off scripts outside HTTP (assign-owner)
└── tests/                       # node:test against the built dist, see § 13
```

Inside a domain:

```
projects/
├── dto/
│   ├── create-project.dto.ts
│   └── list-projects-query.dto.ts
├── projects.controller.ts
├── projects.service.ts
└── projects.module.ts
```

Files are kebab-case with a role suffix (`*.controller.ts`, `*.service.ts`, `*.module.ts`, `*.dto.ts`, `*.guard.ts`, `*.decorator.ts`), classes are PascalCase with the same suffix.

**Cross-domain import rule:** a domain takes from another domain only its exported service (through the module) or its DTOs/types. Anything shared by several domains goes into `common/`, `security/` or `@viratec/contracts`, not imported from someone else's folder.

---

## 4. Module skeleton — for copying

### 4.1 DTO

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { EventType } from '@viratec/contracts';

export class CreateThingDto {
  @ApiProperty({ example: 'Spring hackathon' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ enum: EventType, required: false })
  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;
}
```

A paginated list extends `CursorQueryDto` from `common/dto/cursor-query.dto.ts` instead of declaring `limit`/`cursor` again.

### 4.2 Service

`Thing` is a placeholder Prisma model; substitute your own.

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type Thing } from '@prisma/client';
import type { CursorPage } from '@viratec/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { TtlCache } from '../common/cache/ttl-cache';
import { cursorArgs, cursorCacheKey, toCursorPage } from '../common/pagination/cursor-page';
import { CreateThingDto } from './dto/create-thing.dto';
import { ListThingsQueryDto } from './dto/list-things-query.dto';

const CACHE_TTL_MS = 30_000;

const AUTHOR_SELECT = { id: true, name: true } satisfies Prisma.UserSelect;

@Injectable()
export class ThingsService {
  private listCache = new TtlCache<CursorPage<Thing>>(CACHE_TTL_MS);

  constructor(private prisma: PrismaService) {}

  findAll(query: ListThingsQueryDto) {
    return this.listCache.get(cursorCacheKey(query), () => this.load(query));
  }

  async findById(id: string) {
    const thing = await this.prisma.thing.findUnique({
      where: { id },
      include: { author: { select: AUTHOR_SELECT } },
    });
    if (!thing) throw new NotFoundException(`Thing with ID ${id} not found`);
    return thing;
  }

  async create(dto: CreateThingDto, authorId: string) {
    const thing = await this.prisma.thing.create({ data: { ...dto, authorId } });
    this.listCache.clear();
    return thing;
  }

  private async load(query: ListThingsQueryDto) {
    const rows = await this.prisma.thing.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...cursorArgs(query),
    });
    return toCursorPage(rows, query.limit);
  }
}
```

### 4.3 Controller

```ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PublicCacheInterceptor } from '../common/interceptors/public-cache.interceptor';
import { ThingsService } from './things.service';
import { CreateThingDto } from './dto/create-thing.dto';
import { ListThingsQueryDto } from './dto/list-things-query.dto';

@ApiTags('Things')
@Controller('things')
export class ThingsController {
  constructor(private thingsService: ThingsService) {}

  @Get()
  @UseInterceptors(PublicCacheInterceptor)
  @ApiOperation({ summary: 'List things' })
  findAll(@Query() query: ListThingsQueryDto) {
    return this.thingsService.findAll(query);
  }

  @Get(':id')
  @UseInterceptors(PublicCacheInterceptor)
  @ApiOperation({ summary: 'Get a thing by ID' })
  @ApiResponse({ status: 404, description: 'Thing not found' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.thingsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a thing' })
  create(@Body() dto: CreateThingDto, @CurrentUser('id') userId: string) {
    return this.thingsService.create(dto, userId);
  }
}
```

### 4.4 Module and registration

```ts
import { Module } from '@nestjs/common';
import { ThingsController } from './things.controller';
import { ThingsService } from './things.service';

@Module({
  controllers: [ThingsController],
  providers: [ThingsService],
  exports: [ThingsService],
})
export class ThingsModule {}
```

A new module is added to `AppModule`'s `imports`. `PrismaService`, `AuditService` and `RateLimitService` are global — their modules do not need to be imported.

---

## 5. SOLID applied to this code

Not abstract — what concretely counts as a violation in review.

**S — Single Responsibility.** A controller changes when the HTTP contract changes; a service changes when business rules change. A controller that calls `this.prisma…` itself or assembles a response from several queries breaks the rule, even if the code is short. A "god" service is split into services within its module (`auth.service.ts` + `sessions.service.ts` + `two-factor.service.ts`, `users.service.ts` + `saved-items.service.ts`).

**O — Open/Closed.** A new sign-in method or a new access check is added as a new Passport strategy, guard or decorator, not as `if (provider === 'google')` inside an existing method.

**L — Liskov.** Guards and interceptors implement the Nest interfaces (`CanActivate`, `NestInterceptor`) faithfully and do not change the meaning of a response unexpectedly: an interceptor does not swallow errors, a guard does not write to the response itself — it refuses with an exception.

**I — Interface Segregation.** A module exports only the services others need, not everything. Services receive narrow arguments (`userId`, `ClientContext`), not the whole `request`.

**D — Dependency Inversion.** Dependencies arrive through the constructor and the Nest DI container. `new SomeService()` inside another service, reading `process.env` in business code bypassing `ConfigService` (currently `process.env` is read only by `main.ts`, `configuration.ts` and infrastructure — `app.module.ts`, `prisma.service.ts`), or accessing the database bypassing `PrismaService` are violations.

### 5.1 What a machine checks and what review checks

| Principle                      | Checked by                                                |
| ------------------------------ | --------------------------------------------------------- |
| Types, incompatible signatures | `pnpm typecheck` (`tsc --noEmit` after `prisma generate`) |
| Unresolved imports             | `pnpm knip`                                               |
| Input validation               | runtime: `ValidationPipe` with `forbidNonWhitelisted`     |
| Layers and domain boundaries   | **review only** — the project has no architecture linter  |
| **S**, **O**, **I**            | review only                                               |

`apps/backend/tsconfig.json` inherits `strict: true` from `@viratec/tsconfig` — do not disable anything from strict mode. Required DTO fields are declared with `!:` (`title!: string`): `ValidationPipe` fills them, not a constructor.

---

## 6. Data model

Schema — `prisma/schema.prisma`. Tables are snake_case via `@@map`, fields are camelCase, primary keys are `String @id @default(uuid())`, entities have `createdAt`/`updatedAt`. Indexes match real list queries (`@@index([createdAt])`, `@@index([authorId])`); pair uniqueness uses `@@unique` (`SavedItem`, `PostLike`).

- Prisma enums are mirrored in `packages/contracts/src/enums.ts` — change them together.
- Translations and composite content live in `Json` fields (`Project.translations`, `Event.translations`, `Publication.content`). When read, JSON is validated with a zod schema from contracts (`ProjectTranslationsSchema.parse` in `projects.service.ts`), not cast with `as`.
- The type of a row with `include` is derived from Prisma: `Prisma.ProjectGetPayload<{ include: … }>`, not written by hand.
- Related records that must change atomically go into `this.prisma.$transaction(...)`.
- Secrets and internal fields (password hashes, tokens, TOTP) never leave the API: an account goes out only through `toAccount` from `security/account.ts`, a public profile through `PUBLIC_PROFILE_SELECT` in `users/public-profile.ts`, everything else through an explicit `select`.

---

## 7. DTOs and validation

- Body, query and params are described by DTO classes with `class-validator` and `@ApiProperty`/`@ApiPropertyOptional`. Numbers from the query use `@Type(() => Number)`.
- UUID params use `ParseUUIDPipe`.
- Length and count limits (`@MaxLength`, `@ArrayMaxSize`) are mandatory for any user text and array.
- The global `ValidationPipe` is already configured (`whitelist`, `forbidNonWhitelisted`, `transform`) — do not create local pipes with different behavior.
- Arbitrary JSON from the client (links, profile languages) is additionally checked with a zod schema from `@viratec/contracts` (`parseWith` in `users.service.ts`) — one schema for frontend and backend.
- A shape both ends see is described in `@viratec/contracts`; the backend DTO matches it rather than silently diverging.

---

## 8. Errors

Throw standard NestJS exceptions from services and guards. `AllExceptionsFilter` catches them and returns `{ statusCode, timestamp, path, error }` — see [`../api-contract.md`](../api-contract.md#errors).

```ts
throw new NotFoundException(`Project with ID ${id} not found`);
throw new ForbiddenException({
  message: 'Two-factor verification required',
  code: 'STEP_UP_REQUIRED',
});
```

- When the frontend must distinguish the reason for a refusal, pass `{ message, code }` with an `UPPER_SNAKE_CASE` code and declare a union type of codes next to it (`StaffAccessErrorCode` in `staff.guard.ts`).
- Never return internal exception text, stack traces or Prisma details to the client: an unknown error is a 500 with `Internal server error`, details go only to the log.
- No `try/catch` just to return `null` instead of an error. Catching makes sense for known Prisma errors (for example `P2002` uniqueness) to turn them into a meaningful 4xx.

---

## 9. Security

- **Authentication** — `JwtAuthGuard` / `OptionalJwtAuthGuard`, the user via `@CurrentUser()` (type `AuthenticatedUser` — `security/authenticated-user.ts`).
- **Roles and permissions** — `RolesGuard` + `@Roles(...)` for `UserRole`; the admin panel — `StaffGuard` + `@RequirePermissions(...)` (`AdminPermission`), `@OwnerOnly()`, `@RequireStepUp()` from `common/decorators/staff.decorator.ts`.
- **CSRF** — checked in `main.ts` for unsafe methods when session cookies are present. New mutating endpoints do nothing extra, but must not bypass the check.
- **Session cookies** — only through the helpers in `auth/session-cookies.ts`.
- **Rate limiting** — `RateLimitService.consume(key, { limit, windowMs })` on sensitive actions (sign-in, registration, 2FA, step-up). Rules live in `RATE_LIMITS` (`security/rate-limit.service.ts`); a new rule is added there. Stored in Postgres.
- **Audit** — `AuditService.record({ action, actorId, targetType, targetId, metadata, client })` on account actions and admin actions. `client` (`ClientContext`) comes from the `@Client()` decorator in the controller.
- **Secrets** — only from env through `configuration.ts`; in production a missing secret is a startup error, not a silent fallback. Request headers and `set-cookie` are masked in logs (`redact` in `app.module.ts`); never log tokens or passwords by hand.
- **Comparing secrets** — `safeEqual` from `security/crypto.ts`, not `===`.

---

## 10. Caching

- Public list and detail `GET`s — `TtlCache` in the service (30 seconds) + `PublicCacheInterceptor` on the route.
- Any mutation that affects cached data clears that service's cache (`listCache.clear()`, `itemCache.clear()`).
- User-dependent responses are not cached in `TtlCache` and are not marked with `PublicCacheInterceptor`.
- The cache lives in the memory of a single instance (Vercel runs several) — it is a speed-up, not a source of truth.

---

## 11. Migrations

Every `schema.prisma` change is a new migration in `prisma/migrations/<timestamp>_<name>/migration.sql`. Read the generated SQL before committing: Prisma does not see renames and proposes `DROP` + `ADD` instead of `ALTER ... RENAME`, which loses data. Data migrations (backfills, value moves) are written in the SQL of the same migration or as a separate migration, like `content_seed`.

- Applying — `pnpm --filter @viratec/backend db:migrate` (`prisma migrate deploy`); on Vercel it runs during the API build.
- After editing the schema — `pnpm --filter @viratec/backend db:generate`, otherwise the `@prisma/client` types are stale.
- Already applied migrations are never edited.

---

## 12. Code style and tooling

The tooling is shared with the frontend and runs from the root:

```bash
pnpm validate   # EOL + env template + types + lint + knip — before pushing
pnpm lint:fix   # fix auto-fixable Oxlint issues
pnpm format     # Prettier
```

Backend-only:

```bash
pnpm --filter @viratec/backend typecheck   # prisma generate + tsc --noEmit
pnpm --filter @viratec/backend lint        # oxlint
pnpm --filter @viratec/backend build       # contracts + prisma generate + nest build
pnpm dev:backend                           # nest start --watch, port 3000
```

- **Oxlint** — linter, **Prettier** — formatting (100 characters, single quotes, semicolons, trailing commas).
- Backend modules are CommonJS (`module: commonjs`); `@viratec/contracts` is imported from the contracts' built `dist`, so after changing contracts they must be built (`pnpm --filter @viratec/contracts build`; the backend `build` does this itself).
- Swagger: `@ApiTags` on the controller, `@ApiOperation` on every endpoint, `@ApiResponse` for codes other than 200 (404, 401, 403…), `@ApiProperty`/`@ApiPropertyOptional` on every DTO field, `@ApiBearerAuth()` on protected routes.
- Logging — `new Logger(ClassName.name)` from `@nestjs/common` (pino under the hood), not `console.log`.

---

## 13. Tests

`pnpm --filter @viratec/backend test` = `pnpm build` + `tsc -p tsconfig.tests.json` + `node --test tests/*.test.ts`. TypeScript tests run directly in Node (type stripping, requires Node 22.18+); types are checked by `tsconfig.tests.json` (`allowJs` infers types from the built `dist`, so the check runs after the build, not in `pnpm typecheck`). Built-in `node:test` + `node:assert/strict`; tests import modules from the built `dist` and check pure functions and individual classes (avatar, exception filter, Google sign-in, registration, profile privacy, admin security). No real database is started in tests. Backend tests are not run in CI yet — run them locally if you touch covered code.

Imports are ESM with an explicit extension (`../dist/users/avatar.js`, `./support.ts`). HTTP error checks use `hasStatus` and `hasCode` from `tests/support.ts`; Prisma fakes are described with local interfaces, no `any`.

---

## 14. Still undecided

- Redis is declared in config and in `docker-compose.*` but unused; MinIO and Kubernetes are mentioned only in docs. A decision about them is a separate task.
- Storage for files other than avatars in Postgres has not been chosen.
- There is no architecture linter (module boundaries) — review holds them.

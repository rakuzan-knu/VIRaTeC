# Frontend ↔ backend API contract

The source of truth is the code: controllers in `apps/backend/src/**/*.controller.ts`, DTOs in `dto/`, shared types in `packages/contracts`. Interactive docs — Swagger at `/docs` (enabled outside production or with `SWAGGER_ENABLED=true`). This file describes the rules shared by all endpoints and the route map; for body shapes see DTOs and contracts, do not duplicate them here.

## Basics

- Global prefix — `/api/v1` (`app.setGlobalPrefix('api/v1')` in `main.ts`). Exception — Swagger at `/docs`.
- On the frontend the base URL is `ENV.API_BASE_URL` (`VITE_API_BASE_URL`, default `http://localhost:3000/api/v1`). In dev, Vite proxies `/api` to `http://localhost:3000`.
- Every frontend request goes through `api` from `apps/web/src/shared/api/apiClient.ts`. Do not write your own `fetch` to the API: the client sets the CSRF header, sends cookies, refreshes the session on 401 and unwraps the envelope.

## Response envelope

`TransformInterceptor` wraps every successful response in `{ data }`. If a service already returned an object with `data` and `meta` (a cursor page), it is passed through as is.

```json
{ "data": { "id": "…", "title": "…" } }
{ "data": [ … ], "meta": { "nextCursor": "uuid-or-null", "limit": 50 } }
```

`api.get<T>()` on the frontend returns the contents of `data`, so `T` is the payload type, not the envelope. `meta` is dropped: if the frontend ever needs `nextCursor`, that is a change to the client, not a reason to read the response around it.

## Errors

Every exception goes through `AllExceptionsFilter` and is returned in one shape:

```json
{
  "statusCode": 403,
  "timestamp": "…",
  "path": "/api/v1/admin/users",
  "error": { "message": "…", "code": "PERMISSION_DENIED" }
}
```

- Services throw standard NestJS exceptions (`NotFoundException`, `ForbiddenException`, `BadRequestException`, …). When the frontend must tell reasons apart, the exception receives a `{ message, code }` object — as in `StaffGuard` (`ADMIN_ACCESS_REQUIRED`, `MFA_REVERIFY_REQUIRED`, `STEP_UP_REQUIRED`, …) or the CSRF check (`CSRF_INVALID`).
- `ValidationPipe` errors arrive in `error.message` as an array of strings.
- On the frontend the code is read with `extractErrorCode` from `apiClient.ts`, not by parsing the message text. `ApiError.status === 0` (`NETWORK_ERROR_STATUS`) means the network is unavailable.

## Input validation

A global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted` and `transform`: an extra field in the body is a 400, not silently dropped. Bodies and queries are described by DTO classes with `class-validator` and `@ApiProperty`. Enums come from `@viratec/contracts`.

## Authentication and CSRF

- The session lives in httpOnly cookies (`vt_at` access for 15 minutes, `vt_rt` refresh for 7 days, `vt_mfa` for the second factor; in secure mode with `__Host-`/`__Secure-` prefixes). Names — `cookieNames` in `apps/backend/src/auth/session-cookies.ts`.
- For `POST`/`PUT`/`PATCH`/`DELETE` under `/api/`, when session cookies are present, the `X-CSRF-Token` header must equal the `vt_csrf` cookie. The token is issued by `GET /api/v1/auth/csrf`. A request with only `Authorization: Bearer` and no session cookies is exempt from this check.
- Guards: `JwtAuthGuard` (sign-in required), `OptionalJwtAuthGuard`, `RolesGuard` + `@Roles`, `StaffGuard` + `@RequirePermissions`, `@OwnerOnly`, `@RequireStepUp` from `common/decorators/staff.decorator.ts`. The current user — `@CurrentUser()`.

## Pagination

Cursor-based: query `limit` (default 50, max 100 — `LIST_PAGE_LIMITS`) and `cursor` (the UUID from the previous page's `meta.nextCursor`), DTO — `CursorQueryDto`, helpers — `common/pagination/cursor-page.ts`. Ordering is stable: `createdAt desc, id desc`.

## Caching

- Public list and detail `GET`s are marked with `PublicCacheInterceptor` (`Cache-Control` from `PUBLIC_CACHE_CONTROL`) and cached in the service's in-memory `TtlCache` for 30 seconds. A mutation must clear the matching cache (`listCache.clear()`).
- For successful (200) `GET`s the Fastify `onSend` hook sets a weak `ETag` and answers 304 on a matching `If-None-Match`.

## Endpoint map

All paths are under `/api/v1`.

| Module                           | Paths                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `health`                         | `GET /health`, `GET /health/ready`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `auth`                           | `GET /auth/csrf`, `GET /auth/me`, `POST /auth/register`, `/login`, `/google`, `/refresh`, `/logout`, `/logout-all`, `/change-password`, `/step-up`, `/email/verify`, `/email/resend`, `/password/forgot`, `/password/reset`; `POST`/`DELETE /auth/google/link`; `POST /auth/2fa/verify`, `/2fa/setup`, `/2fa/enable`, `/2fa/disable`, `/2fa/backup-codes`; `GET`/`DELETE /auth/sessions`, `DELETE /auth/sessions/:sessionId`                                                                                                                                               |
| `users`                          | `GET /users`, `GET /users/:id`, `GET /users/:id/avatar`; `PATCH /users/me`, `PATCH /users/me/privacy`, `GET /users/me/export`, `DELETE /users/me`; `PUT`/`DELETE /users/me/avatar`                                                                                                                                                                                                                                                                                                                                                                                         |
| `users/me/saved`                 | `GET`, `PUT`, `DELETE`, `DELETE /all`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `projects`, `research`, `events` | `GET /`, `GET /:id`, `POST /`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `publications`                   | `GET /publications`, `GET /publications/:slug`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `community`                      | `GET /community`, `GET /community/:id`, `POST /community`, `POST /community/:id/like`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `content`                        | `GET /content/entries?types=a,b` — a proxy to the Contentful Delivery API, 503 if Contentful is not configured or unavailable                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `admin`                          | `GET /admin/me`, `/metrics`, `/users`, `/audit`; `PUT`/`DELETE /admin/users/:id/access`; `POST /admin/users/:id/block`, `/users/:id/sessions/revoke`, `/ownership/transfer`                                                                                                                                                                                                                                                                                                                                                                                                |
| `admin/content`                  | `GET /admin/content/preview`, `/entries/:id`, `/entries/:id/references`, `/assets/:id`, `/changes`, `/revisions` (published versions); `POST /revisions/restore` (a version back as a draft); `PUT`/`DELETE /entries/:id` (delete: a draft is archived now, a published entry on publish); `POST /entries`, `/assets`, `/translate` (Claude API, 503 `TRANSLATION_NOT_CONFIGURED` without a key), `/publish` (step-up, valid for the staff session); `DELETE /changes/:id`; `PUT /presence` (heartbeat with the open items, returns other editors active in the last 45 s) |
| `admin/records`                  | `GET /admin/records/drafts`, `GET`/`PUT`/`DELETE /admin/records/:resource/:key`, `POST /admin/records/:resource`                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

## What must ship in one commit

Some pairs drift apart silently:

- **A data shape both ends see** → type/zod schema in `packages/contracts` + backend DTO + type in the frontend's `entities/*/model/types.ts`.
- **An enum** → `apps/backend/prisma/schema.prisma` + `packages/contracts/src/enums.ts` (+ a Prisma migration).
- **An endpoint** (path, body, response, error code) → controller + DTO + Swagger decorators + frontend `api/` function + this file, if a shared rule or the route map changes.
- **A `schema.prisma` change** → a new migration in `apps/backend/prisma/migrations`.

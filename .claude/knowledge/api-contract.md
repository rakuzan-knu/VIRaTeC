# API-контракт фронт↔бек

Источник правды — код: контроллеры `apps/backend/src/**/*.controller.ts`, DTO в `dto/`, общие типы в `packages/contracts`. Интерактивная документация — Swagger на `/docs` (включён вне прода или при `SWAGGER_ENABLED=true`). Этот файл описывает правила, общие для всех эндпоинтов, и карту маршрутов; формы тел смотри в DTO и контрактах, не дублируй их здесь.

## База

- Глобальный префикс — `/api/v1` (`app.setGlobalPrefix('api/v1')` в `main.ts`). Исключение — Swagger на `/docs`.
- На фронте базовый URL — `ENV.API_BASE_URL` (`VITE_API_BASE_URL`, по умолчанию `http://localhost:3000/api/v1`). В dev Vite проксирует `/api` на `http://localhost:3000`.
- Все запросы фронта — только через `api` из `apps/web/src/shared/api/apiClient.ts`. Свой `fetch` к API не пиши: клиент сам ставит CSRF-заголовок, шлёт куки, обновляет сессию на 401 и разворачивает конверт.

## Конверт ответа

`TransformInterceptor` оборачивает любой успешный ответ в `{ data }`. Если сервис уже вернул объект с `data` и `meta` (курсорная страница), он остаётся как есть.

```json
{ "data": { "id": "…", "title": "…" } }
{ "data": [ … ], "meta": { "nextCursor": "uuid-or-null", "limit": 50 } }
```

`api.get<T>()` на фронте возвращает содержимое `data`, поэтому `T` — тип полезной нагрузки, а не конверта. `meta` при этом отбрасывается: если фронту понадобится `nextCursor`, это изменение клиента, а не повод читать ответ мимо него.

## Ошибки

Любое исключение проходит через `AllExceptionsFilter` и отдаётся в одной форме:

```json
{
  "statusCode": 403,
  "timestamp": "…",
  "path": "/api/v1/admin/users",
  "error": { "message": "…", "code": "PERMISSION_DENIED" }
}
```

- В сервисах бросаются стандартные исключения NestJS (`NotFoundException`, `ForbiddenException`, `BadRequestException`, …). Когда фронту нужно различать причины, в исключение передаётся объект `{ message, code }` — как в `StaffGuard` (`ADMIN_ACCESS_REQUIRED`, `MFA_REVERIFY_REQUIRED`, `STEP_UP_REQUIRED`, …) или в CSRF-проверке (`CSRF_INVALID`).
- Ошибки валидации `ValidationPipe` приходят в `error.message` массивом строк.
- На фронте код читается через `extractErrorCode` из `apiClient.ts`, а не разбором текста сообщения. `ApiError.status === 0` (`NETWORK_ERROR_STATUS`) — сеть недоступна.

## Валидация входа

Глобальный `ValidationPipe` с `whitelist`, `forbidNonWhitelisted` и `transform`: лишнее поле в теле — 400, а не молча отброшенное. Тела и query описываются DTO-классами с `class-validator` и `@ApiProperty`. Перечисления берутся из `@viratec/contracts`.

## Аутентификация и CSRF

- Сессия — в httpOnly-куках (`vt_at` доступ на 15 минут, `vt_rt` обновление на 7 дней, `vt_mfa` для второго фактора; в secure-режиме с префиксами `__Host-`/`__Secure-`). Имена — `cookieNames` в `apps/backend/src/auth/session-cookies.ts`.
- Для `POST`/`PUT`/`PATCH`/`DELETE` под `/api/` при наличии сессионных кук обязателен заголовок `X-CSRF-Token`, равный куке `vt_csrf`. Токен выдаёт `GET /api/v1/auth/csrf`. Запрос только с `Authorization: Bearer` без сессионных кук от этой проверки освобождён.
- Guard'ы: `JwtAuthGuard` (обязательный вход), `OptionalJwtAuthGuard`, `RolesGuard` + `@Roles`, `StaffGuard` + `@RequirePermissions`, `@OwnerOnly`, `@RequireStepUp` из `common/decorators/staff.decorator.ts`. Текущий пользователь — `@CurrentUser()`.

## Пагинация

Курсорная: query `limit` (по умолчанию 50, максимум 100 — `LIST_PAGE_LIMITS`) и `cursor` (UUID из `meta.nextCursor` прошлой страницы), DTO — `CursorQueryDto`, хелперы — `common/pagination/cursor-page.ts`. Сортировка стабильная: `createdAt desc, id desc`.

## Кэширование

- Публичные `GET` списков и карточек помечаются `PublicCacheInterceptor` (`Cache-Control` из `PUBLIC_CACHE_CONTROL`) и кэшируются в памяти сервиса `TtlCache` на 30 секунд. Мутация обязана сбрасывать соответствующий кэш (`listCache.clear()`).
- На успешные (200) `GET` Fastify-хук `onSend` ставит слабый `ETag` и отвечает 304 на совпавший `If-None-Match`.

## Карта эндпоинтов

Все пути — под `/api/v1`.

| Модуль                           | Пути                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `health`                         | `GET /health`, `GET /health/ready`                                                                                                                                                                                                                                                                                                                  |
| `auth`                           | `GET /auth/csrf`, `GET /auth/me`, `POST /auth/register`, `/login`, `/google`, `/refresh`, `/logout`, `/logout-all`, `/change-password`, `/step-up`; `POST`/`DELETE /auth/google/link`; `POST /auth/2fa/verify`, `/2fa/setup`, `/2fa/enable`, `/2fa/disable`, `/2fa/backup-codes`; `GET`/`DELETE /auth/sessions`, `DELETE /auth/sessions/:sessionId` |
| `users`                          | `GET /users`, `GET /users/:id`, `GET /users/:id/avatar`; `PATCH /users/me`, `PATCH /users/me/privacy`, `GET /users/me/export`, `DELETE /users/me`; `PUT`/`DELETE /users/me/avatar`                                                                                                                                                                  |
| `users/me/saved`                 | `GET`, `PUT`, `DELETE`, `DELETE /all`                                                                                                                                                                                                                                                                                                               |
| `projects`, `research`, `events` | `GET /`, `GET /:id`, `POST /`                                                                                                                                                                                                                                                                                                                       |
| `publications`                   | `GET /publications`, `GET /publications/:slug`                                                                                                                                                                                                                                                                                                      |
| `community`                      | `GET /community`, `GET /community/:id`, `POST /community`, `POST /community/:id/like`                                                                                                                                                                                                                                                               |
| `content`                        | `GET /content/entries?types=a,b` — прокси Contentful Delivery API, 503 если Contentful не настроен или недоступен                                                                                                                                                                                                                                   |
| `admin`                          | `GET /admin/me`, `/metrics`, `/users`, `/audit`; `PUT`/`DELETE /admin/users/:id/access`; `POST /admin/users/:id/block`, `/users/:id/sessions/revoke`, `/ownership/transfer`                                                                                                                                                                         |

## Что обязано ехать в одном коммите

Есть пары, которые расходятся молча:

- **Форма данных, которую видят оба конца** → тип/zod-схема в `packages/contracts` + DTO бэкенда + тип в `entities/*/model/types.ts` фронта.
- **Enum** → `apps/backend/prisma/schema.prisma` + `packages/contracts/src/enums.ts` (+ миграция Prisma).
- **Эндпоинт** (путь, тело, ответ, код ошибки) → контроллер + DTO + Swagger-декораторы + `api/`-функция на фронте + этот файл, если меняется общее правило или карта маршрутов.
- **Изменение `schema.prisma`** → новая миграция в `apps/backend/prisma/migrations`.

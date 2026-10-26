# Backend — обзор

Бэкенд лежит в `apps/backend` (`@viratec/backend`). **Фронтенд-агент код здесь не пишет и не меняет без явной просьбы пользователя** — этот файл нужен, чтобы понимать, с чем интегрируется фронт, и не проектировать контракт вслепую.

Если ты пишешь бэкенд — тебе сюда: [**architecture.md**](architecture.md). Там модули NestJS, слои, DI, DTO, ошибки, Prisma и скелеты для копирования. Краткая версия для людей — `docs/architecture/backend-modular.md`.

## Стек

- NestJS 11 на Fastify-адаптере (`@nestjs/platform-fastify`, Fastify 5)
- `class-validator` + `class-transformer` — валидация DTO через глобальный `ValidationPipe`; zod из `@viratec/contracts` — для JSON-полей и общих схем
- PostgreSQL + Prisma 6 (`prisma/schema.prisma`, миграции `prisma/migrations`, `prisma.config.ts`)
- `@nestjs/config` — конфиг из env (`src/config/configuration.ts`)
- `@nestjs/jwt` + Passport (`passport-jwt`) — аутентификация, `argon2` — хеши паролей, `google-auth-library` — вход через Google
- `nestjs-pino` — логирование, `@nestjs/swagger` — OpenAPI на `/docs`, `@nestjs/terminus` — health-checks
- `@fastify/helmet`, `@fastify/compress`, `@fastify/cookie`

## Где работает

- **Прод** — Vercel (сервис `api` в `vercel.json`, `framework: nestjs`) и Neon Postgres, регион Франкфурт. При сборке выполняется `prisma migrate deploy`. Neon создаёт отдельную ветку базы на каждое превью. Подробно — `docs/deployment/vercel.md`.
- **Локально** — `pnpm docker:dev:up` поднимает Postgres (и Redis) из `docker-compose.dev.yml`, потом `pnpm dev:backend` (`nest start --watch`) на порту 3000. Env — `.env` в корне (шаблон `.env.example`).

Из-за Vercel бэкенд фактически stateless между запросами: in-memory кэш (`TtlCache`) и таймеры живут только в рамках одного инстанса. Rate limit и аудит поэтому хранятся в Postgres (`RateLimitBucket`, `AuditLog`), а не в памяти.

## Архитектура в двух словах

Модульный монолит: один модуль NestJS на домен (`auth`, `users`, `projects`, `research`, `events`, `publications`, `community`, `content`, `admin`, `health`), инфраструктура — в глобальных `PrismaModule` и `SecurityModule` и в `src/common`. Все ответы — в конверте `{ data }`, все ошибки — в форме `AllExceptionsFilter`. Контракт с фронтом — [`../api-contract.md`](../api-contract.md), модель данных — [`../product.md`](../product.md#модель-данных).

## Что не специфицировано

- Redis, MinIO и Kubernetes упоминаются в `README.md`, `CONTRIBUTING.md` и `docker-compose.*`, но кодом бэкенда не используются (Redis только объявлен в конфиге). Не вводи их в код без задачи.
- Загрузка файлов, кроме аватара (он хранится в Postgres, `UserAvatar`), не реализована.

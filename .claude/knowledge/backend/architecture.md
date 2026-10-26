# Backend — архитектура и правила написания кода

Рабочий документ для того, кто пишет бэкенд VIRaTeC (человек или ИИ). Читается сверху вниз: сначала что строим, потом жёсткие правила, потом скелеты кода, которые можно копировать.

Продукт описан в [`../product.md`](../product.md), контракт с фронтендом — в [`../api-contract.md`](../api-contract.md). Здесь **не дублируются** формы запросов и ответов: что отдаёт `GET /api/v1/projects`, смотри в DTO, контрактах и Swagger.

---

## 0. За 30 секунд

API платформы VIRaTeC: аккаунты и безопасность (сессии в куках, 2FA, Google, аудит, rate limit), каталоги проектов, исследований, событий и публикаций, сохранённое, сообщество, админка и прокси к Contentful.

Почти всё — синхронный CRUD поверх Postgres через Prisma. Фоновых очередей нет; единственная периодическая работа — `CleanupService` (чистка истёкших токенов и бакетов) на `setInterval`.

---

## 1. Стек (зафиксирован)

| Что                  | Чем                                                                  |
| -------------------- | -------------------------------------------------------------------- |
| HTTP                 | NestJS 11 + `@nestjs/platform-fastify` (Fastify 5)                   |
| Валидация входа      | `class-validator` + `class-transformer`, глобальный `ValidationPipe` |
| Общие схемы и enum'ы | `@viratec/contracts` (zod)                                           |
| БД                   | PostgreSQL (прод — Neon)                                             |
| ORM и миграции       | Prisma 6                                                             |
| Конфиг               | `@nestjs/config` + `src/config/configuration.ts`                     |
| Аутентификация       | `@nestjs/jwt`, Passport JWT, `argon2`, `google-auth-library`         |
| Логи                 | `nestjs-pino`                                                        |
| Документация         | `@nestjs/swagger`                                                    |

Всё, что ходит в сеть или в БД, — `async`. Синхронные блокирующие вызовы (`fs.*Sync`, `crypto.*Sync` на больших данных, `execSync`) в обработчиках запросов не появляются.

---

## 2. Три правила, которые не обсуждаются

### 2.1 Слои и направление зависимостей

```
Controller  →  Service  →  PrismaService (@prisma/client)
     ↑
    DTO (class-validator)        Guards / Interceptors / Filters — src/common
```

- **Controller** знает про HTTP: маршрут, метод, guard'ы, декораторы параметров, DTO, Swagger. Не содержит бизнес-логики и не обращается к `PrismaService` (единственное исключение — `health.controller.ts`, где `SELECT 1` и есть проверка готовности).
- **Service** знает про бизнес-правила и данные: запросы Prisma, проверки, кэш, аудит. Не знает про Fastify `request`/`reply` — всё нужное из запроса (id пользователя, `ClientContext`) приходит аргументами через декораторы контроллера.
- **PrismaService** — единственная точка доступа к БД, инжектится через DI. `new PrismaClient()` в коде приложения не создаётся (исключение — CLI-скрипт `src/cli/assign-owner.ts`, который работает вне Nest).

Отдельного слоя репозиториев в проекте нет: сервис работает с `PrismaService` напрямую. Не вводи его ради одной задачи — это новый паттерн на весь бэкенд. Повторяющиеся `select`/`include` выносятся в константы модуля с `satisfies Prisma.<Model>Select` (`LEAD_SELECT` в `projects.service.ts`), повторяющиеся куски логики — в функции рядом с сервисом (`users/public-profile.ts`); то, что нужно нескольким доменам, — в `security/` или `common/` (`security/account.ts`).

### 2.2 Модуль = домен

Каждый домен — модуль NestJS со своими контроллерами, сервисами и DTO. Модуль экспортирует только то, что реально нужно другим модулям (`exports: [ProjectsService]`). Чужой сервис используется только через импорт его модуля в `imports`, а не через `new` и не через прямой импорт приватных файлов. Глобальные модули — только инфраструктура: `PrismaModule`, `SecurityModule`, `ConfigModule`.

### 2.3 SOLID

Не как мантра, а как проверка при ревью — конкретно для этого проекта, см. раздел 5.

---

## 3. Структура каталогов

```
apps/backend/
├── prisma/
│   ├── schema.prisma            # модель данных
│   └── migrations/              # миграции Prisma, по одной папке на изменение
├── prisma.config.ts             # путь к схеме и миграциям, загрузка .env
├── src/
│   ├── main.ts                  # сборка Fastify-приложения: плагины, CSRF, CORS, префикс, pipes, filter, interceptor, Swagger
│   ├── app.module.ts            # корневой модуль: Config, Logger, все домены
│   ├── config/configuration.ts  # чтение и проверка env
│   ├── prisma/                  # НЕ домен: PrismaModule (@Global) + PrismaService
│   ├── security/                # НЕ домен: @Global — AuditService, RateLimitService, CleanupService, crypto, staff, account (toAccount), authenticated-user
│   ├── common/                  # НЕ домен: общая инфраструктура HTTP
│   │   ├── guards/              # JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard, StaffGuard
│   │   ├── decorators/          # @CurrentUser, @Roles, @RequirePermissions/@OwnerOnly/@RequireStepUp, @Client
│   │   ├── filters/             # AllExceptionsFilter
│   │   ├── interceptors/        # TransformInterceptor, PublicCacheInterceptor
│   │   ├── pagination/          # курсорная пагинация
│   │   ├── dto/                 # CursorQueryDto
│   │   └── cache/               # TtlCache
│   ├── auth/                    # ДОМЕН: вход, регистрация, сессии, 2FA, Google
│   ├── users/                   # ДОМЕН: профиль, приватность, аватар, экспорт, сохранённое
│   ├── projects/ research/ events/ publications/ community/
│   ├── content/                 # ДОМЕН: прокси Contentful Delivery API
│   ├── admin/                   # ДОМЕН: админка сотрудников
│   ├── health/                  # health-checks
│   └── cli/                     # разовые скрипты вне HTTP (assign-owner)
└── tests/                       # node:test по собранному dist, см. § 13
```

Внутри домена:

```
projects/
├── dto/
│   ├── create-project.dto.ts
│   └── list-projects-query.dto.ts
├── projects.controller.ts
├── projects.service.ts
└── projects.module.ts
```

Файлы — kebab-case с суффиксом роли (`*.controller.ts`, `*.service.ts`, `*.module.ts`, `*.dto.ts`, `*.guard.ts`, `*.decorator.ts`), классы — PascalCase с тем же суффиксом.

**Правило междоменных импортов:** домен берёт у другого домена только его экспортированный сервис (через модуль) или его DTO/типы. Общее для нескольких доменов уходит в `common/`, `security/` или `@viratec/contracts`, а не импортируется из чужой папки.

---

## 4. Скелет модуля — для копирования

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
  title: string;

  @ApiProperty({ enum: EventType, required: false })
  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;
}
```

Список с пагинацией расширяет `CursorQueryDto` из `common/dto/cursor-query.dto.ts`, а не объявляет `limit`/`cursor` заново.

### 4.2 Сервис

`Thing` — плейсхолдер модели Prisma, подставь свою.

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

### 4.3 Контроллер

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

### 4.4 Модуль и регистрация

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

Новый модуль добавляется в `imports` `AppModule`. `PrismaService`, `AuditService` и `RateLimitService` глобальные — их модули импортировать не нужно.

---

## 5. SOLID применительно к этому коду

Не абстрактно, а что конкретно считается нарушением на ревью.

**S — Single Responsibility.** Контроллер меняется, когда меняется HTTP-контракт; сервис — когда меняются бизнес-правила. Контроллер, который сам зовёт `this.prisma…` или собирает ответ из нескольких запросов, нарушает правило, даже если код короткий. Сервис-«бог» на всё подряд дробится на сервисы внутри модуля (`auth.service.ts` + `sessions.service.ts` + `two-factor.service.ts`, `users.service.ts` + `saved-items.service.ts`).

**O — Open/Closed.** Новый способ входа или новая проверка доступа добавляется новой стратегией Passport, guard'ом или декоратором, а не `if (provider === 'google')` внутри существующего метода.

**L — Liskov.** Guard'ы и interceptor'ы честно реализуют интерфейсы Nest (`CanActivate`, `NestInterceptor`) и не меняют смысл ответа неожиданным образом: interceptor не глотает ошибки, guard не пишет в ответ сам — он отказывает исключением.

**I — Interface Segregation.** Модуль экспортирует только нужные другим сервисы, а не всё подряд. В сервис передаются узкие аргументы (`userId`, `ClientContext`), а не весь `request`.

**D — Dependency Inversion.** Зависимости приходят через конструктор и DI-контейнер Nest. `new SomeService()` внутри другого сервиса, чтение `process.env` в бизнес-коде мимо `ConfigService` (сейчас `process.env` читают только `main.ts`, `configuration.ts` и инфраструктура — `app.module.ts`, `prisma.service.ts`), обращение к БД мимо `PrismaService` — нарушения.

### 5.1 Что из этого проверяет машина, а что — ревью

| Принцип                       | Чем проверяется                                           |
| ----------------------------- | --------------------------------------------------------- |
| Типы, несовместимые сигнатуры | `pnpm typecheck` (`tsc --noEmit` после `prisma generate`) |
| Неразрешённые импорты         | `pnpm knip`                                               |
| Валидация входа               | рантайм: `ValidationPipe` с `forbidNonWhitelisted`        |
| Слои и границы доменов        | **только ревью** — архитектурного линтера в проекте нет   |
| **S**, **O**, **I**           | только ревью                                              |

`apps/backend/tsconfig.json` наследует `strict: true` из `@viratec/tsconfig` — ничего из строгого режима не отключай. Обязательные поля DTO объявляются с `!:` (`title!: string`): их заполняет `ValidationPipe`, а не конструктор.

---

## 6. Модель данных

Схема — `prisma/schema.prisma`. Таблицы называются в snake_case через `@@map`, поля — camelCase, первичные ключи — `String @id @default(uuid())`, у сущностей есть `createdAt`/`updatedAt`. Индексы — под реальные запросы списков (`@@index([createdAt])`, `@@index([authorId])`); уникальность пар — `@@unique` (`SavedItem`, `PostLike`).

- Enum'ы Prisma зеркалятся в `packages/contracts/src/enums.ts` — менять синхронно.
- Переводы и составной контент лежат в `Json`-полях (`Project.translations`, `Event.translations`, `Publication.content`). При чтении JSON валидируется zod-схемой из контрактов (`ProjectTranslationsSchema.parse` в `projects.service.ts`), а не приводится через `as`.
- Тип строки с `include` выводится из Prisma: `Prisma.ProjectGetPayload<{ include: … }>`, а не описывается вручную.
- Связанные записи, которые должны меняться атомарно, — в `this.prisma.$transaction(...)`.
- Наружу не отдаются секреты и служебные поля (хеши паролей, токены, TOTP): аккаунт — только через `toAccount` из `security/account.ts`, публичный профиль — через `PUBLIC_PROFILE_SELECT` в `users/public-profile.ts`, остальное — через явный `select`.

---

## 7. DTO и валидация

- Тело, query и параметры описываются DTO-классами с `class-validator` и `@ApiProperty`/`@ApiPropertyOptional`. Числа из query — через `@Type(() => Number)`.
- UUID-параметры — `ParseUUIDPipe`.
- Ограничения длины и количества (`@MaxLength`, `@ArrayMaxSize`) обязательны для любого пользовательского текста и массивов.
- Глобальный `ValidationPipe` уже настроен (`whitelist`, `forbidNonWhitelisted`, `transform`) — не создавай локальные pipes с другим поведением.
- Произвольный JSON от клиента (ссылки, языки профиля) дополнительно проверяется zod-схемой из `@viratec/contracts` (`parseWith` в `users.service.ts`) — одна схема на фронт и бэк.
- Форма, которую видят оба конца, описывается в `@viratec/contracts`; DTO бэкенда ей соответствует, а не расходится молча.

---

## 8. Ошибки

Бросай стандартные исключения NestJS из сервисов и guard'ов. Их ловит `AllExceptionsFilter` и отдаёт в форме `{ statusCode, timestamp, path, error }` — см. [`../api-contract.md`](../api-contract.md#ошибки).

```ts
throw new NotFoundException(`Project with ID ${id} not found`);
throw new ForbiddenException({
  message: 'Two-factor verification required',
  code: 'STEP_UP_REQUIRED',
});
```

- Когда фронт должен различать причину отказа, передавай `{ message, code }` с кодом в `UPPER_SNAKE_CASE` и заводи union-тип кодов рядом (`StaffAccessErrorCode` в `staff.guard.ts`).
- Не отдавай клиенту текст внутренних исключений, стек и детали Prisma: неизвестная ошибка — 500 с `Internal server error`, подробности — только в лог.
- `try/catch` ради того, чтобы вернуть `null` вместо ошибки, — нет. Ловить имеет смысл известные ошибки Prisma (например, `P2002` уникальности) и переводить их в осмысленный 4xx.

---

## 9. Безопасность

- **Аутентификация** — `JwtAuthGuard` / `OptionalJwtAuthGuard`, пользователь — `@CurrentUser()` (тип `AuthenticatedUser` — `security/authenticated-user.ts`).
- **Роли и права** — `RolesGuard` + `@Roles(...)` для `UserRole`; админка — `StaffGuard` + `@RequirePermissions(...)` (`AdminPermission`), `@OwnerOnly()`, `@RequireStepUp()` из `common/decorators/staff.decorator.ts`.
- **CSRF** — проверка в `main.ts` для небезопасных методов при наличии сессионных кук. Новые мутирующие эндпоинты ничего дополнительно не делают, но и не должны обходить проверку.
- **Куки сессии** — только через хелперы `auth/session-cookies.ts`.
- **Rate limit** — `RateLimitService.consume(key, { limit, windowMs })` на чувствительных действиях (вход, регистрация, 2FA, step-up). Правила — в `RATE_LIMITS` (`security/rate-limit.service.ts`), новое правило добавляется туда же. Хранится в Postgres.
- **Аудит** — `AuditService.record({ action, actorId, targetType, targetId, metadata, client })` на действиях с аккаунтом и админских действиях. `client` (`ClientContext`) — из декоратора `@Client()` в контроллере.
- **Секреты** — только из env через `configuration.ts`; в проде отсутствие секрета — ошибка старта, а не тихий фолбэк. В логах заголовки запроса и `set-cookie` замаскированы (`redact` в `app.module.ts`), не логируй токены и пароли вручную.
- **Сравнение секретов** — `safeEqual` из `security/crypto.ts`, не `===`.

---

## 10. Кэширование

- Публичные `GET` списков и карточек — `TtlCache` в сервисе (30 секунд) + `PublicCacheInterceptor` на маршруте.
- Любая мутация, влияющая на закэшированные данные, сбрасывает кэш этого сервиса (`listCache.clear()`, `itemCache.clear()`).
- Ответы, зависящие от пользователя, не кэшируются в `TtlCache` и не помечаются `PublicCacheInterceptor`.
- Кэш живёт в памяти одного инстанса (на Vercel их несколько) — это ускорение, а не источник правды.

---

## 11. Миграции

Каждое изменение `schema.prisma` — новая миграция в `prisma/migrations/<timestamp>_<name>/migration.sql`. Сгенерированный SQL читается глазами до коммита: Prisma не видит переименований и предлагает `DROP` + `ADD` вместо `ALTER ... RENAME`, что теряет данные. Data-миграции (заполнение, перенос значений) пишутся в SQL той же миграции или отдельной миграцией, как `content_seed`.

- Применение — `pnpm --filter @viratec/backend db:migrate` (`prisma migrate deploy`); на Vercel выполняется при сборке API.
- После правки схемы — `pnpm --filter @viratec/backend db:generate`, иначе типы `@prisma/client` устарели.
- Уже применённые миграции не редактируются.

---

## 12. Кодстайл и инструменты

Инструменты общие с фронтендом и запускаются из корня:

```bash
pnpm validate   # EOL + шаблон env + типы + линт + knip — перед пушем
pnpm lint:fix   # починить автоисправимое Oxlint
pnpm format     # Prettier
```

По отдельности для бэкенда:

```bash
pnpm --filter @viratec/backend typecheck   # prisma generate + tsc --noEmit
pnpm --filter @viratec/backend lint        # oxlint
pnpm --filter @viratec/backend build       # contracts + prisma generate + nest build
pnpm dev:backend                           # nest start --watch, порт 3000
```

- **Oxlint** — линтер, **Prettier** — форматирование (100 символов, одинарные кавычки, точки с запятой, висячие запятые).
- Модули бэкенда — CommonJS (`module: commonjs`), импорт `@viratec/contracts` идёт из собранного `dist` контрактов, поэтому после правки контрактов нужна их сборка (`pnpm --filter @viratec/contracts build`; `build` бэкенда делает это сам).
- Swagger: `@ApiTags` на контроллер, `@ApiOperation` на каждый эндпоинт, `@ApiResponse` для кодов кроме 200 (404, 401, 403…), `@ApiProperty`/`@ApiPropertyOptional` на каждое поле DTO, `@ApiBearerAuth()` на защищённые маршруты.
- Логирование — `new Logger(ClassName.name)` из `@nestjs/common` (под капотом pino), не `console.log`.

---

## 13. Тесты

`pnpm --filter @viratec/backend test` = `pnpm build` + `tsc -p tsconfig.tests.json` + `node --test tests/*.test.ts`. Тесты на TypeScript запускаются Node напрямую (type stripping, нужен Node 22.18+), типы проверяет `tsconfig.tests.json` (`allowJs` выводит типы из собранного `dist`, поэтому проверка идёт после сборки, а не в `pnpm typecheck`). Встроенный `node:test` + `node:assert/strict`, импортируют модули из собранного `dist` и проверяют чистые функции и отдельные классы (аватар, фильтр исключений, Google-вход, регистрация, приватность профиля, безопасность админки). Реальная БД в тестах не поднимается. В CI бэкенд-тесты сейчас не запускаются — гоняй их локально, если трогаешь покрытый код.

Импорты — ESM с явным расширением (`../dist/users/avatar.js`, `./support.ts`). Проверки HTTP-ошибок — через `hasStatus` и `hasCode` из `tests/support.ts`, фейки Prisma описываются локальными интерфейсами, без `any`.

---

## 14. Что ещё не решено

- Redis объявлен в конфиге и в `docker-compose.*`, но не используется; MinIO и Kubernetes упоминаются только в документации. Решение о них — отдельная задача.
- Хранилище файлов, кроме аватаров в Postgres, не выбрано.
- Архитектурного линтера (границы модулей) нет — держится ревью.

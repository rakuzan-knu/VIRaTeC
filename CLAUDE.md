# VIRaTeC

Сайт и платформа сообщества VIRaTeC (Virtual Innovating Research & Technology Community) при КНУ имени Тараса Шевченко: публичный сайт с проектами, публикациями, людьми и направлениями исследований, плюс аккаунты пользователей, сохранённое, сообщество и админка.

Весь контекст для работы над проектом разложен по темам — не дублируй его здесь, читай по ссылкам:

| Файл                                                                           | О чём                                                                      |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| [product.md](.claude/knowledge/product.md)                                     | что за продукт, страницы и маршруты, модель данных, откуда берётся контент |
| [design-system.md](.claude/knowledge/design-system.md)                         | как применять дизайн-систему из `DESIGN.md` и `UX-CONTRACT.md` в коде      |
| [api-contract.md](.claude/knowledge/api-contract.md)                           | эндпоинты, конверт ответа, формат ошибок, CSRF, пагинация                  |
| [frontend/overview.md](.claude/knowledge/frontend/overview.md)                 | стек, структура монорепо, сборка и пререндер, кодстайл, команды            |
| [frontend/fsd.md](.claude/knowledge/frontend/fsd.md)                           | слои FSD, сегменты, публичный API слайса, правила стилей                   |
| [frontend/state-management.md](.claude/knowledge/frontend/state-management.md) | Zustand против TanStack Query — чей какой кусок состояния                  |
| [frontend/testing.md](.claude/knowledge/frontend/testing.md)                   | тесты фронта: Playwright-проверки UI-кита, что гоняет CI                   |
| [backend/overview.md](.claude/knowledge/backend/overview.md)                   | стек бэкенда и с чем интегрируется фронт                                   |
| [backend/architecture.md](.claude/knowledge/backend/architecture.md)           | модули NestJS, слои, DI, DTO, ошибки, Prisma, скелеты кода                 |
| [CONTRIBUTING.md](CONTRIBUTING.md)                                             | ветки, Conventional Commits, проверки, пул-реквесты                        |

Строки ниже — те же файлы директивами импорта Claude Code. Кликать по ним не нужно и не получится: это не ссылки, а команда подставить содержимое файлов в начало сессии. Кликабельные — в таблице выше. Добавляешь файл в таблицу — добавь и сюда, иначе агент его не прочитает.

@.claude/knowledge/product.md
@.claude/knowledge/design-system.md
@.claude/knowledge/api-contract.md
@.claude/knowledge/frontend/overview.md
@.claude/knowledge/frontend/fsd.md
@.claude/knowledge/frontend/state-management.md
@.claude/knowledge/frontend/testing.md
@.claude/knowledge/backend/overview.md
@.claude/knowledge/backend/architecture.md
@CONTRIBUTING.md

## Расположение кода

Монорепо на pnpm workspaces + Turborepo, всё запускается из корня.

- `apps/web` — фронтенд (`@viratec/web`): React + Vite SPA с пререндером, Feature-Sliced Design, TanStack Query, контент из Contentful.
- `apps/backend` — бэкенд (`@viratec/backend`): NestJS на Fastify-адаптере, Prisma, PostgreSQL. Прод — Vercel + Neon. Не пиши и не меняй код здесь, если явно не попросили. Контекст о нём — чтобы фронтенд проектировался совместимо с ним, и чтобы бэкенд-задачи, когда их дают, делались по [architecture.md](.claude/knowledge/backend/architecture.md).
- `packages/contracts` (`@viratec/contracts`) — общие для фронта и бэка enum'ы, типы и zod-схемы. Публичный API контрактов не меняй без явной просьбы.
- `packages/utils`, `packages/ui`, `packages/tsconfig` — общие утилиты, заготовка UI-пакета (сейчас пустой, UI-кит живёт в `apps/web/src/shared/ui`), базовые tsconfig.

## Правила, общие для всего репозитория

- Комментариев в коде не пишем.
- Только TypeScript, строгая типизация, без `any` — `unknown` и сужение типов вместо него.
- Не создавай абстракции сверх того, что нужно для текущей задачи. Не дублируй существующие утилиты, хуки и компоненты.
- Перед реализацией ищи существующий паттерн в `apps/web` или `apps/backend` и переиспользуй его — не изобретай новый без причины. Новые библиотеки — только по явной просьбе.
- Минимальный дифф: не рефактори соседний код, не переименовывай и не переноси файлы без необходимости.
- Задача на 3+ файла или с изменением архитектуры, состояния или публичного API — сначала план (текущее состояние, решение, затронутые файлы, риски) и подтверждение.
- Коммиты, пуши и пул-реквесты — только по явной просьбе пользователя. Когда просят — строго по [CONTRIBUTING.md](CONTRIBUTING.md) и `commitlint.config.ts`: Conventional Commits, тип и область по-английски. Там же список того, что обязано меняться вместе (см. «Что обязано ехать в одном коммите» в [api-contract.md](.claude/knowledge/api-contract.md)).
- Только `pnpm`, никаких `npm`/`yarn`.
- После правок: `pnpm typecheck`, `pnpm lint`, `pnpm format:check` из корня; проверь, что не задеты посторонние файлы.

# Frontend — обзор

## Стек

- React 19 + React Compiler (`babel-plugin-react-compiler` подключён в `@vitejs/plugin-react` в `vite.config.ts`) — не добавляй `useMemo`/`useCallback`/`React.memo` без явной причины, компилятор мемоизирует сам. Существующие `useCallback` для стабильного `select` в query-хуках не трогай.
- TypeScript, строгий режим, без `any`.
- Vite 6 — сборка и dev-сервер, плюс SSR-сборка для пререндера.
- React Router 7 (`react-router-dom`) — роутинг SPA, конфиг в `app/providers/router.tsx`.
- TanStack Query 5 — серверное состояние. Zustand 5 — клиентское состояние (сессия, язык). Разделение — [state-management.md](state-management.md).
- Tailwind CSS v4 (`@tailwindcss/vite`) — стили, токены в `app/styles/index.css`.
- react-hook-form + `@hookform/resolvers` + zod — формы. Floating UI — позиционирование оверлеев. `lucide-react` — иконки.
- pnpm workspaces + Turborepo — монорепо.

## Структура монорепо

```
apps/
├── web/                # @viratec/web — сайт и платформа, FSD
│   ├── src/            # код приложения, см. fsd.md
│   ├── build-tools/    # Vite-плагины (пререндер, SEO, адаптивные картинки, прелоад шрифтов и маршрутов) и пайплайн Contentful
│   ├── tests/          # Playwright-проверки UI-кита, см. testing.md
│   └── public/
└── backend/            # @viratec/backend — NestJS, см. backend/overview.md
packages/
├── contracts/          # @viratec/contracts — enum'ы, типы и zod-схемы, общие с бэкендом
├── utils/              # @viratec/utils — date/string-хелперы
├── ui/                 # @viratec/ui — пока пустой, UI-кит живёт в apps/web/src/shared/ui
└── tsconfig/           # @viratec/tsconfig — базовые tsconfig
```

Внутри `apps/web` алиас `@/` указывает на `src/`. Общие с бэкендом типы импортируются из `@viratec/contracts`, а не копируются в `entities`.

## Сборка, пререндер и контент

`pnpm --filter @viratec/web build` = `tsc -b` → клиентская `vite build` → SSR-сборка `src/entry-server.tsx`, после которой `prerender-plugin` раскладывает статический HTML по маршрутам. Поэтому код страниц обязан рендериться в Node без `window`/`document`/`localStorage` на верхнем уровне модуля: обращения к браузерным API — в эффектах или за проверкой `import.meta.env.SSR`, как в `shared/i18n/model/store.ts`.

Контент маркетинговых страниц приходит из Contentful (`build-tools/contentful`):

- `content:pull` тянет записи и картинки в закоммиченные модули (`pages/*/model/page.generated.ts`, `shared/config/site.generated.ts`, `shared/config/seo.generated.ts`, `shared/assets/contentful/`). Эти файлы руками не правим — только через Contentful и `content:pull`.
- `content:model` описывает модель контента в Contentful, `content:webhooks` — вебхуки деплоя.
- После загрузки страница освежает контент через `GET /api/v1/content/entries` и `useLiveContent` (`shared/lib/useLiveContent.ts`) тем же доменным кодом (`build-tools/contentful/runtime.ts`). Сбой API — остаётся снапшот.
- Подробности и окружения — `docs/deployment/contentful.md`. Токены — только в `apps/web/.env.local`.

Деплой — Vercel (`vercel.json`): сервис `web` собирает контракты, `content:pull --fallback` и `build`; сервис `api` — бэкенд.

## Единый кодстайл

- **Prettier** (`.prettierrc.json`): 100 символов, одинарные кавычки, точки с запятой, висячие запятые, LF.
- **Oxlint** — линтер на весь репозиторий из корня (`pnpm lint` = `oxlint --deny-warnings`), отдельного конфига нет. Границы слоёв FSD линтер не проверяет — их держит ревью, см. [fsd.md](fsd.md).
- **Knip** (`knip.json`) — неразрешённые импорты.
- **EditorConfig** (`.editorconfig`) — 2 пробела, LF, финальный перевод строки.
- **Husky**: `pre-commit` — `lint-staged` (oxlint `--fix` + prettier по изменённым файлам), `pre-push` — `pnpm typecheck`, `commit-msg` — commitlint.

## Команды

Из корня репозитория:

- `pnpm install` — зависимости всего workspace (заодно `prisma generate` через `postinstall`)
- `pnpm dev:web` — `apps/web` в dev-режиме на 5173 (`pnpm dev` — все приложения через Turbo)
- `pnpm build` — прод-сборка всего через Turbo
- `pnpm lint` / `pnpm lint:fix` — Oxlint
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm typecheck` — `tsc` по пакетам через Turbo
- `pnpm knip` — неразрешённые импорты
- **`pnpm validate`** — EOL + шаблон env + типы + линт + knip одной командой (то, что стоит гонять перед пушем)
- `pnpm --filter @viratec/web test:ui` — Playwright-проверки UI-кита
- `pnpm --filter @viratec/web content:pull` — обновить снапшот контента из Contentful

Превью в Claude Code — через локальный `.claude/launch.json` (в git не попадает): dev-сервер web на 5173, `vite preview` на 4173, бэкенд на 3000. Если файла нет — создай его с этими командами (`pnpm --filter @viratec/web dev`, `pnpm --filter @viratec/web preview`, `pnpm --filter @viratec/backend start`).

# Frontend — overview

## Stack

- React 19 + React Compiler (`babel-plugin-react-compiler` is wired into `@vitejs/plugin-react` in `vite.config.ts`) — do not add `useMemo`/`useCallback`/`React.memo` without a concrete reason, the compiler memoizes on its own. Leave existing `useCallback`s used for a stable `select` in query hooks alone.
- TypeScript, strict mode, no `any`.
- Vite 6 — build and dev server, plus an SSR build for prerendering.
- React Router 7 (`react-router-dom`) — SPA routing, config in `app/providers/router.tsx`.
- TanStack Query 5 — server state. Zustand 5 — client state (session, language). The split — [state-management.md](state-management.md).
- Tailwind CSS v4 (`@tailwindcss/vite`) — styles, tokens in `app/styles/index.css`.
- react-hook-form + `@hookform/resolvers` + zod — forms. Floating UI — overlay positioning. `lucide-react` — icons.
- pnpm workspaces + Turborepo — monorepo.

## Monorepo layout

```
apps/
├── web/                # @viratec/web — site and platform, FSD
│   ├── src/            # application code, see fsd.md
│   ├── build-tools/    # Vite plugins (prerender, SEO, responsive images, font and route preload) and the Contentful pipeline
│   ├── tests/          # Playwright UI kit checks, see testing.md
│   └── public/
└── backend/            # @viratec/backend — NestJS, see backend/overview.md
packages/
├── contracts/          # @viratec/contracts — enums, types and zod schemas shared with the backend
├── utils/              # @viratec/utils — date/string helpers
├── ui/                 # @viratec/ui — still empty, the UI kit lives in apps/web/src/shared/ui
└── tsconfig/           # @viratec/tsconfig — base tsconfigs
```

Inside `apps/web` the `@/` alias points to `src/`. Types shared with the backend are imported from `@viratec/contracts`, not copied into `entities`.

## Build, prerender and content

`pnpm --filter @viratec/web build` = `tsc -b` → client `vite build` → SSR build of `src/entry-server.tsx`, after which `prerender-plugin` writes static HTML per route. So page code must render in Node without `window`/`document`/`localStorage` at module top level: browser APIs go into effects or behind an `import.meta.env.SSR` check, as in `shared/i18n/model/store.ts`.

Marketing page content comes from Contentful (`build-tools/contentful`):

- `content:pull` fetches entries and images into committed modules (`pages/*/model/page.generated.ts`, `shared/config/site.generated.ts`, `shared/config/seo.generated.ts`, `shared/assets/contentful/`). Do not edit these files by hand — only through Contentful and `content:pull`.
- `content:model` describes the content model in Contentful, `content:webhooks` — deploy webhooks.
- After load, a page refreshes its content through `GET /api/v1/content/entries` and `useLiveContent` (`shared/lib/useLiveContent.ts`) using the same domain code (`build-tools/contentful/runtime.ts`). If the API fails, the snapshot stays.
- Details and environments — `docs/deployment/contentful.md`. Tokens live only in `apps/web/.env.local`.

Deployment — Vercel (`vercel.json`): the `web` service builds the contracts, runs `content:pull --fallback` and `build`; the `api` service is the backend.

## Shared code style

- **Prettier** (`.prettierrc.json`): 100 characters, single quotes, semicolons, trailing commas, LF.
- **Oxlint** — the linter for the whole repo from the root (`pnpm lint` = `oxlint --deny-warnings`), no separate config. It does not check FSD layer boundaries — review does, see [fsd.md](fsd.md).
- **Knip** (`knip.json`) — unresolved imports.
- **EditorConfig** (`.editorconfig`) — 2 spaces, LF, final newline.
- **Husky**: `pre-commit` — `lint-staged` (oxlint `--fix` + prettier on changed files), `pre-push` — `pnpm typecheck`, `commit-msg` — commitlint.

## Commands

From the repository root:

- `pnpm install` — dependencies for the whole workspace (also `prisma generate` via `postinstall`)
- `pnpm dev:web` — `apps/web` in dev mode on 5173 (`pnpm dev` — all apps through Turbo)
- `pnpm build` — production build of everything through Turbo
- `pnpm lint` / `pnpm lint:fix` — Oxlint
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm typecheck` — `tsc` per package through Turbo
- `pnpm knip` — unresolved imports
- **`pnpm validate`** — EOL + env template + types + lint + knip in one command (what to run before pushing)
- `pnpm --filter @viratec/web test:ui` — Playwright UI kit checks
- `pnpm --filter @viratec/web content:pull` — refresh the content snapshot from Contentful

Previews in Claude Code use a local `.claude/launch.json` (not committed): web dev server on 5173, `vite preview` on 4173, backend on 3000. If the file is missing, create it with these commands (`pnpm --filter @viratec/web dev`, `pnpm --filter @viratec/web preview`, `pnpm --filter @viratec/backend start`).

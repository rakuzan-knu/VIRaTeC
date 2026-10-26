# VIRaTeC

Website and community platform for VIRaTeC (Virtual Innovating Research & Technology Community) at Taras Shevchenko National University of Kyiv: a public site with projects, publications, people and research areas, plus user accounts, saved items, community and an admin panel.

All project context is split by topic — do not duplicate it here, follow the links:

| File                                                                           | What it covers                                                         |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| [product.md](.claude/knowledge/product.md)                                     | what the product is, pages and routes, data model, where content lives |
| [design-system.md](.claude/knowledge/design-system.md)                         | how to apply the design system from `DESIGN.md` and `UX-CONTRACT.md`   |
| [api-contract.md](.claude/knowledge/api-contract.md)                           | endpoints, response envelope, error format, CSRF, pagination           |
| [frontend/overview.md](.claude/knowledge/frontend/overview.md)                 | stack, monorepo layout, build and prerender, code style, commands      |
| [frontend/fsd.md](.claude/knowledge/frontend/fsd.md)                           | FSD layers, segments, slice public API, styling rules                  |
| [frontend/state-management.md](.claude/knowledge/frontend/state-management.md) | Zustand vs TanStack Query — which owns which piece of state            |
| [frontend/testing.md](.claude/knowledge/frontend/testing.md)                   | frontend tests: Playwright UI kit checks, what CI runs                 |
| [backend/overview.md](.claude/knowledge/backend/overview.md)                   | backend stack and what the frontend integrates with                    |
| [backend/architecture.md](.claude/knowledge/backend/architecture.md)           | NestJS modules, layers, DI, DTOs, errors, Prisma, code skeletons       |
| [CONTRIBUTING.md](CONTRIBUTING.md)                                             | branches, Conventional Commits, checks, pull requests                  |

The lines below are the same files as Claude Code import directives. They are not links and cannot be clicked: they tell Claude Code to inline the files at the start of a session. The clickable versions are in the table above. When you add a file to the table, add it here too, otherwise the agent will not read it.

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

## Code layout

A pnpm workspaces + Turborepo monorepo; everything runs from the root.

- `apps/web` — frontend (`@viratec/web`): React + Vite SPA with prerendering, Feature-Sliced Design, TanStack Query, content from Contentful.
- `apps/backend` — backend (`@viratec/backend`): NestJS on the Fastify adapter, Prisma, PostgreSQL. Production runs on Vercel + Neon. Do not write or change code here unless explicitly asked. The backend context exists so the frontend is designed to stay compatible with it, and so backend tasks, when given, follow [architecture.md](.claude/knowledge/backend/architecture.md).
- `packages/contracts` (`@viratec/contracts`) — enums, types and zod schemas shared by frontend and backend. Do not change the contracts' public API without an explicit request.
- `packages/utils`, `packages/ui`, `packages/tsconfig` — shared utilities, the UI package placeholder (currently empty; the UI kit lives in `apps/web/src/shared/ui`), base tsconfigs.

## Repository-wide rules

- No comments in code.
- TypeScript only, strict typing, no `any` — use `unknown` and narrowing instead.
- Do not create abstractions beyond what the current task needs. Do not duplicate existing utilities, hooks or components.
- Before implementing, find an existing pattern in `apps/web` or `apps/backend` and reuse it — do not invent a new one without a reason. New libraries only on explicit request.
- Minimal diff: do not refactor neighbouring code, do not rename or move files without need.
- A task touching 3+ files or changing architecture, state or a public API needs a plan first (current state, solution, affected files, risks) and approval.
- Commits, pushes and pull requests only on the user's explicit request. When asked, follow [CONTRIBUTING.md](CONTRIBUTING.md) and `commitlint.config.ts` strictly: Conventional Commits, type and scope in English. The same place lists what must change together (see "What must ship in one commit" in [api-contract.md](.claude/knowledge/api-contract.md)).
- `pnpm` only, never `npm`/`yarn`.
- After changes: run `pnpm typecheck`, `pnpm lint`, `pnpm format:check` from the root; make sure no unrelated files were touched.

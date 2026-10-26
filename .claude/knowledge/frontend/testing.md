# Frontend tests

How to run tests, where they live and which of them CI runs.

## Commands

From the repository root:

- `pnpm --filter @viratec/web test:ui` — Playwright UI kit checks. Starts the dev server itself (`pnpm dev --port 5183 --strictPort --host 127.0.0.1`) and reuses an already running one outside CI. From a fresh clone, once: `pnpm --filter @viratec/web exec playwright install chromium`.
- `pnpm --filter @viratec/web exec playwright test --ui` — interactive mode for debugging.
- `pnpm typecheck` — types, including tests: `apps/web/tsconfig.tests.json` includes `tests/` and `playwright.config.ts`.

CI (`.github/workflows/ci.yml`, the `validate` job in a Playwright container) runs EOL, env template, `format:check`, `lint`, `typecheck`, `test:ui` and `knip`, then a separate `build` job — `pnpm build`. The Playwright image version in CI is pinned and must match `@playwright/test` in `apps/web/package.json` — when you update one, update the other.

## Stack

- **Playwright** (`@playwright/test`, Chromium) — browser checks.
- **`@axe-core/playwright`** — automated WCAG 2.2 AA accessibility checks.

There is no unit or component test runner (Vitest, RTL) in the frontend. Do not add one without an explicit request — it is a new dependency and new tooling.

## Where tests live

- `apps/web/tests/*.spec.ts` — specs. Currently one: `ui-kit.spec.ts`.
- `apps/web/tests/fixtures/ui-kit.html` + `ui-kit.tsx` — a test page with kit component states. Served by the dev server at `/tests/fixtures/ui-kit.html` and not part of the production build.

Config — `apps/web/playwright.config.ts`: two projects, `desktop` and `mobile` (375×812), one retry and one worker in CI, trace on failure.

What is covered now (`ui-kit.spec.ts`):

| Check                   | What it verifies                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| typography and geometry | values from Figma, font loading, button sizes                                                               |
| `Tooltip`               | hover over content, trigger activation preserved, descriptions and ref, opening on focus, closing on Escape |
| `Button`                | busy/disabled block repeated activation without changing size                                               |
| `Input`                 | label, helper text and error are associated                                                                 |
| `NavItem`               | links for routes, a keyboard-operable button for expanding                                                  |
| `Card`                  | long content does not overflow the viewport, CTAs align across a row                                        |
| accessibility           | axe reports no violations in the default and open tooltip states                                            |

When you change a kit component from `UX-CONTRACT.md`, run `test:ui` and, if the contract changes, update the spec and the fixture. A new kit component or state — add it to the fixture and the spec.

## Manual browser check

Changes visible in the UI are checked on a live dev server (`pnpm dev:web`, port 5173): no console errors, both locales, 375 width and desktop, keyboard navigation. Pages with Contentful content are also checked after `pnpm --filter @viratec/web build` + `pnpm --filter @viratec/web preview`, because the prerender renders them in Node.

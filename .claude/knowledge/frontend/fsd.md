# Feature-Sliced Design — rules for `apps/web`

FSD applies inside `apps/web/src`. `packages/contracts` and `packages/utils` are not FSD layers; they are an external foundation below all layers (see [overview.md](overview.md)). A short human-oriented version of the same rules — `docs/architecture/frontend-fsd.md`.

## Layers, top to bottom

```
app → pages → widgets → features → entities → shared
```

One rule that never changes: **a layer may import only from layers strictly below it.** Not from sibling slices of its own layer, not from above. `shared` knows about nothing, `entities` knows nothing about `features`/`widgets`/`pages`, and so on. The linter does not check this — check it yourself before every new import. There is no `processes` layer (deprecated in FSD, do not create it).

- **`app`** — `App.tsx` (`QueryClientProvider`, `SessionProvider`), `providers/router.tsx` and route wrappers (`RootLayout`, `ProtectedRoute`, `GuestRoute`, `Redirect`), global styles and tokens (`app/styles/index.css`). Entry points — `src/main.tsx` and `src/entry-server.tsx` (prerender).
- **`pages`** — route components: `home`, `projects`, `project-detail`, `publications`, `publication-detail`, `people`, `person`, `account`, `admin`, `login`, `register`, `legal`, etc. Thin — they assemble widgets, features and entities. Contentful content lives in `pages/*/model/page.generated.ts` (generated, never edited by hand) and `model/content.ts`.
- **`widgets`** — self-contained composite blocks: `site-header`, `site-footer`, `page-layout`, `page-intro`, `auth-layout`. A widget does not import another widget: if a wrapper needs a sibling widget, the page passes it in as a slot prop (`<PageLayout footer={<SiteFooter />}>`, `<PageIntro header={<SiteHeader />}>`).
- **`features`** — a concrete user action with a verb: `login-by-email`, `login-by-google`, `register-by-email`, `logout`, `reset-password`, `verify-two-factor`, `manage-two-factor`, `manage-sessions`, `switch-account`, `change-password`, `update-profile`, `update-avatar`, `update-privacy`, `link-google`, `save-item`, `export-data`, `delete-account`. One feature — one action, not a "UI section".
- **`entities`** — business entities with their own display and queries: `project`, `publication`, `person`, `partner`, `session` (Zustand store of the current user and known accounts).
- **`shared`** — the UI kit (`shared/ui`, see [design-system.md](../design-system.md)), HTTP client (`shared/api/apiClient.ts`), config (`shared/config`: `routes.ts`, `env.ts`, `navigation.ts`, `storageKeys.ts`, SEO), i18n (`shared/i18n`: `useLocale`, `useLocalized`, `defineMessages`, `useCommonMessages`, `pluralUk` and the language store), hooks and utilities (`shared/lib`: `cn`, `useDismiss`, `useFocusTrap`, `useBodyScrollLock`, `useSeo`, `useLiveContent`, …), assets.

## Segments inside a slice

Each slice may have segments: `ui/`, `model/`, `api/`, `lib/` (pages also have `assets/`; `config/` is allowed but not used yet). Do not create an empty segment — if a feature needs no `api` of its own, there is no `api/` segment.

- `api/` — request functions on top of `api` from `@/shared/api/apiClient` (`fetchProjects`, `saveItemRequest`), no hooks.
- `model/` — types (`types.ts`), query hooks and keys (`queries.ts`), stores, form zod schemas (`schema.ts`), localized messages (`messages.ts` with a `use<Slice>Messages` hook), orchestration hooks (`useLogin.ts`, `useProjectListing.ts`). No JSX in `model/` — providers and dialogs belong in `ui/`.
- `lib/` — pure slice functions (`format.ts`, `localize.ts`).
- `ui/` — components.

## One component per file

**A new component means a new file.** As soon as a separate function component (`<Child/>`) is extracted from UI, it lives in its own file and is imported, even if it is private and used by a single parent. The existing code still has files with several components (`ProjectCard` + `ProjectCardSkeleton`, the `opportunities` and `admin` pages) — do not split them without a task, but do not add new components to them.

This is about components, not markup: inline JSX inside `return` is fine.

The parent composes children and passes data/callbacks as props; children are presentational. A slice's `index.ts` exposes only its public entry point; private sub-components are not exported from the barrel and are imported by relative path inside the slice.

## Hooks and logic

**A hook or component is never declared inside another component's body.** Otherwise it is recreated on every render and loses its identity — React Compiler optimizes it incorrectly. Everything goes at module top level or in its own file.

**Move non-trivial slice logic into a hook in `model/`, do not spread it across `ui/`.** State, handlers, mutations and query orchestration are assembled by `model/use<Something>.ts` (`features/login-by-email/model/useLogin.ts`, `pages/projects/model/useProjectListing.ts`), and the `ui/` component calls the hook and lays the result out in markup. If a component just calls a ready `useProjects()` and renders — a separate hook is unnecessary.

When a form is split into section components, pass `control` and `register` down and read errors and watched values with `useFormState` / `useWatch` inside the section, not from the parent's `formState` (`features/update-profile`).

### "When to split" checklist

If at least one item fires, the component is overloaded — split it (logic into a `model/` hook, UI pieces into their own files):

- **JSX longer than ~100 lines**.
- **More than 4–5 `useState` in one place**.
- **More than two `useEffect`s watching different things**.
- **Different levels of abstraction in one file** — page scaffolding next to the markup of a small icon.
- **Business logic mixed with UI** — the component knows the request URL, how to validate a field and what color the border should be.
- **Copy-paste** of markup or a handler into another file (→ `shared` or a common component).
- **Prop drilling** through 3 levels for a single line at the bottom.

## Slice public API

Always import a slice through its `index.ts`: `@/entities/project`, not `@/entities/project/ui/ProjectCard`. The same applies in `shared` for folders with an `index.ts` (`@/shared/i18n`, `@/shared/lib`, `@/shared/ui/Button`); flat files `shared/ui/*.tsx` and `shared/config/*.ts` are imported by direct path, as the existing code does.

## Styles

**Tailwind CSS v4** — utility classes directly in `className`, merged with `cn()` from `@/shared/lib`. Tokens are declared in `@theme` in `app/styles/index.css`. There are no CSS Modules in the project — do not introduce them. Repeated class sets of one page go into `ui/styles.ts` constants (as in `pages/home/ui/styles.ts`).

Colors are tokens only, or white with opacity per `DESIGN.md` (`bg-white/5`, `border-white/10`); a raw hex in a class is a violation. Arbitrary values are allowed for geometry and typography that have no token.

Inline styles (`style={{…}}`) only for truly dynamic values (position, progress, computed size). Hovers, focus and states go through Tailwind variants (`hover:`, `focus-visible:`, `aria-[…]:`, `data-[…]:`), not JS handlers.

UI copy is never hardcoded as a string in a component: it comes from i18n (`shared/i18n`) or from the page's Contentful content, in two locales, `en` and `uk`.

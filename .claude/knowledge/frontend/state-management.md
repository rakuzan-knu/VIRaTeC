# State management

Two different kinds of state, two different libraries — do not mix their responsibilities.

## TanStack Query — server state

Everything that comes from and goes to the backend: projects, publications, people, saved items, profile, sessions, admin. Per-slice layout:

- request functions — in the slice's `api/` on top of `api` from `@/shared/api/apiClient` (`entities/project/api/projectApi.ts`);
- query hooks and the key factory — in `model/queries.ts` or `model/use<Something>.ts` (`projectKeys`, `savedKeys`, `adminKeys`). Keys are built from a root array (`['projects']`, `['saved-items']`), and invalidation targets that root. Do not scatter hand-written key arrays across the code;
- mutations (`useMutation`) live next to their feature's query hooks and update or invalidate the cache themselves through `useQueryClient()`.

`QueryClient` is created once in `app/App.tsx` (`retry: 1`, `refetchOnWindowFocus: false`). `staleTime` is set in the hook, usually `60_000`. Filtered lists use `placeholderData: keepPreviousData`; data localization goes through `select` (`useProjects`).

Do not keep a copy of server data in Zustand or `useState` "for speed" — there is one source of truth, the TanStack Query cache.

## Zustand — client state

What the backend does not have, or what is needed synchronously before the server responds:

- **`entities/session/model/store.ts` (`useSessionStore`)** — the current user (`AccountDto` from contracts), session restore flags, pending second factor, sign-out. Exposed through selectors and slice hooks (`useIsAuthenticated`). The list of known accounts for switching — `entities/session/model/knownAccounts.ts`.
- **`shared/i18n/model/store.ts` (`useLocaleStore`)** — the selected language, persisted to `localStorage`; during prerender it is always `PRERENDER_LOCALE`.

Subscribe with a selector to the field you need (`useSessionStore((state) => state.user?.id ?? null)`), not to the whole store — otherwise you get extra rerenders. `localStorage` keys come only from `shared/config/storageKeys.ts`, and storage access is wrapped in `try/catch`, as in the existing stores (it can be unavailable).

Create a new global store only if the state is genuinely needed by several unrelated slices. State of a single widget or form (whether a dialog is open, an input draft, a wizard step) stays next to it — in `useState` or in the slice's `model/` hook. Forms use `react-hook-form` with a zod schema in `model/schema.ts`, not Zustand.

## Where they meet

The server's session response (`/auth/me`, sign-in, refresh) is put into `useSessionStore` — the only place where server data is deliberately duplicated in Zustand, because routing (`ProtectedRoute`, `GuestRoute`) and the HTTP client depend on it synchronously. Keys of user-dependent queries include the user's `id` (`savedKeys.list(userId)`) so switching accounts never shows someone else's cache.

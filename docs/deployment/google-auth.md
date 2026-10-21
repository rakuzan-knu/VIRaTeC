# Google sign-in

Create a Google Cloud project and configure its OAuth consent screen for VIRaTeC.
Create an OAuth Client ID with application type **Web application**. Add these
**Authorized JavaScript origins** (origins only, without paths):

- `http://localhost:5173`
- `https://viratec.vercel.app` (also add any custom production origin)

The app uses the Google Identity Services popup callback and sends the ID token to
`POST /api/v1/auth/google`; it does not need an authorized redirect URI or a client secret.

## Local development

Copy `.env.example` to `.env` and `apps/web/.env.example` to `apps/web/.env.local`.
Set `GOOGLE_CLIENT_ID` in the root `.env` and the identical value as
`VITE_GOOGLE_CLIENT_ID` in `apps/web/.env.local`. Configure `DATABASE_URL` in the
root `.env`. Nest and Prisma load this file; existing process variables take precedence.
Restart the API and Vite after changing environment files.

Apply committed migrations:

```sh
pnpm --filter @viratec/backend db:migrate
```

For an existing database previously created with `prisma db push`, back it up and
verify that its schema matches the init migration before marking that migration
as applied. Do not run this on an empty database or blindly baseline a different schema:

```sh
pnpm --filter @viratec/backend exec prisma migrate resolve --applied 20261021000000_init
pnpm --filter @viratec/backend db:migrate
```

The Google migration adds a unique nullable `googleId` and makes `passwordHash`
nullable. Existing password accounts remain usable. Deploy this migration before
running the Google-aware API; reverting to an API that requires password hashes
also requires handling any newly created Google-only accounts.

## Production

On Vercel, set both client ID variables for the intended deployment environment
and rebuild the frontend. The existing API build runs migrations. See
[Vercel deployment](vercel.md).

For Docker Compose, set `GOOGLE_CLIENT_ID` in the root `.env`.
`VITE_GOOGLE_CLIENT_ID` defaults to that value, or can be set explicitly to the
same value. Set `VITE_API_BASE_URL` to the public API URL and `CORS_ORIGIN` to the
frontend origin. Compose passes `VITE_*` values as frontend build arguments;
rebuild the frontend image after changing them. Direct Docker builds must supply
`--build-arg VITE_GOOGLE_CLIENT_ID=...` and `--build-arg VITE_API_BASE_URL=...`.
The client ID is public; never put client secrets in `VITE_*` variables.

## Account behavior and verification

Google accounts are identified by the verified token's `sub`. A new account gets
the database's student role. Email collisions return HTTP 409 without linking or
issuing tokens: an existing password account must use its existing sign-in method.
Explicit account linking is not implemented. Returning Google users keep their
existing role. Password login for Google-only users returns HTTP 401, which the
form presents as the normal invalid-credentials message.

The official Google button remains limited to 400px. Verify a new Google account,
repeat sign-in, popup cancellation, a rejected credential, and an email collision
on the deployed origin. Unit tests stub Google verification; they do not replace
a real Google login on an authorized origin.

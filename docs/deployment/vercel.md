# Vercel deployment

The `viratec` project in `magchannel228-1236` deploys both services from the repository root:

- `web`: React/Vite in `apps/web`, served at `/`.
- `api`: NestJS/Fastify in `apps/backend`, built from the repository root and served at `/api/v1` and `/docs`.

Pushes to `main` create production deployments. Other branches create previews.
Keep the project root at the repository root; `vercel.json` defines each service's root and build command.
The API and Neon Postgres use the Frankfurt region.
The root package's `main` identifies the NestJS entrypoint. Building the API from the repository root
keeps its workspace dependencies in the function's packaging scope.
Both service installs use the frozen `pnpm-lock.yaml` and the hoisted node linker, so
clean production builds resolve the same runtime dependencies as preview builds.

## Environment

Configure these in Vercel for production and preview:

| Variable                    | Value                                                                         |
| --------------------------- | ----------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`         | `/api/v1`                                                                     |
| `DATABASE_URL`              | Managed by the Neon integration                                               |
| `JWT_ACCESS_SECRET`         | Random secret, distinct per environment                                       |
| `JWT_REFRESH_SECRET`        | Independent random secret, distinct per environment                           |
| `TOTP_ENCRYPTION_KEY`       | 32 random bytes encoded in base64, distinct per environment                   |
| `CORS_ORIGIN`               | Exact permitted frontend origin; production uses `https://viratec.vercel.app` |
| `CONTENTFUL_SPACE_ID`       | Contentful space ID                                                           |
| `CONTENTFUL_ENVIRONMENT`    | `master` for production, `dev` for preview                                    |
| `CONTENTFUL_DELIVERY_TOKEN` | Content Delivery API token                                                    |

The web build pulls the site content from Contentful first, and the API serves the same variables as live content at `/api/v1/content/entries`; see [Contentful](contentful.md) for the deploy hooks and webhooks.

Neon uses the main database for production and creates an isolated database branch for each preview.
The API build applies committed Prisma migrations with `prisma migrate deploy` before publishing.
Review migrations for compatibility with the currently running deployment before pushing to `main`.
Never point preview migrations at the production database.

Google sign-in additionally requires matching `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`
and allowed origins in Google Cloud. Password-based registration and login work independently.
See [Google sign-in setup](google-auth.md) for local environment files, migrations,
Docker build arguments, and account collision behavior.

## Verification

```sh
pnpm --filter @viratec/backend test
pnpm lint
pnpm typecheck
```

Vercel runs the full deployment build remotely with the sensitive environment variables.
`vercel pull` replaces sensitive values with placeholders, so a local deployment build requires
separately supplied local database credentials and secrets.

After a deployment, verify `/api/v1/health/ready` reports `data.status: ready`,
the frontend loads, and direct links to content and auth pages resolve.
Public registration permits student and partner accounts; privileged roles require administrative provisioning.
JWT credentials and cookies are redacted from HTTP logs.

Preview functions also run with `NODE_ENV=production`, so they require the JWT
secrets and `TOTP_ENCRYPTION_KEY` even when email delivery is disabled. Use fresh
test accounts in preview: its independent encryption key cannot decrypt second
factors copied from production. Configure Gmail delivery in production as described
in [Transactional email](email.md); keep sender credentials out of general previews.

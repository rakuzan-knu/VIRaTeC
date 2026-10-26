# Product

Sources: `README.md`, the code in `apps/web` and `apps/backend`, `docs/`. Below is a summary that was accurate when the rules were ported.

## What we build

The website and platform of VIRaTeC — an international research and education network based at the Faculty of Information Technology (FIT) of Taras Shevchenko National University of Kyiv, with the Educational and Scientific Institute of Philology (NNIF). The audience is researchers, faculty, students and international partners.

Two parts:

- **Public site** — about the initiative, research areas, projects, publications, people, opportunities, contacts, legal pages. Pages are prerendered at build time; marketing page copy comes from Contentful.
- **Member platform** — registration and sign-in (email + password, Google), 2FA, sessions, profile and privacy, avatar, data export and account deletion, saved publications and projects, community (posts, likes), an admin panel for staff.

The interface is bilingual: `en` (default) and `uk` (`apps/web/src/shared/i18n`). Prerendering uses Ukrainian.

## Pages

Routes — `apps/web/src/shared/config/routes.ts` (`ROUTES`), router config — `apps/web/src/app/providers/router.tsx`. Links with parameters are built with helpers from the same file (`buildProjectPath`, `buildPublicationPath`, `buildPersonPath`, `buildAccountPath`) — never build URLs by hand with string concatenation.

| Route                                                                    | Page (`pages/…`)                                                                    |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `/`                                                                      | `home`                                                                              |
| `/about`, `/about/viratec`, `/about/global-collaboration-framework`      | `about-initiative`, `viratec`, `global-collaboration`                               |
| `/research/areas`, `/research/projects`, `/research/projects/:projectId` | `research-areas`, `projects`, `project-detail`                                      |
| `/research/experiential-learning`, `/research/student-research`          | `experiential-learning`, `student-research`                                         |
| `/publications`, `/publications/:slug`                                   | `publications`, `publication-detail`                                                |
| `/people`, `/people/:userId`                                             | `people`, `person`                                                                  |
| `/opportunities`, `/contact`                                             | `opportunities`, `contact`                                                          |
| `/terms`, `/privacy`, `/cookies`, `/community-guidelines`                | `legal`                                                                             |
| `/login`, `/register`, `/forgot-password`                                | `login`, `register`, `forgot-password` (guest routes, `GuestRoute`)                 |
| `/account`                                                               | `account` (protected, `ProtectedRoute`; the section is the `section` query)         |
| `/admin`, `/admin/users`, `/admin/audit`                                 | `admin` (`ProtectedRoute`; staff permissions are checked by the API — `StaffGuard`) |
| `*`                                                                      | `not-found`                                                                         |

## Data model

Schema — `apps/backend/prisma/schema.prisma`, migrations — `apps/backend/prisma/migrations`. Prisma enums are mirrored in `packages/contracts/src/enums.ts` — that is the contract with the frontend (it also holds API-only enums such as `OpenToOption`, `LanguageLevel`).

| Model                                        | What it stores                                                                                                                                                             |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`                                       | account: role (`UserRole`), staff role (`StaffRole`) and permissions (`AdminPermission`), faculty, study level, profile visibility (`ProfileVisibility`), Google link, 2FA |
| `UserAvatar`                                 | user avatar (binary data + MIME type)                                                                                                                                      |
| `RefreshToken`, `BackupCode`, `MfaChallenge` | sessions, backup codes and 2FA challenges                                                                                                                                  |
| `AuditLog`, `RateLimitBucket`                | action audit and rate limiting, both in Postgres                                                                                                                           |
| `SavedItem`                                  | a user's saved item: `PUBLICATION` or `PROJECT` by `refId`                                                                                                                 |
| `ResearchPaper`                              | research papers                                                                                                                                                            |
| `Project`                                    | projects (`ProjectStatus`, faculties, tags, links, `translations` as JSON)                                                                                                 |
| `Event`                                      | events (`EventType`, dates, venue, online)                                                                                                                                 |
| `Publication`                                | publications and news by `slug`, content as JSON                                                                                                                           |
| `CommunityPost`, `PostLike`                  | community posts and likes (one like per user)                                                                                                                              |

## Where content comes from

- **Contentful** — page copy, partners, team, timeline, gallery, opportunities, legal documents, SEO and site settings. Pulled at build time (`content:pull`) into typed modules committed to the repository, then refreshed after page load through `GET /api/v1/content/entries`. Details — `docs/deployment/contentful.md` and [frontend/overview.md](frontend/overview.md).
- **Database** — projects, publications, events, users, community. This is not Contentful and is not moved there.

## Open questions

- `README.md` and `CONTRIBUTING.md` mention Redis, MinIO and Kubernetes — in the backend code Redis is only declared in config (`redis.url`), MinIO and k8s are unused. Do not rely on them unless a task explicitly requires it.
- `packages/ui` is still empty — the UI kit lives in `apps/web/src/shared/ui`. Do not move it into the package without an explicit task.

# Contentful

Contentful holds the site content that used to be hardcoded in the web app: page texts, partners, team, timeline, gallery, opportunities, legal documents, SEO and site settings. Publications, events and projects stay in the database and are not managed here.

Content is pulled at build time into typed modules committed to the repo, and images are downloaded into `src/shared/assets/contentful/`. Pages prerender synchronously from this snapshot, and images go through the usual responsive pipeline (AVIF/WebP `srcset`).

After the page loads, the browser asks the API for the published entries (`GET /api/v1/content/entries?types=…`), maps them with the same domain code as the build (`build-tools/contentful/runtime.ts`, loaded as a separate chunk) and swaps in the fresh content through `useLiveContent`. The API proxies the Content Delivery API and caches each response for 30 seconds, so the token never reaches the browser. Live images are served by the Contentful Images API (`images.ctfassets.net`) with the same AVIF/WebP `srcset` widths. If the API or Contentful is unavailable, or the content is invalid, the page keeps the snapshot.

SEO tags and site settings (contact email, social links, footer) are read at build time only.

## How a change reaches the site

1. An editor publishes, unpublishes or deletes an entry or asset in Contentful.
2. Visitors see the change on their next page load, within about 30 seconds (the API and CDN cache).
3. The Contentful webhook for that environment calls the Vercel deploy hook, and Vercel runs `content:pull --fallback`, then the normal build, and deploys. This refreshes the prerendered HTML that search engines read, SEO tags and site settings, usually within a few minutes.

Every publish starts its own deployment, so publish related changes together when you can.

If the pull fails (Contentful unreachable, a missing token or an invalid entry), the build logs the reason and continues with the committed snapshot, so the site keeps the previous content. Check the Vercel build log when a change does not appear.

## Environments

| Contentful | Vercel                         | Deploy hook                     |
| ---------- | ------------------------------ | ------------------------------- |
| `master`   | Production (`main`)            | `VERCEL_DEPLOY_HOOK_PRODUCTION` |
| `dev`      | Preview, and local development | `VERCEL_DEPLOY_HOOK_PREVIEW`    |

Contentful environments do not sync. Content created in `dev` must be created again in `master`, or the environment can be cloned in ⚙️ → Environments.

The space has `en` as its default locale and `uk` falling back to `en`. Required fields must be filled in both languages, because pages are prerendered in Ukrainian. When a Ukrainian value is missing, `content:pull` uses the English one and prints a warning.

## Local setup

Copy the Contentful block from `apps/web/.env.example` to `apps/web/.env.local`:

- `CONTENTFUL_SPACE_ID`: ⚙️ → General settings.
- `CONTENTFUL_ENVIRONMENT`: `dev` for day-to-day work.
- `CONTENTFUL_DELIVERY_TOKEN`: ⚙️ → API keys → Content Delivery API token. The key must have access to `master` and `dev`.
- `CONTENTFUL_MANAGEMENT_TOKEN`: https://app.contentful.com/account/profile/cma_tokens, a personal access token starting with `CFPAT-`. The `syntaxis` organization requires each new token to be authorized (Authorize access → Authorize). Keep it local only.

For live content locally, copy `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ENVIRONMENT` and `CONTENTFUL_DELIVERY_TOKEN` into the root `.env` used by the backend as well. Without them the endpoint answers 503 and pages show the snapshot.

Local `pnpm build` and the Docker image use the committed snapshot and need no tokens. Run `pnpm content:pull` to refresh it, review the diff and commit it with the change that needs it.

The scripts run TypeScript directly with Node, which needs Node 22.18 or newer.

## Vercel setup

1. Add the variables in Vercel → Project → Settings → Environment Variables. Do not prefix them with `VITE_`, so they stay out of the browser bundle.

   | Variable                    | Production     | Preview        |
   | --------------------------- | -------------- | -------------- |
   | `CONTENTFUL_SPACE_ID`       | the space ID   | the space ID   |
   | `CONTENTFUL_ENVIRONMENT`    | `master`       | `dev`          |
   | `CONTENTFUL_DELIVERY_TOKEN` | Delivery token | Delivery token |

   Never add `CONTENTFUL_MANAGEMENT_TOKEN` to Vercel. The `api` service reads the same three variables for live content, so keep them available to both services.

2. Create deploy hooks in Vercel → Project → Settings → Git → Deploy Hooks: one for `main` and, optionally, one for the branch that should show `dev` content.
3. Put the hook URLs into `VERCEL_DEPLOY_HOOK_PRODUCTION` and `VERCEL_DEPLOY_HOOK_PREVIEW` in `apps/web/.env.local` and run `pnpm content:webhooks`. It creates or updates one Contentful webhook per environment; a missing preview hook is skipped.

`vercel.json` runs `pnpm content:pull --fallback` before `pnpm build` for the `web` service.

## Scripts

Run from `apps/web`. Every script accepts `--env=<id>` to override `CONTENTFUL_ENVIRONMENT`.

| Script                           | Token      | What it does                                                                                                                                                                       |
| -------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm content:model`             | Management | Checks the locales, then creates or updates and publishes the content types, including field help texts                                                                            |
| `pnpm content:pull [--fallback]` | Delivery   | Writes the generated modules and downloads changed images. On invalid content it writes nothing. With `--fallback`, a failure only warns, so the build uses the committed snapshot |
| `pnpm content:webhooks`          | Management | Creates or updates the Contentful webhooks that trigger the Vercel deploy hooks                                                                                                    |

## Content types

| Type                                                                                                                                                                                                        | Generated module                                             | Used by                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `siteSettings` (single entry)                                                                                                                                                                               | `src/shared/config/site.generated.ts`                        | contact email and social links (`navigation.ts`), footer tagline and copyright                                          |
| `pageSeo`                                                                                                                                                                                                   | `src/shared/config/seo.generated.ts`                         | `<title>`, description and social preview per route; the `HOME` entry is the default                                    |
| `partner`                                                                                                                                                                                                   | `src/entities/partner/model/data.generated.ts`               | home hero strip (`homeOrder`, logo heights, caption) and the Global Collaboration grid (`networkOrder`, code, location) |
| `person`                                                                                                                                                                                                    | `src/pages/about-initiative/model/team.generated.ts`         | team grid (`teamOrder`) and the founder section (`isFounder`, founder name, role and biography)                         |
| `milestone`                                                                                                                                                                                                 | `src/pages/viratec/model/milestones.generated.ts`            | "Our journey" timeline                                                                                                  |
| `galleryItem`                                                                                                                                                                                               | `src/pages/viratec/model/moments.generated.ts`               | "Moments" gallery, the first item is shown large                                                                        |
| `audienceGroup`                                                                                                                                                                                             | `src/pages/opportunities/model/audience-groups.generated.ts` | role tabs on the Opportunities page with their `card` entries                                                           |
| `legalDocument` with `legalSection` entries                                                                                                                                                                 | `src/pages/legal/model/documents.generated.ts`               | Terms, Privacy, Cookie Policy and Community Guidelines, each with its own version and last-updated date                 |
| `homePage`, `aboutInitiativePage`, `viratecPage`, `globalCollaborationPage`, `opportunitiesPage`, `researchAreasPage`, `studentResearchPage`, `experientialLearningPage`, `contactPage` (single entry each) | `src/pages/<page>/model/page.generated.ts`                   | all texts and card photos of that page                                                                                  |

Shared blocks: `link` (a site page from a fixed list or an external URL), `card`, `stat` and `step`. Cards, stats and steps are created inside the entry that uses them and keep its order.

A partner or person appears in a list only when its order field is set. Order fields sort ascending. Exactly one person must be marked as the founder, and the founder's biography separates paragraphs with an empty line.

Legal sections keep their structure as plain text: paragraphs are separated by an empty line, list items by line breaks, and table cells by `|` with the header on the first line. Write `{contactEmail}` where the contact email belongs; the pull replaces it with the email from Site settings.

The page types are described declaratively in `build-tools/contentful/pages/specs.ts`: each field maps a path in the page content object to a Contentful field (`symbol`, `text`, `symbols`, `stats`, `steps`, `cards`, `image`). The home page "Latest from VIRaTeC" cards are not in Contentful; they mirror publications from the database.

## Changing the model

1. Edit the domain in `build-tools/contentful/domains/` or a page in `pages/specs.ts`. A new domain is registered in `domains/index.ts`.
2. Run `pnpm content:model` against `dev`, fill the new fields in Contentful, run `pnpm content:pull` and update the consumers of the generated module.
3. Check the pages, then run `pnpm content:model --env=master` and fill the same content in `master` before merging to `main`. Otherwise the production pull fails validation and the build keeps the previous snapshot.

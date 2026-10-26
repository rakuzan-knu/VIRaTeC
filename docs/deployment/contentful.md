# Contentful

Contentful holds the site content that used to be hardcoded in the web app: page texts, partners, team, timeline, gallery, opportunities, legal documents, SEO and site settings. Publications, events and projects stay in the database and are not managed here.

Content is pulled at build time into typed modules committed to the repo, and images are downloaded into `src/shared/assets/contentful/`. Pages prerender synchronously from this snapshot, and images go through the usual responsive pipeline (AVIF/WebP `srcset`).

After the page loads, the browser asks the API for the published entries (`GET /api/v1/content/entries?types=…`), maps them with the same domain code as the build (`build-tools/contentful/runtime.ts`, loaded as a separate chunk) and swaps in the fresh content through `useLiveContent`. The API proxies the Content Delivery API, so the token never reaches the browser. It caches each response until the content changes: a publish bumps a revision in the database (`content_cache_state`), and every API instance checks it at most every 5 seconds. Contentful API calls are therefore spent only when content is published, which keeps the free plan quota (100,000 calls per month for all APIs together) safe. Live images are served by the Contentful Images API (`images.ctfassets.net`) with the same AVIF/WebP `srcset` widths. If the API or Contentful is unavailable, or the content is invalid, the page keeps the snapshot.

SEO tags and site settings (contact email, social links, footer) are read at build time only.

## How a change reaches the site

1. An editor publishes, unpublishes or deletes an entry or asset in Contentful.
2. The Contentful webhook for the API refreshes the content cache, and visitors see the change on their next page load, within about 30 seconds (the CDN cache).
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

   The `api` service reads the same three variables for live content, so keep them available to both services. For the site editor, add to the `api` service only:

   | Variable                      | Value                                                                        |
   | ----------------------------- | ---------------------------------------------------------------------------- |
   | `CONTENTFUL_PREVIEW_TOKEN`    | ⚙️ → API keys → Content Preview API token                                    |
   | `CONTENTFUL_MANAGEMENT_TOKEN` | a personal access token of a dedicated Contentful user that owns the editing |
   | `CONTENTFUL_WEBHOOK_SECRET`   | a long random string, e.g. `openssl rand -hex 32`                            |

   Never give these to the `web` service: anything there can end up in the browser bundle.

2. Create deploy hooks in Vercel → Project → Settings → Git → Deploy Hooks: one for `main` and, optionally, one for the branch that should show `dev` content.
3. Put the hook URLs into `VERCEL_DEPLOY_HOOK_PRODUCTION` and `VERCEL_DEPLOY_HOOK_PREVIEW` in `apps/web/.env.local`. For the cache refresh, set `CONTENT_CACHE_HOOK_PRODUCTION` and `CONTENT_CACHE_HOOK_PREVIEW` to `https://<api host>/api/v1/content/webhook` and `CONTENTFUL_WEBHOOK_SECRET` to the same secret as the API. Run `pnpm content:webhooks`. It creates or updates the Contentful webhooks per environment; a missing hook is skipped.

`vercel.json` runs `pnpm content:pull --fallback` before `pnpm build` for the `web` service.

## Site editor

Owners and administrators with content permissions edit the site in place. **Edit site** in the account menu or the admin panel opens the home page in editor mode: a cyan frame marks the mode, and a toolbar at the top right holds the mode switch, the change summary and the exit button.

- Click any text or image that comes from Contentful to open its entry in the side panel. Hold Alt to follow a link instead. Every field of the entry is editable there, in both languages, including lists (reorder, add, remove), links and images. **Used in** opens the entries that contain this one.
- **Save draft** stores the edit in Contentful as a draft; visitors keep seeing the published version. The page in editor mode shows drafts through the Content Preview API.
- **Summary** lists every unpublished change of all editors, with the author and time, and problems that would block publishing. A change can be discarded, which restores the published version or deletes a never-published entry.
- **Publish** requires a fresh two-factor confirmation and publishes images first, then new entries, then the rest. Failed entries stay in the list with the reason from Contentful.

Permissions: `CONTENT_VIEW` opens the editor and shows drafts, `CONTENT_EDIT` saves and discards drafts, `MEDIA_MANAGE` uploads images, `CONTENT_PUBLISH` publishes. The API enforces them; the editor only hides what is not allowed. Every save, upload, discard and publish is written to the audit log with the previous and the new values.

The editor maps page elements to fields without changes to the page components: in editor mode the localized text fields of the preview content carry invisible markers (zero-width characters) that encode the entry, the field and the locale, and images are matched by their Contentful asset id. Texts that do not come from Contentful or the database (navigation, buttons of the interface) are not editable in the editor.

### Page sections

Every marketing page (home, About, VIRaTeC, Global Collaboration, Opportunities, Research Areas, Student Research, Experiential Learning, Contact) renders the content below its intro through `PageSections`. **Page sections** in the editor toolbar, or a click on an empty part of a section, opens the structure of the current page:

- Built-in sections can be reordered and hidden, never deleted; they are listed in `PAGE_SECTIONS` in `src/shared/config/pageLayout.ts`. A built-in section added to the code later appears at the end of existing layouts.
- Added sections are one of five kinds: **Text** (eyebrow, title, paragraphs), **Image and text** (a photo left or right of a title and paragraphs), **Cards** (up to 12 cards, each with an optional image and link to a site page), **Numbers** (up to 6 figures with captions) and **Call to action** (a button to a site page or an `https://` address). Every text has English and Ukrainian values; an empty Ukrainian value falls back to English. They reuse the site components, so they follow the design system. Images are uploaded as Contentful assets (published together with the layout) and stored in the layout by asset id and URL, with a description for screen readers.
- Section backgrounds alternate automatically by position (`SectionToneProvider`), so reordering or hiding never puts two highlighted sections next to each other. With no layout the result equals the original design.
- Changes show on the page immediately in editor mode and are saved as a draft of the page's `pageLayout` entry (created on the first save), then published from Summary like any other change.

The layout lives in the `pageLayout` content type: one entry per page with a JSON `sections` field validated by `pageSectionsSchema`. Pages without an entry, or with an invalid one, render their built-in sections in the code order. Run `pnpm content:model` (and `--env=master`) once to create the type; it brings the space to 23 of the 25 content types of the free plan.

### History, help and accessibility

- **Undo / redo** in Summary (and `Ctrl+Z` / `Ctrl+Shift+Z`, `⌘` on a Mac, outside text fields) work on your own saved actions in this session: saving an entry, record or page layout, adding and deleting. Undoing a save restores the previous draft, or discards the draft when the content was published and unchanged before. Undoing an addition removes the draft; such an action cannot be redone. **Undo all** undoes the whole session, newest first, after a confirmation. Publishing clears the history, and published content is never changed by undo.
- Summary can be collapsed to its header; the editor always asks before leaving and says whether unsaved edits or unpublished drafts remain.
- A help dialog (the **?** button) explains the workflow and the keyboard shortcuts; it opens once automatically on the first visit.
- Every icon button has a name and a tooltip with its shortcut, panels move focus to their heading when they open, saves, publishing and undo are announced to screen readers through a polite live region, and scrolling respects reduced motion.

### Projects, events and publications

Records stored in the database are edited in the same mode. Click a project, event or publication card to open the record, or add a new one with **Add to the site** in Summary (a publication asks for its page address first, which cannot change later). The fields of each record type are defined once in `packages/contracts/src/records.ts` (`RECORD_DEFINITIONS` and the zod `RECORD_SCHEMAS`) and drive both the editor form and the API validation.

- **Save draft** stores the record in `content_changes.draft`; the live tables are not touched. In editor mode the project, event and publication requests apply the drafts in the browser (`previewRecords`), so the page shows exactly what publishing will produce, new records included and deleted ones hidden.
- **Delete** only marks the record; it is removed when the change is published, and the audit log keeps the full previous data.
- **Publish** applies record changes after the Contentful ones, each in a transaction. A record that changed in the database after its draft was saved is not overwritten: the change stays in Summary with the reason. Required fields must be filled in both languages, and the English title and description are also written to the base columns.

Events can be edited with `EVENTS_MANAGE` as well as `CONTENT_EDIT`; projects and publications need `CONTENT_EDIT`. The public API caches of the three lists are cleared on publish; browsers may keep the previous list for up to a minute (`Cache-Control: max-age=60`).

Images are converted to WebP in the browser and uploaded up to 3 MB, which fits the Vercel request body limit.

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
| `pageLayout` (one entry per page)                                                                                                                                                                           | `src/shared/config/pageLayouts.generated.ts`                 | order, hidden built-in sections and added sections of the marketing pages                                               |
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

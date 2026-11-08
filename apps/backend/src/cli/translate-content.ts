import { NestFactory } from '@nestjs/core';
import { ContentResourceType } from '@prisma/client';
import { RECORD_RESOURCES, type ContentFields, type RecordResource } from '@viratec/contracts';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { AutoTranslateService } from '../content/auto-translate.service';
import { ContentfulClient } from '../content/contentful.client';
import { ContentService } from '../content/content.service';
import { RECORD_RESOURCE_TYPES, RecordEditorService } from '../content/record-editor.service';
import { TranslationService } from '../content/translation.service';

const ACTOR_ID = 'cli:translate-content';
const PAGE_SIZE = 100;
const LABEL = 'Automatic translation';

interface CmaEntry {
  sys: {
    id: string;
    version: number;
    publishedVersion?: number;
    contentType: { sys: { id: string } };
  };
  fields?: ContentFields;
}

interface CmaPage {
  items: CmaEntry[];
  total: number;
}

interface Totals {
  translated: number;
  unchanged: number;
  skipped: number;
  failed: number;
}

const USAGE =
  'Usage: pnpm --filter @viratec/backend content:translate [--dry-run] [--only records|entries]';

const parseArgs = (args: string[]) => {
  const dryRun = args.includes('--dry-run');
  const onlyIndex = args.indexOf('--only');
  const only = onlyIndex >= 0 ? args[onlyIndex + 1] : undefined;
  const known = args.every(
    (arg, index) =>
      arg === '--dry-run' || arg === '--only' || (onlyIndex >= 0 && index === onlyIndex + 1),
  );
  if (!known || (onlyIndex >= 0 && only !== 'records' && only !== 'entries')) {
    console.error(USAGE);
    process.exit(1);
  }
  return { dryRun, records: only !== 'entries', entries: only !== 'records' };
};

const listKeys = async (prisma: PrismaService, resource: RecordResource) => {
  if (resource === 'publication') {
    const rows = await prisma.publication.findMany({ select: { slug: true } });
    return rows.map((row) => row.slug);
  }
  const rows =
    resource === 'project'
      ? await prisma.project.findMany({ select: { id: true } })
      : await prisma.event.findMany({ select: { id: true } });
  return rows.map((row) => row.id);
};

const translateRecords = async (
  prisma: PrismaService,
  records: RecordEditorService,
  autoTranslate: AutoTranslateService,
  dryRun: boolean,
  totals: Totals,
) => {
  for (const resource of RECORD_RESOURCES) {
    for (const key of await listKeys(prisma, resource)) {
      const label = `${resource} ${key}`;
      const record = await records.getRecord(resource, key);
      if (record.hasDraft || !record.published || !record.updatedAt) {
        console.log(`skip ${label}: it has unpublished changes, it is translated on publish`);
        totals.skipped += 1;
        continue;
      }
      if (dryRun) {
        console.log(`would check ${label}`);
        continue;
      }
      const result = await autoTranslate.translateRecord(resource, key, record.published, ACTOR_ID);
      if (result.failed) totals.failed += 1;
      if (!result.changed) {
        totals.unchanged += 1;
        continue;
      }
      const change = await prisma.contentChange.create({
        data: {
          resourceType: RECORD_RESOURCE_TYPES[resource],
          resourceId: key,
          label: LABEL,
          draft: JSON.parse(JSON.stringify(result.value)),
          baseUpdatedAt: new Date(record.updatedAt),
        },
      });
      try {
        await records.applyChange(change);
        console.log(`translated ${label}${result.failed ? ' (some languages failed)' : ''}`);
        totals.translated += 1;
      } catch (error) {
        await prisma.contentChange.delete({ where: { id: change.id } }).catch(() => undefined);
        console.warn(`failed ${label}: ${String(error)}`);
        totals.failed += 1;
      }
    }
  }
};

const translateEntries = async (
  prisma: PrismaService,
  contentful: ContentfulClient,
  autoTranslate: AutoTranslateService,
  dryRun: boolean,
  totals: Totals,
) => {
  const locales = await contentful.request<unknown>('management', '/locales');
  const contentTypes = new Map<string, unknown>();
  const pending = new Set(
    (
      await prisma.contentChange.findMany({
        where: { resourceType: ContentResourceType.ENTRY },
        select: { resourceId: true },
      })
    ).map((change) => change.resourceId),
  );

  for (let skip = 0; ; skip += PAGE_SIZE) {
    const page = await contentful.request<CmaPage>('management', '/entries', {
      query: { limit: String(PAGE_SIZE), skip: String(skip), order: 'sys.createdAt' },
    });
    for (const entry of page.items) {
      const { id, version, publishedVersion } = entry.sys;
      const typeId = entry.sys.contentType.sys.id;
      const label = `${typeId} ${id}`;
      if (!publishedVersion || version !== publishedVersion + 1 || pending.has(id)) {
        console.log(`skip ${label}: not published or has unpublished changes`);
        totals.skipped += 1;
        continue;
      }
      if (dryRun) {
        console.log(`would check ${label}`);
        continue;
      }
      if (!contentTypes.has(typeId)) {
        contentTypes.set(
          typeId,
          await contentful.request<unknown>('management', `/content_types/${typeId}`),
        );
      }
      try {
        const result = await autoTranslate.translateEntry(
          id,
          contentTypes.get(typeId),
          locales,
          contentful.config.locales,
          entry.fields ?? {},
          ACTOR_ID,
        );
        if (result.failed) totals.failed += 1;
        if (!result.changed) {
          totals.unchanged += 1;
          continue;
        }
        const saved = await contentful.request<CmaEntry>('management', `/entries/${id}`, {
          method: 'PUT',
          version,
          body: { fields: result.value },
        });
        await contentful.request('management', `/entries/${id}/published`, {
          method: 'PUT',
          version: saved.sys.version,
        });
        console.log(`translated ${label}${result.failed ? ' (some languages failed)' : ''}`);
        totals.translated += 1;
      } catch (error) {
        console.warn(`failed ${label}: ${String(error)}`);
        totals.failed += 1;
      }
    }
    if (skip + PAGE_SIZE >= page.total) break;
  }
};

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['warn', 'error'],
  });
  try {
    const translation = app.get(TranslationService, { strict: false });
    if (!options.dryRun && !translation.isConfigured()) {
      throw new Error('ANTHROPIC_API_KEY is not set, nothing can be translated.');
    }
    const prisma = app.get(PrismaService, { strict: false });
    const autoTranslate = app.get(AutoTranslateService, { strict: false });
    const contentful = app.get(ContentfulClient, { strict: false });
    const totals: Totals = { translated: 0, unchanged: 0, skipped: 0, failed: 0 };

    if (options.records) {
      const records = app.get(RecordEditorService, { strict: false });
      await translateRecords(prisma, records, autoTranslate, options.dryRun, totals);
    }
    if (options.entries) {
      if (!contentful.isConfigured('management')) {
        console.warn('Contentful management token is not set, entries are skipped.');
      } else {
        await translateEntries(prisma, contentful, autoTranslate, options.dryRun, totals);
        if (!options.dryRun && totals.translated > 0) {
          await app.get(ContentService, { strict: false }).invalidate();
        }
      }
    }

    console.log(
      `Done: ${totals.translated} translated, ${totals.unchanged} already up to date, ` +
        `${totals.skipped} skipped, ${totals.failed} with failures.`,
    );
    if (totals.failed > 0) {
      console.log('Run the command again later to retry the failed ones; finished ones are kept.');
    }
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

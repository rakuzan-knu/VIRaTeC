import { createHash } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CONTENT_LOCALE_KEYS,
  LOCALE_PLACEHOLDER,
  PublicationBlockSchema,
  RECORD_DEFINITIONS,
  SOURCE_CONTENT_LOCALE,
  TRANSLATED_CONTENT_LOCALES,
  TRANSLATION_LIMITS,
  readRecordValue,
  type ContentFields,
  type ContentLocales,
  type PublicationBlockDto,
  type RecordData,
  type RecordResource,
  type TranslatedContentLocale,
} from '@viratec/contracts';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';
import { TranslationService } from './translation.service';

interface Slot {
  path: string;
  source: unknown;
  targets: Partial<Record<TranslatedContentLocale, unknown>>;
}

interface Written {
  locale: TranslatedContentLocale;
  path: string;
  value: unknown;
}

export interface AutoTranslateResult<T> {
  value: T;
  changed: boolean;
  failed: boolean;
}

const TEXT_FIELD_TYPES = new Set(['Symbol', 'Text']);
const TEXT_RECORD_KINDS = new Set(['text', 'longText']);

const contentTypeSchema = z.object({
  fields: z.array(
    z.object({ id: z.string(), type: z.string(), localized: z.boolean().optional() }),
  ),
});

const localesSchema = z.object({ items: z.array(z.object({ code: z.string() })) });

const blocksSchema = z.array(PublicationBlockSchema);

const hash = (value: unknown) =>
  createHash('sha256')
    .update(JSON.stringify(value ?? ''))
    .digest('hex');

const isEmpty = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && !value.trim()) ||
  (Array.isArray(value) && value.length === 0);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const blockTexts = (block: PublicationBlockDto): string[] => {
  if (block.kind === 'quote') return [block.text, block.author];
  if (block.kind === 'list') return block.items;
  if (block.kind === 'image') return [block.alt, block.caption];
  return [block.text];
};

const withBlockTexts = (block: PublicationBlockDto, texts: string[]): PublicationBlockDto => {
  const next = (index: number) => texts[index] ?? '';
  if (block.kind === 'quote') return { ...block, text: next(0), author: next(1) };
  if (block.kind === 'list') return { ...block, items: block.items.map((_, index) => next(index)) };
  if (block.kind === 'image') return { ...block, alt: next(0), caption: next(1) };
  return { ...block, text: next(0) };
};

const textsOf = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  const blocks = blocksSchema.safeParse(value);
  return blocks.success ? blocks.data.flatMap(blockTexts) : [];
};

const rebuild = (source: unknown, texts: string[]): unknown => {
  if (typeof source === 'string') return texts[0] ?? '';
  const blocks = blocksSchema.parse(source);
  let offset = 0;
  return blocks.map((block) => {
    const count = blockTexts(block).length;
    const result = withBlockTexts(block, texts.slice(offset, offset + count));
    offset += count;
    return result;
  });
};

const setPath = (target: Record<string, unknown>, path: string, value: unknown) => {
  const keys = path.split('.');
  let node = target;
  for (const key of keys.slice(0, -1)) {
    const child = node[key];
    if (!isRecord(child) && !Array.isArray(child)) node[key] = {};
    node = node[key] as Record<string, unknown>;
  }
  node[keys[keys.length - 1]] = value;
};

const JSON_PATH_SEPARATOR = '#';

const isLocalizedMap = (value: unknown): value is Record<string, unknown> & { en: string } =>
  isRecord(value) &&
  typeof value.en === 'string' &&
  Object.keys(value).every((key) => CONTENT_LOCALE_KEYS.some((locale) => locale === key));

const localizedMaps = (
  value: unknown,
  fieldId: string,
  path: string[] = [],
): { path: string; map: Record<string, unknown> & { en: string } }[] => {
  if (isLocalizedMap(value)) {
    return [{ path: `${fieldId}${JSON_PATH_SEPARATOR}${path.join('.')}`, map: value }];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => localizedMaps(item, fieldId, [...path, String(index)]));
  }
  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, item]) =>
      localizedMaps(item, fieldId, [...path, key]),
    );
  }
  return [];
};

const localeRoot = (path: string) => path.slice(0, path.indexOf(LOCALE_PLACEHOLDER));

@Injectable()
export class AutoTranslateService {
  private readonly logger = new Logger(AutoTranslateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly translation: TranslationService,
  ) {}

  async translateRecord(
    resource: RecordResource,
    key: string,
    data: RecordData,
    actorId: string,
  ): Promise<AutoTranslateResult<RecordData>> {
    const fields = RECORD_DEFINITIONS[resource].fields.filter(
      (field) => field.localized && (TEXT_RECORD_KINDS.has(field.kind) || field.kind === 'blocks'),
    );
    const slots: Slot[] = fields.map((field) => ({
      path: field.path,
      source: readRecordValue(data, field.path.replace(LOCALE_PLACEHOLDER, SOURCE_CONTENT_LOCALE)),
      targets: Object.fromEntries(
        TRANSLATED_CONTENT_LOCALES.map((locale) => [
          locale,
          readRecordValue(data, field.path.replace(LOCALE_PLACEHOLDER, locale)),
        ]),
      ),
    }));
    const { written, failedLocales } = await this.translateSlots(
      `record:${resource}:${key}`,
      slots,
      TRANSLATED_CONTENT_LOCALES,
      actorId,
    );
    const kept = written.filter((item) => !failedLocales.has(item.locale));
    if (kept.length === 0) {
      return { value: data, changed: false, failed: failedLocales.size > 0 };
    }

    const next = structuredClone(data);
    const root = localeRoot(fields[0]?.path ?? '');
    for (const locale of new Set(kept.map((item) => item.locale))) {
      if (!isRecord(readRecordValue(next, `${root}${locale}`))) {
        setPath(
          next,
          `${root}${locale}`,
          structuredClone(readRecordValue(next, `${root}${SOURCE_CONTENT_LOCALE}`)),
        );
      }
    }
    for (const item of kept) {
      setPath(next, item.path.replace(LOCALE_PLACEHOLDER, item.locale), item.value);
    }
    await this.remember(`record:${resource}:${key}`, slots, kept);
    return { value: next, changed: true, failed: failedLocales.size > 0 };
  }

  async translateEntry(
    entryId: string,
    contentType: unknown,
    availableLocales: unknown,
    codes: ContentLocales,
    fields: ContentFields,
    actorId: string,
  ): Promise<AutoTranslateResult<ContentFields>> {
    const type = contentTypeSchema.safeParse(contentType);
    const space = localesSchema.safeParse(availableLocales);
    if (!type.success || !space.success) return { value: fields, changed: false, failed: false };
    const existing = new Set(space.data.items.map((item) => item.code));

    const slots: Slot[] = type.data.fields
      .filter((field) => field.localized && TEXT_FIELD_TYPES.has(field.type))
      .map((field) => ({
        path: field.id,
        source: fields[field.id]?.[codes.en],
        targets: Object.fromEntries(
          TRANSLATED_CONTENT_LOCALES.map((locale) => [locale, fields[field.id]?.[codes[locale]]]),
        ),
      }));
    const objects = type.data.fields.filter((field) => !field.localized && field.type === 'Object');
    const jsonSlots: Slot[] = objects.flatMap((field) =>
      localizedMaps(fields[field.id]?.[codes.en], field.id).map(({ path, map }) => ({
        path,
        source: map.en,
        targets: Object.fromEntries(
          TRANSLATED_CONTENT_LOCALES.map((locale) => [locale, map[locale]]),
        ),
      })),
    );

    const resourceKey = `entry:${entryId}`;
    const fieldResult = await this.translateSlots(
      resourceKey,
      slots,
      TRANSLATED_CONTENT_LOCALES,
      actorId,
    );
    const jsonResult = await this.translateSlots(
      resourceKey,
      jsonSlots,
      TRANSLATED_CONTENT_LOCALES,
      actorId,
    );
    const failed = fieldResult.failedLocales.size + jsonResult.failedLocales.size > 0;
    if (fieldResult.written.length + jsonResult.written.length === 0) {
      return { value: fields, changed: false, failed };
    }

    const next: ContentFields = { ...fields };
    for (const item of fieldResult.written) {
      if (!existing.has(codes[item.locale])) continue;
      next[item.path] = { ...next[item.path], [codes[item.locale]]: item.value };
    }
    for (const field of objects) {
      const items = jsonResult.written.filter((item) =>
        item.path.startsWith(`${field.id}${JSON_PATH_SEPARATOR}`),
      );
      if (items.length === 0) continue;
      const json = structuredClone(fields[field.id]?.[codes.en]);
      if (!isRecord(json) && !Array.isArray(json)) continue;
      for (const item of items) {
        const mapPath = item.path.slice(field.id.length + JSON_PATH_SEPARATOR.length);
        setPath(json as Record<string, unknown>, `${mapPath}.${item.locale}`, item.value);
      }
      next[field.id] = { ...next[field.id], [codes.en]: json };
    }
    await this.remember(
      resourceKey,
      [...slots, ...jsonSlots],
      [...fieldResult.written, ...jsonResult.written],
    );
    return { value: next, changed: true, failed };
  }

  private async translateSlots(
    resourceKey: string,
    slots: Slot[],
    locales: readonly TranslatedContentLocale[],
    actorId: string,
  ) {
    const failedLocales = new Set<TranslatedContentLocale>();
    const written: Written[] = [];
    if (slots.length === 0 || locales.length === 0) return { written, failedLocales };

    const rows = await this.prisma.contentTranslation.findMany({ where: { resourceKey } });
    const memory = new Map(rows.map((row) => [`${row.locale}:${row.path}`, row]));

    for (const locale of locales) {
      const pending = slots.filter((slot) => {
        if (isEmpty(slot.source) || textsOf(slot.source).length === 0) return false;
        const row = memory.get(`${locale}:${slot.path}`);
        const target = slot.targets[locale] ?? row?.value;
        if (isEmpty(target)) return true;
        return Boolean(
          row && row.sourceHash !== hash(slot.source) && row.valueHash === hash(target),
        );
      });
      if (pending.length === 0) continue;
      if (!this.translation.isConfigured()) {
        failedLocales.add(locale);
        continue;
      }

      const texts = pending.flatMap((slot) => textsOf(slot.source));
      const translated: string[] = [];
      try {
        for (let start = 0; start < texts.length; start += TRANSLATION_LIMITS.maxTexts) {
          const chunk = texts.slice(start, start + TRANSLATION_LIMITS.maxTexts);
          const { translations } = await this.translation.translateForPublish(actorId, {
            from: SOURCE_CONTENT_LOCALE,
            to: locale,
            texts: chunk,
          });
          translated.push(...translations);
        }
      } catch (error) {
        this.logger.warn(`Auto-translation into ${locale} failed: ${String(error)}`);
        failedLocales.add(locale);
        continue;
      }

      let offset = 0;
      for (const slot of pending) {
        const count = textsOf(slot.source).length;
        written.push({
          locale,
          path: slot.path,
          value: rebuild(slot.source, translated.slice(offset, offset + count)),
        });
        offset += count;
      }
    }
    return { written, failedLocales };
  }

  private async remember(resourceKey: string, slots: Slot[], written: Written[]) {
    const sources = new Map(slots.map((slot) => [slot.path, slot.source]));
    await this.prisma.$transaction(
      written.map((item) => {
        const values = {
          sourceHash: hash(sources.get(item.path)),
          valueHash: hash(item.value),
          value: item.value as Prisma.InputJsonValue,
        };
        return this.prisma.contentTranslation.upsert({
          where: {
            resourceKey_locale_path: { resourceKey, locale: item.locale, path: item.path },
          },
          create: { resourceKey, locale: item.locale, path: item.path, ...values },
          update: values,
        });
      }),
    );
  }
}

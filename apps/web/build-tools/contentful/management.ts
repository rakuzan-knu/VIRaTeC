import { setTimeout as sleep } from 'node:timers/promises';
import { z } from 'zod';
import type { ContentfulConfig } from './env.ts';
import { widgetFor, type ContentTypeDefinition } from './content-types.ts';
import { contentfulRequest, isNotFound } from './http.ts';

const MANAGEMENT_HOST = 'https://api.contentful.com';
const EDITOR_INTERFACE_ATTEMPTS = 10;

const versionedSchema = z.object({
  sys: z.object({ id: z.string(), version: z.number() }),
});

const localesSchema = z.object({
  items: z.array(
    z.object({ code: z.string(), default: z.boolean(), fallbackCode: z.string().nullable() }),
  ),
});

const editorInterfaceSchema = versionedSchema.extend({
  controls: z.array(z.object({ fieldId: z.string() }).passthrough()).optional(),
});

type Versioned = z.infer<typeof versionedSchema>;

export const createManagementClient = (config: ContentfulConfig) => {
  const environmentPath = `/spaces/${config.spaceId}/environments/${config.environment}`;
  const url = (path: string, host = MANAGEMENT_HOST) => new URL(`${environmentPath}${path}`, host);
  const versionHeader = (resource: Versioned) => ({
    'X-Contentful-Version': String(resource.sys.version),
  });

  const get = async <T>(path: string, schema: z.ZodType<T>): Promise<T | undefined> => {
    try {
      return schema.parse(await contentfulRequest(url(path), { token: config.token }));
    } catch (error) {
      if (isNotFound(error)) return undefined;
      throw error;
    }
  };

  const put = async (path: string, body: unknown, headers: Record<string, string> = {}) =>
    versionedSchema.parse(
      await contentfulRequest(url(path), { method: 'PUT', token: config.token, body, headers }),
    );

  const updateHelpTexts = async (definition: ContentTypeDefinition) => {
    const path = `/content_types/${definition.id}/editor_interface`;
    for (let attempt = 0; attempt < EDITOR_INTERFACE_ATTEMPTS; attempt += 1) {
      const editorInterface = await get(path, editorInterfaceSchema);
      if (editorInterface) {
        const controls = definition.fields.map((item) => ({
          fieldId: item.id,
          widgetNamespace: 'builtin',
          widgetId: widgetFor(item),
          settings: {
            ...(item.help && { helpText: item.help }),
            ...(item.type === 'Date' && { format: 'dateonly' }),
          },
        }));
        await put(path, { controls }, versionHeader(editorInterface));
        return;
      }
      await sleep(1000);
    }
    throw new Error(`Editor interface of ${definition.id} is not available`);
  };

  const publish = (path: string, resource: Versioned) =>
    put(`${path}/${resource.sys.id}/published`, undefined, versionHeader(resource));

  return {
    async listLocales() {
      return localesSchema.parse(await contentfulRequest(url('/locales'), { token: config.token }))
        .items;
    },

    async upsertContentType(definition: ContentTypeDefinition) {
      const existing = await get(`/content_types/${definition.id}`, versionedSchema);
      const { id, fields, ...rest } = definition;
      const saved = await put(
        `/content_types/${id}`,
        { ...rest, fields: fields.map(({ help: _help, ...item }) => item) },
        existing ? versionHeader(existing) : {},
      );
      await publish('/content_types', saved);
      await updateHelpTexts(definition);
      return existing ? 'updated' : 'created';
    },
  };
};

export type ManagementClient = ReturnType<typeof createManagementClient>;

import { z } from 'zod';
import { readManagementConfig } from './env.ts';
import { contentfulRequest, isNotFound } from './http.ts';
import { printList, runScript } from './cli.ts';

const MANAGEMENT_HOST = 'https://api.contentful.com';
const VERCEL_HOOK = /^https:\/\/api\.vercel\.com\/v1\/integrations\/deploy\/\S+$/;

const TOPICS = [
  'Entry.publish',
  'Entry.unpublish',
  'Entry.delete',
  'Asset.publish',
  'Asset.unpublish',
  'Asset.delete',
] as const;

const TARGETS = [
  { id: 'vercel-production', environment: 'master', variable: 'VERCEL_DEPLOY_HOOK_PRODUCTION' },
  { id: 'vercel-preview', environment: 'dev', variable: 'VERCEL_DEPLOY_HOOK_PREVIEW' },
] as const;

const webhookSchema = z.object({ sys: z.object({ version: z.number() }) });

runScript(async () => {
  const config = readManagementConfig();
  const skipped: string[] = [];

  for (const target of TARGETS) {
    const hook = process.env[target.variable]?.trim();
    if (!hook) {
      skipped.push(`${target.environment}: ${target.variable} is not set`);
      continue;
    }
    if (!VERCEL_HOOK.test(hook)) {
      throw new Error(`${target.variable} must be a Vercel deploy hook URL`);
    }

    const url = new URL(
      `/spaces/${config.spaceId}/webhook_definitions/${target.id}`,
      MANAGEMENT_HOST,
    );
    const existing = await contentfulRequest(url, { token: config.token }).then(
      (body) => webhookSchema.parse(body),
      (error: unknown) => {
        if (isNotFound(error)) return undefined;
        throw error;
      },
    );

    await contentfulRequest(url, {
      method: 'PUT',
      token: config.token,
      headers: existing ? { 'X-Contentful-Version': String(existing.sys.version) } : {},
      body: {
        name: `Deploy ${target.environment} to Vercel`,
        url: hook,
        topics: TOPICS,
        filters: [{ equals: [{ doc: 'sys.environment.sys.id' }, target.environment] }],
        active: true,
      },
    });
    console.log(
      `Webhook ${target.id}: ${existing ? 'updated' : 'created'} for ${target.environment}`,
    );
  }

  printList('Skipped', skipped);
});

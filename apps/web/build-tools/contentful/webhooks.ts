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

const CACHE_HOOK = /^https:\/\/\S+\/api\/v1\/content\/webhook$/;

interface WebhookTarget {
  id: string;
  name: string;
  environment: 'master' | 'dev';
  variable: string;
  pattern: RegExp;
  secret?: string;
}

const TARGETS: readonly WebhookTarget[] = [
  {
    id: 'vercel-production',
    name: 'Deploy master to Vercel',
    environment: 'master',
    variable: 'VERCEL_DEPLOY_HOOK_PRODUCTION',
    pattern: VERCEL_HOOK,
  },
  {
    id: 'vercel-preview',
    name: 'Deploy dev to Vercel',
    environment: 'dev',
    variable: 'VERCEL_DEPLOY_HOOK_PREVIEW',
    pattern: VERCEL_HOOK,
  },
  {
    id: 'api-cache-production',
    name: 'Refresh master content cache',
    environment: 'master',
    variable: 'CONTENT_CACHE_HOOK_PRODUCTION',
    pattern: CACHE_HOOK,
    secret: 'CONTENTFUL_WEBHOOK_SECRET',
  },
  {
    id: 'api-cache-preview',
    name: 'Refresh dev content cache',
    environment: 'dev',
    variable: 'CONTENT_CACHE_HOOK_PREVIEW',
    pattern: CACHE_HOOK,
    secret: 'CONTENTFUL_WEBHOOK_SECRET',
  },
];

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
    if (!target.pattern.test(hook)) {
      throw new Error(`${target.variable} has an unexpected URL format`);
    }
    const secret = target.secret ? process.env[target.secret]?.trim() : undefined;
    if (target.secret && !secret) {
      skipped.push(`${target.environment}: ${target.secret} is not set`);
      continue;
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
        name: target.name,
        url: hook,
        ...(secret && {
          headers: [{ key: 'Authorization', value: `Bearer ${secret}`, secret: true }],
        }),
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

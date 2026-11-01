import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin } from 'vite';
import {
  CLIENT_RENDER_ATTRIBUTE,
  PRERENDERED_PATH_ATTRIBUTE,
  PRERENDER_LOCALE,
} from '../src/shared/config/prerender';
import {
  LEGACY_TOKEN_STORAGE_KEYS,
  LOCALE_STORAGE_KEY,
  SESSION_HINT_STORAGE_KEY,
} from '../src/shared/config/storageKeys';
import { DEFAULT_LOCALE, LOCALES } from '../src/shared/i18n/model/types';
import { toRoutePath } from './route-preload-plugin';

const SERVER_ENTRY = 'entry-server.js';
const SPA_FALLBACK_FILE = 'spa.html';
const EMPTY_ROOT = '<div id="root"></div>';
const VERCEL_CONFIG = '../../vercel.json';
const CSP_HEADER = 'Content-Security-Policy';
const INLINE_SCRIPT =
  /<script(?![^>]*\bsrc=)(?![^>]*type="application\/(?:ld\+)?json")[^>]*>([\s\S]*?)<\/script>/g;

interface VercelConfig {
  headers?: { headers: { key: string; value: string }[] }[];
}

const scriptHash = (source: string) =>
  `'sha256-${createHash('sha256').update(source).digest('base64')}'`;

async function readAllowedScripts(root: string) {
  const config = JSON.parse(await readFile(resolve(root, VERCEL_CONFIG), 'utf8')) as VercelConfig;
  const policy =
    config.headers?.flatMap((rule) => rule.headers).find((header) => header.key === CSP_HEADER)
      ?.value ?? '';
  const scriptSrc = policy
    .split(';')
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith('script-src '));
  return new Set(scriptSrc?.split(/\s+/).slice(1) ?? []);
}

interface ClientRenderCheck {
  attribute: string;
  prerenderLocale: string;
  locales: readonly string[];
  defaultLocale: string;
  localeKey: string;
  sessionKeys: string[];
  legacyTokenKeys: string[];
}

function markClientRender(check: ClientRenderCheck) {
  const read = (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const stored = read(check.localeKey);
  const locale =
    stored !== null && check.locales.includes(stored)
      ? stored
      : navigator.language.toLowerCase().startsWith('uk')
        ? 'uk'
        : check.defaultLocale;
  const hasSession =
    check.sessionKeys.some((key) => read(key) === '1') ||
    check.legacyTokenKeys.some((key) => read(key) !== null);

  if (locale !== check.prerenderLocale || hasSession) {
    document.documentElement.setAttribute(check.attribute, '');
  }
}

const clientRenderCheck: ClientRenderCheck = {
  attribute: CLIENT_RENDER_ATTRIBUTE,
  prerenderLocale: PRERENDER_LOCALE,
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localeKey: LOCALE_STORAGE_KEY,
  sessionKeys: [SESSION_HINT_STORAGE_KEY],
  legacyTokenKeys: LEGACY_TOKEN_STORAGE_KEYS,
};

const bootTags = [
  `<style>html[${CLIENT_RENDER_ATTRIBUTE}] #root{display:none}</style>`,
  `<script>(${markClientRender.toString()})(${JSON.stringify(clientRenderCheck)})</script>`,
].join('\n    ');

async function listHtmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
    .filter((fileName) => fileName !== SPA_FALLBACK_FILE);
}

export function prerenderPlugin(clientOutDir: string): Plugin {
  let serverOutDir = '';
  let root = '';

  return {
    name: 'viratec-prerender',
    apply: 'build',
    configResolved(config) {
      serverOutDir = resolve(config.root, config.build.outDir);
      root = config.root;
    },
    async closeBundle() {
      const { render } = (await import(pathToFileURL(join(serverOutDir, SERVER_ENTRY)).href)) as {
        render: (pathname: string) => Promise<string>;
      };

      const allowedScripts = await readAllowedScripts(root);
      const blockedScripts = new Set<string>();

      for (const fileName of await listHtmlFiles(clientOutDir)) {
        const filePath = join(clientOutDir, fileName);
        const html = await readFile(filePath, 'utf8');
        if (!html.includes(EMPTY_ROOT)) {
          throw new Error(`${fileName} has no empty root to prerender into`);
        }

        const pathname = toRoutePath(fileName);
        const markup = await render(pathname);
        const page = html
          .replace('</head>', `  ${bootTags}\n  </head>`)
          .replace(
            EMPTY_ROOT,
            `<div id="root" ${PRERENDERED_PATH_ATTRIBUTE}="${pathname}">${markup}</div>`,
          );
        for (const [, source = ''] of page.matchAll(INLINE_SCRIPT)) {
          const hash = scriptHash(source);
          if (!allowedScripts.has(hash)) blockedScripts.add(hash);
        }
        await writeFile(filePath, page);
      }

      if (blockedScripts.size > 0) {
        throw new Error(
          `Prerendered pages have inline scripts that the Content-Security-Policy in vercel.json blocks. Add to script-src: ${[...blockedScripts].join(' ')}`,
        );
      }
    },
  };
}

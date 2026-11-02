import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin } from 'vite';
import {
  CLIENT_RENDER_ATTRIBUTE,
  PRERENDERED_PATH_ATTRIBUTE,
  PRERENDER_LOCALE,
  QUERY_STATE_ELEMENT_ID,
} from '../src/shared/config/prerender';
import {
  LEGACY_TOKEN_STORAGE_KEYS,
  LOCALE_STORAGE_KEY,
  SESSION_HINT_STORAGE_KEY,
} from '../src/shared/config/storageKeys';
import { DEFAULT_LOCALE, LOCALES } from '../src/shared/i18n/model/types';
import { ENGLISH_PREFIX } from '../src/shared/config/routes';
import { loadRecords, type PrerenderRecords } from './prerender-records';
import { toRoutePath } from './route-preload-plugin';

const SERVER_ENTRY = 'entry-server.js';
const SPA_FALLBACK_FILE = 'spa.html';
const EMPTY_ROOT = '<div id="root"></div>';
const CSP_HEADER = 'Content-Security-Policy';
const INLINE_SCRIPT =
  /<script(?![^>]*\bsrc=)(?![^>]*type="application\/(?:ld\+)?json")[^>]*>([\s\S]*?)<\/script>/g;

interface VercelConfig {
  headers?: { headers: { key: string; value: string }[] }[];
}

const CSP_SOURCES = [
  {
    file: '../../vercel.json',
    read: (text: string) =>
      (JSON.parse(text) as VercelConfig).headers
        ?.flatMap((rule) => rule.headers)
        .find((header) => header.key === CSP_HEADER)?.value,
  },
  {
    file: 'docker/security-headers.inc.template',
    read: (text: string) => /add_header Content-Security-Policy "([^"]*)"/.exec(text)?.[1],
  },
];

const scriptHash = (source: string) =>
  `'sha256-${createHash('sha256').update(source).digest('base64')}'`;

const allowedScripts = (policy: string) =>
  new Set(
    policy
      .split(';')
      .map((directive) => directive.trim())
      .find((directive) => directive.startsWith('script-src '))
      ?.split(/\s+/)
      .slice(1) ?? [],
  );

async function readScriptPolicies(root: string) {
  const policies: { file: string; allowed: Set<string> }[] = [];
  for (const source of CSP_SOURCES) {
    const text = await readFile(resolve(root, source.file), 'utf8').catch(() => null);
    const policy = text === null ? undefined : source.read(text);
    if (policy) policies.push({ file: source.file, allowed: allowedScripts(policy) });
  }
  return policies;
}

interface ClientRenderCheck {
  attribute: string;
  prerenderLocale: string;
  englishLocale: string;
  englishPrefix: string;
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
  const path = location.pathname;
  const isEnglishPage = path === check.englishPrefix || path.startsWith(`${check.englishPrefix}/`);
  const pageLocale = isEnglishPage ? check.englishLocale : check.prerenderLocale;
  const stored = read(check.localeKey);
  const locale = isEnglishPage
    ? check.englishLocale
    : stored !== null && check.locales.includes(stored)
      ? stored
      : navigator.language.toLowerCase().startsWith('uk')
        ? 'uk'
        : check.defaultLocale;
  const hasSession =
    check.sessionKeys.some((key) => read(key) === '1') ||
    check.legacyTokenKeys.some((key) => read(key) !== null);

  if (locale !== pageLocale || hasSession) {
    document.documentElement.setAttribute(check.attribute, '');
  }
}

const clientRenderCheck: ClientRenderCheck = {
  attribute: CLIENT_RENDER_ATTRIBUTE,
  prerenderLocale: PRERENDER_LOCALE,
  englishLocale: 'en',
  englishPrefix: ENGLISH_PREFIX,
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
        render: (
          pathname: string,
          data: PrerenderRecords,
        ) => Promise<{ markup: string; queryState: unknown }>;
      };

      const records = await loadRecords(root);
      const inlineScripts = new Set<string>();

      for (const fileName of await listHtmlFiles(clientOutDir)) {
        const filePath = join(clientOutDir, fileName);
        const html = await readFile(filePath, 'utf8');
        if (!html.includes(EMPTY_ROOT)) {
          throw new Error(`${fileName} has no empty root to prerender into`);
        }

        const pathname = toRoutePath(fileName);
        const { markup, queryState } = await render(pathname, records);
        const stateTag = queryState
          ? `\n    <script type="application/json" id="${QUERY_STATE_ELEMENT_ID}">${JSON.stringify(queryState).replace(/</g, '\\u003c')}</script>`
          : '';
        const page = html
          .replace('</head>', `  ${bootTags}\n  </head>`)
          .replace(
            EMPTY_ROOT,
            `<div id="root" ${PRERENDERED_PATH_ATTRIBUTE}="${pathname}">${markup}</div>${stateTag}`,
          );
        for (const [, source = ''] of page.matchAll(INLINE_SCRIPT)) {
          inlineScripts.add(scriptHash(source));
        }
        await writeFile(filePath, page);
      }

      for (const { file, allowed } of await readScriptPolicies(root)) {
        const blocked = [...inlineScripts].filter((hash) => !allowed.has(hash));
        if (blocked.length > 0) {
          throw new Error(
            `Prerendered pages have inline scripts that the Content-Security-Policy in ${file} blocks. Add to script-src: ${blocked.join(' ')}`,
          );
        }
      }
    },
  };
}

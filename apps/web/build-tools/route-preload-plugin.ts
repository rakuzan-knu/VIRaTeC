import type { Plugin, Rollup } from 'vite';
import { ROUTES } from '../src/shared/config/routes';

const ROUTE_PAGES: Partial<Record<string, string>> = {
  [ROUTES.HOME]: 'home',
  [ROUTES.ABOUT_INITIATIVE]: 'about-initiative',
  [ROUTES.VIRATEC]: 'viratec',
  [ROUTES.GLOBAL_COLLABORATION]: 'global-collaboration',
  [ROUTES.RESEARCH_AREAS]: 'research-areas',
  [ROUTES.PROJECTS]: 'projects',
  [ROUTES.EXPERIENTIAL_LEARNING]: 'experiential-learning',
  [ROUTES.STUDENT_RESEARCH]: 'student-research',
  [ROUTES.PUBLICATIONS]: 'publications',
  [ROUTES.OPPORTUNITIES]: 'opportunities',
  [ROUTES.CONTACT]: 'contact',
  [ROUTES.PEOPLE]: 'people',
  [ROUTES.TERMS]: 'legal',
  [ROUTES.PRIVACY]: 'legal',
  [ROUTES.COOKIES]: 'legal',
  [ROUTES.GUIDELINES]: 'legal',
};

const PUBLICATION_DETAIL_PAGE = 'publication-detail';
const PAGE_ENTRY = /\/src\/pages\/([^/]+)\/index\.ts$/;

export const toRoutePath = (htmlFileName: string) =>
  htmlFileName === 'index.html' ? ROUTES.HOME : `/${htmlFileName.replace(/\.html$/, '')}`;

const pageForRoute = (path: string) =>
  ROUTE_PAGES[path] ??
  (path.startsWith(`${ROUTES.PUBLICATIONS}/`) ? PUBLICATION_DETAIL_PAGE : undefined);

const isChunk = (output: Rollup.OutputAsset | Rollup.OutputChunk): output is Rollup.OutputChunk =>
  output.type === 'chunk';

function collectStaticImports(bundle: Rollup.OutputBundle, fileName: string, seen: Set<string>) {
  if (seen.has(fileName)) return seen;
  seen.add(fileName);
  const chunk = bundle[fileName];
  if (chunk && isChunk(chunk)) {
    for (const imported of chunk.imports) collectStaticImports(bundle, imported, seen);
  }
  return seen;
}

export function routePreloadPlugin(): Plugin {
  return {
    name: 'viratec-route-preload',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const chunks = Object.values(bundle).filter(isChunk);
      const entry = chunks.find((chunk) => chunk.isEntry);
      if (!entry) return;

      const preloadedByEntry = collectStaticImports(bundle, entry.fileName, new Set());
      const pageChunks = new Map<string, string>();
      for (const chunk of chunks.filter((candidate) => candidate.isDynamicEntry)) {
        for (const moduleId of chunk.moduleIds) {
          const page = moduleId.match(PAGE_ENTRY)?.[1];
          if (page && !pageChunks.has(page)) pageChunks.set(page, chunk.fileName);
        }
      }

      for (const output of Object.values(bundle)) {
        if (output.type !== 'asset' || !output.fileName.endsWith('.html')) continue;
        if (typeof output.source !== 'string') continue;

        const page = pageForRoute(toRoutePath(output.fileName));
        const pageChunk = page && pageChunks.get(page);
        if (!pageChunk) continue;

        const links = [...collectStaticImports(bundle, pageChunk, new Set())]
          .filter((fileName) => !preloadedByEntry.has(fileName))
          .map((fileName) => `<link rel="modulepreload" crossorigin href="/${fileName}">`);

        output.source = output.source.replace('</head>', `  ${links.join('\n    ')}\n  </head>`);
      }
    },
  };
}

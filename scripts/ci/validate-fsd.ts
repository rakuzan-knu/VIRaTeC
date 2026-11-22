import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const webSrc = path.join(rootDir, 'apps/web/src');

const LAYER_ORDER = ['shared', 'entities', 'features', 'widgets', 'pages', 'app'] as const;
type Layer = (typeof LAYER_ORDER)[number];

const LAYER_INDEX: Record<Layer, number> = {
  shared: 0,
  entities: 1,
  features: 2,
  widgets: 3,
  pages: 4,
  app: 5,
};

const SLICED_LAYERS = new Set<Layer>(['entities', 'features', 'widgets', 'pages']);
const ABOVE_APP = LAYER_INDEX.app + 1;
const IGNORED_DIRS = new Set(['node_modules', 'dist', 'dist-ssr', '.turbo']);
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);

function isLayer(value: string): value is Layer {
  return value in LAYER_INDEX;
}

function scanDir(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath, files);
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

interface Origin {
  layer: Layer | null;
  slice: string | null;
  index: number;
}

function originOf(file: string): Origin {
  const parts = path.relative(webSrc, file).split(path.sep);
  const layer = parts[0];
  if (!isLayer(layer)) return { layer: null, slice: null, index: ABOVE_APP };
  const slice = SLICED_LAYERS.has(layer) ? (parts[1] ?? null) : null;
  return { layer, slice, index: LAYER_INDEX[layer] };
}

const IMPORT_SPECIFIER = /['"](@\/[^'"]+)['"]/g;

interface Violation {
  file: string;
  specifier: string;
  rule: string;
}

const violations: Violation[] = [];

function check(file: string, origin: Origin, specifier: string) {
  const match = specifier.match(/^@\/([^/]+)(?:\/([^/]+))?(?:\/(.+))?$/);
  if (!match) return;
  const targetLayer = match[1];
  if (!isLayer(targetLayer)) return;

  const targetSlice = match[2] ?? null;
  const hasDeepPath = Boolean(match[3]);
  const targetIndex = LAYER_INDEX[targetLayer];
  const sameSlice =
    origin.layer === targetLayer && origin.slice !== null && origin.slice === targetSlice;

  if (targetLayer !== 'shared') {
    if (targetIndex > origin.index) {
      violations.push({
        file,
        specifier,
        rule: `${origin.layer ?? 'root'} must not import from the higher layer ${targetLayer}`,
      });
    } else if (targetIndex === origin.index && SLICED_LAYERS.has(targetLayer) && !sameSlice) {
      violations.push({
        file,
        specifier,
        rule: `sibling slice import inside ${targetLayer} (use a lower layer, not a neighbour)`,
      });
    }
  }

  if (SLICED_LAYERS.has(targetLayer) && hasDeepPath && !sameSlice) {
    violations.push({
      file,
      specifier,
      rule: `deep import bypasses the public API of ${targetLayer}/${targetSlice} (import the slice root)`,
    });
  }
}

const files = scanDir(webSrc);

for (const file of files) {
  const origin = originOf(file);
  const content = fs.readFileSync(file, 'utf8');
  for (const match of content.matchAll(IMPORT_SPECIFIER)) {
    check(file, origin, match[1]);
  }
}

if (violations.length > 0) {
  console.error('❌ FSD layer boundary violations:\n');
  for (const violation of violations) {
    console.error(`  ${path.relative(rootDir, violation.file)}`);
    console.error(`    imports ${violation.specifier}`);
    console.error(`    → ${violation.rule}\n`);
  }
  console.error(`Total: ${violations.length} violation(s).`);
  process.exit(1);
} else {
  console.log(`✅ FSD boundaries passed: ${files.length} files scanned, no layer violations.`);
}

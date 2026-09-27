import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.yml',
  '.yaml',
  '.md',
  '.txt',
  '.css',
  '.html',
  '.svg',
  '.env.example',
  '.sh',
  '.bash',
  '.dockerignore',
  '.gitignore',
  '.editorconfig',
  '.prettierignore',
  '.npmrc',
  '.nvmrc',
  '.prisma',
]);

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.next',
]);

const isFixMode = process.argv.includes('--fix');

function scanDir(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath, files);
    } else {
      const ext = path.extname(entry.name);
      if (TEXT_EXTENSIONS.has(ext) || entry.name.startsWith('Dockerfile')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

const allFiles = scanDir(rootDir);
let invalidFiles = 0;

for (const file of allFiles) {
  const content = fs.readFileSync(file);
  const hasCrlf = content.includes(Buffer.from('\r\n'));

  if (hasCrlf) {
    if (isFixMode) {
      const fixed = content.toString('utf8').replace(/\r\n/g, '\n');
      fs.writeFileSync(file, fixed, 'utf8');
      console.log(`[FIXED] Converted CRLF -> LF: ${path.relative(rootDir, file)}`);
    } else {
      console.error(`[ERROR] CRLF line ending detected in: ${path.relative(rootDir, file)}`);
      invalidFiles++;
    }
  }
}

if (invalidFiles > 0) {
  console.error(
    `\n❌ Total files with CRLF endings: ${invalidFiles}. Run 'node scripts/ci/validate-eol.js --fix' to convert to LF.`,
  );
  process.exit(1);
} else {
  console.log(
    `\n✅ Line endings validation passed: all ${allFiles.length} scanned text files use LF.`,
  );
}

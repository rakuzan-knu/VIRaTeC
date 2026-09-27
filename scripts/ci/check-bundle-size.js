import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const distPath = path.join(rootDir, 'apps/web/dist');

const MAX_TOTAL_BUNDLE_KB = 3500; // 3.5MB budget
const MAX_SINGLE_FILE_KB = 1200; // 1.2MB for single chunk

if (!fs.existsSync(distPath)) {
  console.log('ℹ️ Frontend dist directory does not exist yet. Skipping bundle size check.');
  process.exit(0);
}

function getFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getFiles(distPath);
let totalBytes = 0;
let hasError = false;

for (const file of files) {
  const stat = fs.statSync(file);
  totalBytes += stat.size;
  const kb = stat.size / 1024;
  if (kb > MAX_SINGLE_FILE_KB) {
    console.error(
      `❌ Large chunk detected: ${path.relative(distPath, file)} is ${kb.toFixed(2)} KB (budget: ${MAX_SINGLE_FILE_KB} KB)`,
    );
    hasError = true;
  }
}

const totalKb = totalBytes / 1024;
console.log(
  `📦 Total frontend bundle size: ${totalKb.toFixed(2)} KB (budget: ${MAX_TOTAL_BUNDLE_KB} KB)`,
);

if (totalKb > MAX_TOTAL_BUNDLE_KB) {
  console.error(`❌ Total bundle size exceeded limit!`);
  hasError = true;
}

if (hasError) {
  process.exit(1);
} else {
  console.log(`✅ Bundle size check passed.`);
}

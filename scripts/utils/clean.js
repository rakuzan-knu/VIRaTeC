import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const isPrune = process.argv.includes('--prune');
const targets = ['dist', 'build', '.turbo', '.next', 'coverage', '.eslintcache'];
if (isPrune) {
  targets.push('node_modules');
}

function removeRecursive(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`[CLEANED] ${path.relative(rootDir, dir) || dir}`);
  }
}

function cleanFolder(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (targets.includes(entry.name)) {
        removeRecursive(fullPath);
      } else {
        cleanFolder(fullPath);
      }
    }
  }
}

console.log(`🧹 Cleaning build artifacts${isPrune ? ' and node_modules' : ''}...`);
cleanFolder(rootDir);
console.log('✨ Cleanup complete.');

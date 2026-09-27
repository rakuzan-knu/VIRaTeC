import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const exampleEnvPath = path.join(rootDir, '.env.example');

if (!fs.existsSync(exampleEnvPath)) {
  console.error('❌ .env.example file not found!');
  process.exit(1);
}

const content = fs.readFileSync(exampleEnvPath, 'utf8');
const lines = content.split('\n');
const keys = new Set();
let errorCount = 0;

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match) {
    console.warn(`⚠️ Warning: Unrecognized format in line: ${trimmed}`);
    continue;
  }
  const [, key] = match;
  if (keys.has(key)) {
    console.error(`❌ Duplicate key found in .env.example: ${key}`);
    errorCount++;
  }
  keys.add(key);
}

console.log(
  `✅ .env.example validation passed. ${keys.size} variables configured without duplicates.`,
);
if (errorCount > 0) {
  process.exit(1);
}

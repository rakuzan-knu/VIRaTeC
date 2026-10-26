import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const WEB_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const hasFlag = (flag: string) => process.argv.slice(2).includes(flag);

export const readOption = (name: string) =>
  process.argv
    .slice(2)
    .find((arg) => arg.startsWith(`${name}=`))
    ?.slice(name.length + 1);

export const printList = (title: string, lines: readonly string[]) => {
  if (lines.length === 0) return;
  console.log(`\n${title} (${lines.length}):`);
  lines.forEach((line) => console.log(`  - ${line}`));
};

export const runScript = (main: () => Promise<void>) => {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
};

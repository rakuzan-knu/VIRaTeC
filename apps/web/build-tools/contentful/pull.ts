import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fetchEntries } from './delivery.ts';
import { readDeliveryConfig } from './env.ts';
import { createDiagnostics } from './entry-reader.ts';
import { syncAssets } from './assets.ts';
import { createAssetRegistry } from './tokens.ts';
import { renderModule } from './render.ts';
import { CONTENT_TYPES, DOMAINS } from './domains/index.ts';
import { WEB_ROOT, hasFlag, printList, runScript } from './cli.ts';
import { pullHomePublications } from './records.ts';
import { resolveSiteUrl } from '../site-url.ts';

const unique = (lines: string[]) => [...new Set(lines)];

const pull = async () => {
  const config = readDeliveryConfig();
  console.log(`Pulling ${config.environment}`);
  const collection = await fetchEntries(
    config,
    CONTENT_TYPES.map((type) => type.id),
  );

  const { issues, warnings, diagnostics } = createDiagnostics();
  const assets = createAssetRegistry();
  const modules = DOMAINS.flatMap((domain) =>
    domain.pull({ collection, locales: config.locales, diagnostics, assets }),
  );

  printList('Warnings', unique(warnings));
  printList('Issues', unique(issues));
  if (issues.length > 0) {
    throw new Error('Pull aborted: fix the entries above in Contentful. No files were written.');
  }

  const apiOrigin = resolveSiteUrl(process.env.VITE_SITE_URL);
  try {
    modules.push(await pullHomePublications(collection, config.locales.en, apiOrigin));
  } catch (error) {
    console.warn(
      `Home page publications were not refreshed from ${apiOrigin}, keeping the committed snapshot: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const synced = await syncAssets(assets.ids, collection.assets, config.locales);
  const rendered = await Promise.all(
    modules.map(async (module) => ({ module, source: await renderModule(module, synced.files) })),
  );
  for (const { module, source } of rendered) {
    await writeFile(path.join(WEB_ROOT, module.file), source);
    console.log(`Wrote ${module.file}`);
  }
  await synced.finalize();
};

runScript(async () => {
  try {
    await pull();
  } catch (error) {
    if (!hasFlag('--fallback')) throw error;
    console.warn(
      `Contentful pull failed, building with the committed snapshot: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
});

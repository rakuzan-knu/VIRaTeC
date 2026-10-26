import { DEFAULT_LOCALE } from '../../src/shared/i18n/model/types.ts';
import { CONTENT_TYPES } from './domains/index.ts';
import { readManagementConfig, type ContentfulConfig } from './env.ts';
import { createManagementClient, type ManagementClient } from './management.ts';
import { runScript } from './cli.ts';

const checkLocales = async (client: ManagementClient, config: ContentfulConfig) => {
  const locales = await client.listLocales();
  const defaultCode = config.locales[DEFAULT_LOCALE];
  const defaultLocale = locales.find((locale) => locale.default);
  const uk = locales.find((locale) => locale.code === config.locales.uk);
  const problems = [
    defaultLocale?.code !== defaultCode &&
      `the default locale must be "${defaultCode}", found "${defaultLocale?.code ?? 'none'}"`,
    !uk && `locale "${config.locales.uk}" does not exist`,
    uk &&
      uk.fallbackCode !== defaultCode &&
      `locale "${config.locales.uk}" must fall back to "${defaultCode}"`,
  ].filter((problem): problem is string => typeof problem === 'string');

  if (problems.length > 0) {
    throw new Error(
      `Contentful locales are not set up: ${problems.join('; ')}. Fix them in Settings → Locales or set CONTENTFUL_LOCALE_EN / CONTENTFUL_LOCALE_UK.`,
    );
  }
};

runScript(async () => {
  const config = readManagementConfig();
  const client = createManagementClient(config);

  await checkLocales(client, config);
  console.log(`Locales OK in ${config.environment}`);

  for (const definition of CONTENT_TYPES) {
    const result = await client.upsertContentType(definition);
    console.log(`Content type ${definition.id}: ${result} and published`);
  }
});

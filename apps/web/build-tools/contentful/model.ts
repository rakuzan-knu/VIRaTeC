import { DEFAULT_LOCALE, LANGUAGE_NAMES, LOCALES } from '../../src/shared/i18n/model/types.ts';
import { CONTENT_TYPES } from './domains/index.ts';
import { readManagementConfig, type ContentfulConfig } from './env.ts';
import { createManagementClient, type ManagementClient } from './management.ts';
import { runScript } from './cli.ts';

const checkLocales = async (client: ManagementClient, config: ContentfulConfig) => {
  const locales = await client.listLocales();
  const defaultCode = config.locales[DEFAULT_LOCALE];
  const defaultLocale = locales.find((locale) => locale.default);
  const translated = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
  for (const locale of translated) {
    const code = config.locales[locale];
    if (locales.some((item) => item.code === code)) continue;
    await client.createLocale(code, LANGUAGE_NAMES[locale], defaultCode);
    console.log(`Locale ${code} created with fallback to ${defaultCode}`);
  }
  const current = await client.listLocales();
  const problems = [
    defaultLocale?.code !== defaultCode &&
      `the default locale must be "${defaultCode}", found "${defaultLocale?.code ?? 'none'}"`,
    ...translated.map((locale) => {
      const code = config.locales[locale];
      const found = current.find((item) => item.code === code);
      if (!found) return `locale "${code}" does not exist`;
      return found.fallbackCode === defaultCode
        ? false
        : `locale "${code}" must fall back to "${defaultCode}"`;
    }),
  ].filter((problem): problem is string => typeof problem === 'string');

  if (problems.length > 0) {
    throw new Error(
      `Contentful locales are not set up: ${problems.join('; ')}. Fix them in Settings → Locales or set the CONTENTFUL_LOCALE_* variables.`,
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

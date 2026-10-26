import type { Locale } from '../../src/shared/i18n/model/types.ts';
import { readOption } from './cli.ts';

export interface ContentfulConfig {
  spaceId: string;
  environment: string;
  token: string;
  locales: Record<Locale, string>;
}

type TokenVariable = 'CONTENTFUL_DELIVERY_TOKEN' | 'CONTENTFUL_MANAGEMENT_TOKEN';

const readOptional = (name: string, fallback: string) => process.env[name]?.trim() || fallback;

const readLocales = (): Record<Locale, string> => ({
  en: readOptional('CONTENTFUL_LOCALE_EN', 'en'),
  uk: readOptional('CONTENTFUL_LOCALE_UK', 'uk'),
});

const readContentfulConfig = (tokenVariable: TokenVariable): ContentfulConfig => {
  const required = ['CONTENTFUL_SPACE_ID', tokenVariable];
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables: ${missing.join(', ')}. Add them to apps/web/.env.local (see apps/web/.env.example).`,
    );
  }

  return {
    spaceId: readOptional('CONTENTFUL_SPACE_ID', ''),
    environment: readOption('--env') || readOptional('CONTENTFUL_ENVIRONMENT', 'master'),
    token: readOptional(tokenVariable, ''),
    locales: readLocales(),
  };
};

export const readDeliveryConfig = () => readContentfulConfig('CONTENTFUL_DELIVERY_TOKEN');

export const readManagementConfig = () => readContentfulConfig('CONTENTFUL_MANAGEMENT_TOKEN');

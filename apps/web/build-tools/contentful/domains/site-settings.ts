import { z } from 'zod';
import type { Locale } from '../../../src/shared/i18n/model/types.ts';
import type { SiteSettings, SocialLinkKey } from '../../../src/shared/config/site.ts';
import {
  EMAIL_VALIDATION,
  URL_VALIDATION,
  field,
  localizedField,
  type ContentTypeDefinition,
} from '../content-types.ts';
import { createReader, nonEmpty } from '../entry-reader.ts';
import type { ContentDomain } from '../domain.ts';

const TYPE_ID = 'siteSettings';

const SOCIAL_FIELDS: Record<SocialLinkKey, { id: string; name: string }> = {
  linkedinGroup: { id: 'linkedinGroupUrl', name: 'LinkedIn group URL' },
  linkedinChair: { id: 'linkedinChairUrl', name: 'LinkedIn URL of the project chair' },
  orcid: { id: 'orcidUrl', name: 'ORCID URL' },
  facebookGroup: { id: 'facebookGroupUrl', name: 'Facebook group URL' },
  scopus: { id: 'scopusUrl', name: 'Scopus URL' },
  googleScholar: { id: 'googleScholarUrl', name: 'Google Scholar URL' },
};

const SOCIAL_KEYS = [
  'linkedinGroup',
  'linkedinChair',
  'orcid',
  'facebookGroup',
  'scopus',
  'googleScholar',
] as const satisfies readonly SocialLinkKey[];

const SITE_SETTINGS_TYPE: ContentTypeDefinition = {
  id: TYPE_ID,
  name: 'Site settings',
  description:
    'Contacts, social links and footer text shared by the whole site. Keep exactly one entry.',
  displayField: 'internalName',
  fields: [
    field('internalName', 'Internal name', 'Symbol', {
      required: true,
      help: 'Only shown in Contentful.',
    }),
    field('contactEmail', 'Contact email', 'Symbol', {
      required: true,
      validations: [EMAIL_VALIDATION],
      help: 'Shown in the footer, on the Contact page, in legal documents and in password recovery.',
    }),
    ...SOCIAL_KEYS.map((key) =>
      field(SOCIAL_FIELDS[key].id, SOCIAL_FIELDS[key].name, 'Symbol', {
        validations: [URL_VALIDATION],
        help: 'Leave empty to hide this link.',
      }),
    ),
    localizedField('footerTagline', 'Footer tagline', 'Text', {
      required: true,
      help: 'Short description under the logo in the footer.',
    }),
    localizedField('footerCopyright', 'Footer copyright', 'Symbol', {
      required: true,
      help: 'For example: © 2026 VIRaTeC KNU. All rights reserved.',
    }),
  ],
};

const footerSchema = z.object({ tagline: nonEmpty, copyright: nonEmpty });

export const siteSettingsDomain: ContentDomain = {
  id: TYPE_ID,
  contentTypes: [SITE_SETTINGS_TYPE],

  pull({ collection, locales, diagnostics }) {
    const entries = collection.byType.get(TYPE_ID) ?? [];
    if (entries.length !== 1) {
      diagnostics.report(
        `site settings: expected exactly 1 published entry, found ${entries.length}`,
      );
      return [];
    }
    const [entry] = entries;
    if (!entry) return [];

    const reader = createReader(entry, locales, diagnostics, 'site settings');
    const contactEmail = reader.require('contactEmail', nonEmpty);
    const readFooter = (locale: Locale) =>
      footerSchema.safeParse({
        tagline: reader.require('footerTagline', nonEmpty, locale),
        copyright: reader.require('footerCopyright', nonEmpty, locale),
      });
    const en = readFooter('en');
    const uk = readFooter('uk');
    if (!contactEmail || !en.success || !uk.success) return [];

    const social = (key: SocialLinkKey) => reader.read(SOCIAL_FIELDS[key].id, nonEmpty) ?? null;
    const settings: SiteSettings = {
      contactEmail,
      socialLinks: {
        linkedinGroup: social('linkedinGroup'),
        linkedinChair: social('linkedinChair'),
        orcid: social('orcid'),
        facebookGroup: social('facebookGroup'),
        scopus: social('scopus'),
        googleScholar: social('googleScholar'),
      },
      footer: { en: en.data, uk: uk.data },
    };

    return [
      {
        file: 'src/shared/config/site.generated.ts',
        typeImports: [{ from: './site', names: ['SiteSettings'] }],
        exports: [{ name: 'SITE_SETTINGS', type: 'SiteSettings', value: settings }],
      },
    ];
  },
};

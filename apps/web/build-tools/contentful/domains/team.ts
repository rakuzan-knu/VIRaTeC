import { z } from 'zod';
import type { Locale } from '../../../src/shared/i18n/model/types.ts';
import type { Founder, TeamMember } from '../../../src/pages/about-initiative/model/types.ts';
import { field, imageField, localizedField, type ContentTypeDefinition } from '../content-types.ts';
import { assetLinkSchema, createReader, nonEmpty, type RawEntry } from '../entry-reader.ts';
import { type ContentDomain, type PullContext } from '../domain.ts';

const TYPE_ID = 'person';
const PARAGRAPH_SEPARATOR = /\n\s*\n/;

const PERSON_TYPE: ContentTypeDefinition = {
  id: TYPE_ID,
  name: 'Person',
  description: 'Team member of the initiative. Shown on the About Initiative page.',
  displayField: 'name',
  fields: [
    localizedField('name', 'Name', 'Symbol', { required: true }),
    localizedField('role', 'Role', 'Text', {
      required: true,
      help: 'Shown on the team card.',
    }),
    imageField('photo', 'Photo', {
      help: 'Portrait, at least 640×800. Without a photo the card shows initials.',
    }),
    field('teamOrder', 'Order in team', 'Integer', {
      validations: [{ range: { min: 1, max: 999 } }],
      help: 'Position in the team grid. Leave empty to hide the person there.',
    }),
    field('isFounder', 'Founder', 'Boolean', {
      help: 'Shows the person in the founder section. Exactly one person must have it.',
    }),
    localizedField('founderName', 'Founder section name', 'Symbol', {
      help: 'Name with academic title for the founder section, e.g. Dr. Larysa Liashenko. Defaults to the name.',
    }),
    localizedField('founderRole', 'Founder section role', 'Text', {
      help: 'Role under the name in the founder section. Required for the founder.',
    }),
    localizedField('bio', 'Biography', 'Text', {
      help: 'Founder section text. Separate paragraphs with an empty line. Required for the founder.',
    }),
  ],
};

const readPerson = (entry: RawEntry, context: PullContext) => {
  const name = entry.fields.name?.[context.locales.en];
  const reader = createReader(
    entry,
    context.locales,
    context.diagnostics,
    `person ${typeof name === 'string' ? name : entry.sys.id}`,
  );
  const photoId = reader.read('photo', assetLinkSchema)?.sys.id;
  return {
    reader,
    photo: () => photoId && context.assets.reference(photoId),
    teamOrder: reader.read('teamOrder', z.number().int()),
    isFounder: reader.read('isFounder', z.boolean()) ?? false,
  };
};

export const teamDomain: ContentDomain = {
  id: TYPE_ID,
  contentTypes: [PERSON_TYPE],

  pull(context) {
    const people = (context.collection.byType.get(TYPE_ID) ?? []).map((entry) =>
      readPerson(entry, context),
    );
    const founders = people.filter((person) => person.isFounder);
    if (founders.length !== 1) {
      context.diagnostics.report(
        `team: exactly one person must be the founder, found ${founders.length}`,
        { kind: 'founderCount', count: founders.length },
      );
      return [];
    }
    const [founder] = founders;
    if (!founder) return [];

    const team = (locale: Locale) =>
      people
        .filter((person) => person.teamOrder !== undefined)
        .sort((a, b) => (a.teamOrder ?? 0) - (b.teamOrder ?? 0))
        .flatMap(({ reader, ...person }): TeamMember[] => {
          const name = reader.require('name', nonEmpty, locale);
          const role = reader.require('role', nonEmpty, locale);
          const photo = person.photo();
          if (!name || !role) return [];
          return [{ name, role, ...(photo && { photo }) }];
        });

    const founderText = (locale: Locale): Founder | undefined => {
      const name =
        founder.reader.read('founderName', nonEmpty, locale) ??
        founder.reader.require('name', nonEmpty, locale);
      const role = founder.reader.require('founderRole', nonEmpty, locale);
      const bio = founder.reader.require('bio', nonEmpty, locale);
      const photo = founder.photo();
      if (!photo) founder.reader.require('photo', assetLinkSchema);
      if (!name || !role || !bio || !photo) return undefined;
      return {
        name,
        role,
        bio: bio.split(PARAGRAPH_SEPARATOR).map((paragraph) => paragraph.trim()),
        photo,
      };
    };

    const founderEn = founderText('en');
    const founderUk = founderText('uk');
    if (!founderEn || !founderUk) return [];

    return [
      {
        file: 'src/pages/about-initiative/model/team.generated.ts',
        typeImports: [
          { from: '@/shared/i18n/model/types', names: ['Localized'] },
          { from: './types', names: ['Founder', 'TeamMember'] },
        ],
        exports: [
          {
            name: 'TEAM',
            type: 'Localized<TeamMember[]>',
            value: { en: team('en'), uk: team('uk') },
          },
          { name: 'FOUNDER', type: 'Localized<Founder>', value: { en: founderEn, uk: founderUk } },
        ],
      },
    ];
  },
};

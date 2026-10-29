import { PublicationType, type PublicationBlockDto } from '@viratec/contracts';
import type { SiteEditorMessages } from './messages';

export type PublicationTemplate = 'blank' | 'announcement' | 'report' | 'paper';

export const PUBLICATION_TEMPLATES: readonly PublicationTemplate[] = [
  'announcement',
  'report',
  'paper',
  'blank',
];

export const TEMPLATE_TYPES: Record<PublicationTemplate, PublicationType> = {
  blank: PublicationType.NEWS,
  announcement: PublicationType.NEWS,
  report: PublicationType.EVENT,
  paper: PublicationType.PAPER,
};

export const templateBlocks = (
  template: PublicationTemplate,
  t: SiteEditorMessages,
): PublicationBlockDto[] => {
  const copy = t.wizard.blocks;
  switch (template) {
    case 'announcement':
      return [
        { kind: 'paragraph', text: copy.announcementIntro },
        { kind: 'heading', text: copy.whenWhere },
        { kind: 'paragraph', text: copy.whenWhereText },
        { kind: 'heading', text: copy.howToJoin },
        { kind: 'paragraph', text: copy.howToJoinText },
      ];
    case 'report':
      return [
        { kind: 'paragraph', text: copy.reportIntro },
        { kind: 'heading', text: copy.howItWent },
        { kind: 'paragraph', text: copy.howItWentText },
        { kind: 'heading', text: copy.results },
        { kind: 'list', ordered: false, items: [copy.resultItem, copy.resultItem] },
      ];
    case 'paper':
      return [
        { kind: 'heading', text: copy.abstract },
        { kind: 'paragraph', text: copy.abstractText },
        { kind: 'heading', text: copy.findings },
        { kind: 'list', ordered: true, items: [copy.findingItem, copy.findingItem] },
        { kind: 'heading', text: copy.sources },
        { kind: 'paragraph', text: copy.sourcesText },
      ];
    default:
      return [];
  }
};

import { useLocalized } from '@/shared/i18n';
import { useLiveContent } from '@/shared/lib';
import { PAGE_TEXT } from './page.generated';

export type SocialKey = 'group' | 'chair' | 'orcid' | 'scopus' | 'facebook' | 'scholar';

export interface CollaborationWay {
  title: string;
  description: string;
  subject: string;
  linkLabel: string;
  to: string;
}

export interface ContactContent {
  documentTitle: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  getInTouchTitle: string;
  emailTitle: string;
  replyTime: string;
  writeToUs: string;
  chairTitle: string;
  chairName: string;
  chairRole: string;
  chairPhoto: string;
  locationTitle: string;
  socialLabels: Record<SocialKey, string>;
  waysTitle: string;
  subjectPrefix: string;
  ways: CollaborationWay[];
}

export const useContactContent = () =>
  useLocalized(useLiveContent('contactPage', 'PAGE_TEXT', PAGE_TEXT));

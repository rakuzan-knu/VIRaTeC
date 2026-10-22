export const ACCOUNT_SECTIONS = [
  'profile',
  'saved',
  'security',
  'privacy',
  'preferences',
  'accounts',
  'danger',
] as const;

export type AccountSection = (typeof ACCOUNT_SECTIONS)[number];

export const isAccountSection = (value: unknown): value is AccountSection =>
  typeof value === 'string' && (ACCOUNT_SECTIONS as readonly string[]).includes(value);

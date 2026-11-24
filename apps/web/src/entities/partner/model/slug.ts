const COMBINING_MARKS = /[̀-ͯ]/g;
const NON_WORD = /[^a-z0-9]+/g;

export const toPartnerSlug = (name: string): string =>
  name.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().replace(NON_WORD, '-');

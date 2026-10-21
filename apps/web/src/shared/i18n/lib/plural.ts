type UkPluralForms = Record<'one' | 'few' | 'many', string>;

const UK_PLURAL_RULES = new Intl.PluralRules('uk-UA');

export const pluralUk = (count: number, forms: UkPluralForms) => {
  const rule = UK_PLURAL_RULES.select(count);
  return rule === 'one' || rule === 'few' ? forms[rule] : forms.many;
};

export const countUk = (count: number, forms: UkPluralForms) =>
  `${count} ${pluralUk(count, forms)}`;

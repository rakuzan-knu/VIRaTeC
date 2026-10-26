export type FieldValidation =
  | { unique: true }
  | { in: readonly (string | number)[] }
  | { regexp: { pattern: string }; message?: string }
  | { size: { min?: number; max?: number } }
  | { range: { min?: number; max?: number } }
  | { linkMimetypeGroup: readonly string[] }
  | { linkContentType: readonly string[] };

type ScalarType = 'Symbol' | 'Text' | 'Integer' | 'Boolean' | 'Date';

export interface FieldDefinition {
  id: string;
  name: string;
  type: ScalarType | 'Link' | 'Array';
  linkType?: 'Asset' | 'Entry';
  items?:
    | { type: 'Symbol'; validations: readonly FieldValidation[] }
    | { type: 'Link'; linkType: 'Entry'; validations: readonly FieldValidation[] };
  localized: boolean;
  required: boolean;
  validations: readonly FieldValidation[];
  help?: string;
}

export interface ContentTypeDefinition {
  id: string;
  name: string;
  description: string;
  displayField: string;
  fields: readonly FieldDefinition[];
}

export const URL_VALIDATION: FieldValidation = {
  regexp: { pattern: '^https?://\\S+$' },
  message: 'Must be a full URL starting with http:// or https://',
};

export const EMAIL_VALIDATION: FieldValidation = {
  regexp: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
  message: 'Must be an email address',
};

type FieldOptions = Partial<Omit<FieldDefinition, 'id' | 'name' | 'type'>>;

export const field = (
  id: string,
  name: string,
  type: FieldDefinition['type'],
  options: FieldOptions = {},
): FieldDefinition => ({
  id,
  name,
  type,
  localized: false,
  required: false,
  validations: [],
  ...options,
});

export const localizedField = (
  id: string,
  name: string,
  type: FieldDefinition['type'],
  options: FieldOptions = {},
) => field(id, name, type, { localized: true, ...options });

export const imageField = (id: string, name: string, options: FieldOptions = {}) =>
  field(id, name, 'Link', {
    linkType: 'Asset',
    validations: [{ linkMimetypeGroup: ['image'] }],
    ...options,
  });

export const entryField = (
  id: string,
  name: string,
  contentTypeIds: readonly string[],
  options: FieldOptions = {},
) =>
  field(id, name, 'Link', {
    linkType: 'Entry',
    validations: [{ linkContentType: contentTypeIds }],
    ...options,
  });

export const entryListField = (
  id: string,
  name: string,
  contentTypeIds: readonly string[],
  options: FieldOptions = {},
) =>
  field(id, name, 'Array', {
    items: { type: 'Link', linkType: 'Entry', validations: [{ linkContentType: contentTypeIds }] },
    ...options,
  });

export const widgetFor = (definition: FieldDefinition) => {
  if (definition.type === 'Link') {
    return definition.linkType === 'Entry' ? 'entryLinkEditor' : 'assetLinkEditor';
  }
  if (definition.type === 'Array') {
    return definition.items?.type === 'Link' ? 'entryLinksEditor' : 'listInput';
  }
  return {
    Symbol: definition.validations.some((validation) => 'in' in validation)
      ? 'dropdown'
      : 'singleLine',
    Text: 'multipleLine',
    Integer: 'numberEditor',
    Boolean: 'boolean',
    Date: 'datePicker',
  }[definition.type];
};

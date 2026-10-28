import type { ContentFields, ContentLocales } from '@viratec/contracts';
import type { Locale } from '@/shared/i18n';
import type { ContentTypeDefinition, FieldDefinition } from '../model/contentModel';
import { arrangeFields } from '../model/fieldText';
import type { SiteEditorMessages } from '../model/messages';
import { FieldEditor } from './FieldEditor';
import { FieldSection } from './FieldSection';

interface EntryFieldListProps {
  type: ContentTypeDefinition;
  fields: ContentFields;
  locales: ContentLocales;
  focusedFieldId: string | undefined;
  focusLocale: Locale;
  canEdit: boolean;
  canUpload: boolean;
  t: SiteEditorMessages;
  onChange: (fieldId: string, localeCode: string, value: unknown) => void;
  onPersist: (fieldId: string, localeCode: string, value: unknown) => void;
}

export function EntryFieldList({
  type,
  fields,
  locales,
  focusedFieldId,
  focusLocale,
  canEdit,
  canUpload,
  t,
  onChange,
  onPersist,
}: EntryFieldListProps) {
  const { groups, advanced, advancedHasFocus } = arrangeFields(
    t.fields,
    type.id,
    type.fields,
    focusedFieldId,
  );
  const hasFocus = groups.some((group) => group.hasFocus);

  const renderField = (field: FieldDefinition) => (
    <FieldEditor
      key={field.id}
      contentTypeId={type.id}
      field={field}
      values={fields[field.id]}
      locales={locales}
      focusLocale={focusLocale}
      isFocused={field.id === focusedFieldId}
      readOnly={!canEdit || (field.type === 'Link' && field.linkType === 'Asset' && !canUpload)}
      t={t}
      onChange={(localeCode, value) => onChange(field.id, localeCode, value)}
      onPersist={(localeCode, value) => onPersist(field.id, localeCode, value)}
    />
  );

  return (
    <>
      {groups.map((group, index) =>
        group.title ? (
          <FieldSection
            key={group.key}
            title={group.title}
            open={group.hasFocus || (!hasFocus && index === 0)}
          >
            {group.fields.map(renderField)}
          </FieldSection>
        ) : (
          group.fields.map(renderField)
        ),
      )}
      {advanced.length > 0 && (
        <FieldSection
          title={t.fields.advanced}
          hint={t.fields.advancedHint}
          open={advancedHasFocus}
        >
          {advanced.map(renderField)}
        </FieldSection>
      )}
    </>
  );
}

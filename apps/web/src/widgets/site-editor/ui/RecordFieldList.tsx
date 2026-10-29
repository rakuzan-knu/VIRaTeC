import {
  RECORD_DEFINITIONS,
  type RecordData,
  type RecordFieldDefinition,
  type RecordResource,
} from '@viratec/contracts';
import type { Locale } from '@/shared/i18n';
import { arrangeRecordFields } from '../model/fieldText';
import type { SiteEditorMessages } from '../model/messages';
import { FieldSection } from './FieldSection';
import { RecordFieldEditor } from './RecordFieldEditor';

interface RecordFieldListProps {
  resource: RecordResource;
  data: RecordData;
  focusedPath?: string;
  focusLocale: Locale;
  readOnly: boolean;
  t: SiteEditorMessages;
  onChange: (path: string, value: unknown) => void;
}

export function RecordFieldList({
  resource,
  data,
  focusedPath,
  focusLocale,
  readOnly,
  t,
  onChange,
}: RecordFieldListProps) {
  const { main, detail, advanced, detailHasFocus, advancedHasFocus } = arrangeRecordFields(
    resource,
    RECORD_DEFINITIONS[resource].fields,
    focusedPath,
  );

  const renderField = (field: RecordFieldDefinition) => (
    <RecordFieldEditor
      key={field.path}
      resource={resource}
      field={field}
      data={data}
      focusLocale={focusLocale}
      isFocused={field.path === focusedPath}
      readOnly={readOnly}
      t={t}
      onChange={onChange}
    />
  );

  return (
    <>
      {main.map(renderField)}
      {detail.length > 0 && (
        <FieldSection title={t.fields.publicationPage} open={detailHasFocus}>
          {detail.map(renderField)}
        </FieldSection>
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

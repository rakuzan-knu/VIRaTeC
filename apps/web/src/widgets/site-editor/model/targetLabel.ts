import { recordResourceOf } from '@viratec/contracts';
import { findContentType, findField } from './contentModel';
import { fieldText, recordFieldText, typeName } from './fieldText';
import type { SiteEditorMessages } from './messages';
import { findRecordField } from './recordModel';
import type { CanvasTarget } from './useCanvasTargets';

export const targetLabel = (target: CanvasTarget, t: SiteEditorMessages) => {
  if (target.kind === 'section') return t.structure.section;
  const { contentTypeId } = target.address;
  const resource = recordResourceOf(contentTypeId);
  const owner = resource
    ? t.records.resource[resource]
    : typeName(t.fields, contentTypeId, findContentType(contentTypeId)?.name);
  if (target.kind === 'entry') return owner;
  if (resource) {
    const field = findRecordField(resource, target.address.fieldId);
    return [owner, field && recordFieldText(t.fields, resource, field).label]
      .filter(Boolean)
      .join(' · ');
  }
  const field = findField(contentTypeId, target.address.fieldId);
  return [owner, field && fieldText(t.fields, contentTypeId, field).label]
    .filter(Boolean)
    .join(' · ');
};

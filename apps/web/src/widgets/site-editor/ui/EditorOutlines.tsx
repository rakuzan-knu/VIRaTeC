import { cn } from '@/shared/lib';
import { RECORD_DEFINITIONS, recordResourceOf } from '@viratec/contracts';
import { findContentType, findField } from '../model/contentModel';
import { findRecordField } from '../model/recordModel';
import { useElementRect, type CanvasTarget } from '../model/useCanvasTargets';

const targetLabel = (target: CanvasTarget, sectionLabel: string) => {
  if (target.kind === 'section') return sectionLabel;
  const resource = recordResourceOf(target.address.contentTypeId);
  if (resource) {
    const field = findRecordField(resource, target.address.fieldId);
    return [RECORD_DEFINITIONS[resource].name, field?.name].filter(Boolean).join(' · ');
  }
  const type = findContentType(target.address.contentTypeId);
  const field = findField(target.address.contentTypeId, target.address.fieldId);
  return [type?.name, field?.name].filter(Boolean).join(' · ');
};

function Outline({
  target,
  isSelected,
  sectionLabel,
}: {
  target: CanvasTarget;
  isSelected: boolean;
  sectionLabel: string;
}) {
  const rect = useElementRect(target.element);
  if (!rect || rect.width === 0 || rect.height === 0) return null;

  const labelOnTop = rect.top > 28;
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed z-[2147483001] rounded-md',
        isSelected
          ? 'outline-2 outline-viratec-cyan'
          : 'outline-2 outline-dashed outline-viratec-cyan/80 bg-viratec-cyan/6',
      )}
      style={{
        top: rect.top - 3,
        left: rect.left - 3,
        width: rect.width + 6,
        height: rect.height + 6,
      }}
    >
      <span
        className={cn(
          'absolute left-0 max-w-[min(320px,80vw)] truncate rounded-md bg-viratec-cyan px-2 py-0.5 text-[12px] leading-5 font-medium text-viratec-ink',
          labelOnTop ? '-top-6' : '-bottom-6',
        )}
      >
        {targetLabel(target, sectionLabel)}
      </span>
    </div>
  );
}

export function EditorOutlines({
  hovered,
  selected,
  sectionLabel,
}: {
  hovered: CanvasTarget | null;
  selected: CanvasTarget | null;
  sectionLabel: string;
}) {
  const showHover = hovered && hovered.element !== selected?.element;
  return (
    <>
      {selected && <Outline target={selected} isSelected sectionLabel={sectionLabel} />}
      {showHover && <Outline target={hovered} isSelected={false} sectionLabel={sectionLabel} />}
    </>
  );
}

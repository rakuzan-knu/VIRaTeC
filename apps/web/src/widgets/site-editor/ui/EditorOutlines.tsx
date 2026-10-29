import type { SiteEditorMessages } from '../model/messages';
import { targetLabel } from '../model/targetLabel';
import { useElementRects, type CanvasTarget } from '../model/useCanvasTargets';

const PAD = 3;
const ROW_TOLERANCE = 2;

interface Row {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const toRows = (rects: readonly DOMRect[]) =>
  [...rects]
    .sort((a, b) => a.top - b.top || a.left - b.left)
    .reduce<Row[]>((rows, rect) => {
      const last = rows[rows.length - 1];
      if (last && Math.abs(rect.top - last.top) <= ROW_TOLERANCE) {
        last.left = Math.min(last.left, rect.left);
        last.right = Math.max(last.right, rect.right);
        last.bottom = Math.max(last.bottom, rect.bottom);
      } else {
        rows.push({ top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right });
      }
      return rows;
    }, []);

const outlinePath = (rows: readonly Row[]) => {
  const edges = rows.map((row, index) => {
    const previous = rows[index - 1];
    const next = rows[index + 1];
    return {
      top: previous ? (previous.bottom + row.top) / 2 : row.top - PAD,
      bottom: next ? (row.bottom + next.top) / 2 : row.bottom + PAD,
      left: row.left - PAD,
      right: row.right + PAD,
    };
  });
  const points = [
    ...edges.flatMap((edge) => [`${edge.right},${edge.top}`, `${edge.right},${edge.bottom}`]),
    ...[...edges]
      .reverse()
      .flatMap((edge) => [`${edge.left},${edge.bottom}`, `${edge.left},${edge.top}`]),
  ];
  return `M${points.join('L')}Z`;
};

function Outline({
  target,
  isSelected,
  t,
}: {
  target: CanvasTarget;
  isSelected: boolean;
  t: SiteEditorMessages;
}) {
  const rows = toRows(
    useElementRects(target.element, target.kind === 'field' ? target.range : undefined),
  );
  const [first] = rows;
  if (!first) return null;

  const labelOnTop = first.top > 28;
  const last = rows[rows.length - 1] ?? first;
  return (
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[2147483001] size-full overflow-visible"
      >
        <path
          d={outlinePath(rows)}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeDasharray={isSelected ? undefined : '6 4'}
          className={
            isSelected
              ? 'fill-none stroke-viratec-cyan'
              : 'fill-viratec-cyan/6 stroke-viratec-cyan/80'
          }
        />
      </svg>
      <span
        aria-hidden="true"
        className="pointer-events-none fixed z-[2147483001] max-w-[min(320px,80vw)] truncate rounded-md bg-viratec-cyan px-2 py-0.5 text-[12px] leading-5 font-medium text-viratec-ink"
        style={
          labelOnTop
            ? { left: first.left - PAD, top: first.top - PAD - 24 }
            : { left: last.left - PAD, top: last.bottom + PAD + 4 }
        }
      >
        {targetLabel(target, t)}
      </span>
    </>
  );
}

export function EditorOutlines({
  hovered,
  selected,
  t,
}: {
  hovered: CanvasTarget | null;
  selected: CanvasTarget | null;
  t: SiteEditorMessages;
}) {
  const showHover = hovered && hovered.element !== selected?.element;
  return (
    <>
      {selected && <Outline target={selected} isSelected t={t} />}
      {showHover && <Outline target={hovered} isSelected={false} t={t} />}
    </>
  );
}

import type { SiteEditorMessages } from '../model/messages';
import type { IssueAnchor } from '../model/useIssueAnchors';

const PADDING = 4;

interface ChangeHighlightsProps {
  anchors: readonly IssueAnchor[];
  t: SiteEditorMessages;
}

export function ChangeHighlights({ anchors, t }: ChangeHighlightsProps) {
  return anchors.map(({ element, targets }) => {
    const rect = element.getBoundingClientRect();
    const [first] = targets;
    if (!first || rect.bottom < 0 || rect.top > window.innerHeight || rect.width === 0) {
      return null;
    }
    return (
      <div
        key={first.key}
        aria-hidden="true"
        style={{
          top: rect.top - PADDING,
          left: rect.left - PADDING,
          width: rect.width + PADDING * 2,
          height: rect.height + PADDING * 2,
        }}
        className="editor-pop-in pointer-events-none fixed z-[2147483000] rounded-lg bg-brand-lime/8 outline-2 outline-brand-lime/80 outline-dashed"
      >
        <span className="absolute -top-2.5 right-1 rounded-full bg-brand-lime px-1.5 text-[11px] leading-4 font-medium text-text-on-lime">
          {t.highlight.changed}
        </span>
      </div>
    );
  });
}

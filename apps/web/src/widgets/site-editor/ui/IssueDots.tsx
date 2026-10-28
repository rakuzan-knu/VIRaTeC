import { Tooltip } from '@/shared/ui/Tooltip';
import type { SiteEditorMessages } from '../model/messages';
import type { IssueAnchor } from '../model/useIssueAnchors';
import type { IssueAddress } from '../model/useIssueTargets';
import { EDITOR_TOOLTIP_CLASS } from './IconButton';

const OFFSET = 10;

interface IssueDotsProps {
  anchors: readonly IssueAnchor[];
  t: SiteEditorMessages;
  onOpen: (address: IssueAddress) => void;
}

export function IssueDots({ anchors, t, onOpen }: IssueDotsProps) {
  return anchors.map(({ element, targets }) => {
    const rect = element.getBoundingClientRect();
    const [first] = targets;
    if (!first || rect.bottom < 0 || rect.top > window.innerHeight || rect.width === 0) {
      return null;
    }
    const text = targets.map((target) => target.text).join('; ');
    return (
      <Tooltip key={first.key} text={text} placement="top" floatingClassName={EDITOR_TOOLTIP_CLASS}>
        <button
          type="button"
          aria-label={t.dots.label(text)}
          onClick={() => onOpen(first.address)}
          style={{ top: Math.max(rect.top - OFFSET, 0), left: Math.max(rect.left - OFFSET, 0) }}
          className="pointer-events-auto fixed z-[2147483002] flex size-6 cursor-pointer items-center justify-center rounded-full bg-state-error text-[13px] font-bold text-viratec-ink ring-2 ring-bg-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <span aria-hidden="true">!</span>
        </button>
      </Tooltip>
    );
  });
}

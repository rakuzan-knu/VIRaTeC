import { Users } from 'lucide-react';
import type { SiteEditorMessages } from '../model/messages';

interface PresenceBannerProps {
  names: string[];
  t: SiteEditorMessages;
}

export function PresenceBanner({ names, t }: PresenceBannerProps) {
  if (names.length === 0) return null;

  return (
    <div
      role="status"
      className="editor-pop-in pointer-events-auto fixed top-[132px] right-3 z-[2147483003] flex max-w-[min(360px,calc(100vw-24px))] items-start xl:top-[156px] gap-2 rounded-xl border border-viratec-cyan/40 bg-viratec-deep px-4 py-2.5 text-[14px] text-text-primary"
    >
      <Users aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-viratec-cyan" />
      <span>
        {t.presence.editing(names.join(', '))}
        <span className="block text-[13px] text-text-muted">{t.presence.help}</span>
      </span>
    </div>
  );
}

import { Button } from '@/shared/ui/Button';
import { Dialog } from '@/shared/ui/dialog';
import type { SiteEditorMessages } from '../model/messages';
import { SHORTCUTS } from '../model/shortcuts';

interface HelpDialogProps {
  open: boolean;
  t: SiteEditorMessages;
  onClose: () => void;
  onTour: () => void;
}

export function HelpDialog({ open, t, onClose, onTour }: HelpDialogProps) {
  const shortcuts = [
    [SHORTCUTS.save.label, t.help.shortcuts.save],
    [SHORTCUTS.undo.label, t.help.shortcuts.undo],
    [SHORTCUTS.redo.label, t.help.shortcuts.redo],
    [SHORTCUTS.close.label, t.help.shortcuts.close],
    [`${SHORTCUTS.next.label} ${SHORTCUTS.previous.label}`, t.help.shortcuts.step],
    [SHORTCUTS.open.label, t.help.shortcuts.open],
    [SHORTCUTS.link.label, t.help.shortcuts.link],
  ] as const;

  return (
    <Dialog open={open} title={t.help.title} closeLabel={t.close} onClose={onClose}>
      <ol className="flex list-none flex-col gap-4">
        {t.help.steps.map((step, index) => (
          <li key={index} className="flex gap-4 text-[15px] leading-6 text-viratec-soft">
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-viratec-cyan/15 text-[13px] font-medium text-viratec-cyan"
            >
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <section aria-labelledby="site-editor-shortcuts" className="flex flex-col gap-3">
        <h3 id="site-editor-shortcuts" className="text-[15px] font-medium text-white">
          {t.help.shortcutsTitle}
        </h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14px]">
          {shortcuts.map(([keys, description]) => (
            <div key={description} className="contents">
              <dt>
                <kbd className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 font-sans text-[13px] text-white">
                  {keys}
                </kbd>
              </dt>
              <dd className="text-viratec-muted">{description}</dd>
            </div>
          ))}
        </dl>
      </section>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button label={t.tour.again} variant="secondary" onClick={onTour} />
        <Button label={t.help.gotIt} data-autofocus onClick={onClose} />
      </div>
    </Dialog>
  );
}

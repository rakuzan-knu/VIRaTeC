import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { Copy, Download, Eye, ShieldAlert } from 'lucide-react';
import { defineMessages, useLocalized } from '@/shared/i18n';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/shared/lib';

const AUTO_HIDE_MS = 30_000;

const MESSAGES = defineMessages({
  en: {
    title: 'Save your backup codes',
    intro:
      'Each code works once and lets you sign in if you lose your phone. They are shown only now — VIRaTeC stores only their fingerprints and cannot show them again.',
    warning:
      'Do not take screenshots: photos sync to clouds and galleries. Download the file to a safe place, store the codes in a password manager or write them down on paper.',
    hold: 'Hold to reveal',
    hidden: 'Codes are hidden',
    download: 'Download .txt',
    copy: 'Copy',
    copied: 'Copied',
    fileHeader: 'VIRaTeC backup codes — each code can be used once',
    generated: 'Generated',
    acknowledge: 'I saved these codes in a safe place',
    confirmLabel: 'Type any one of the codes to confirm you saved them',
    confirmError: 'This code is not in the list',
    done: 'Done',
  },
  uk: {
    title: 'Збережіть резервні коди',
    intro:
      'Кожен код спрацьовує один раз і дає змогу увійти, якщо ви втратите телефон. Вони показуються лише зараз — VIRaTeC зберігає тільки їхні відбитки й не зможе показати їх знову.',
    warning:
      'Не робіть знімків екрана: фото синхронізуються з хмарами та галереями. Завантажте файл у безпечне місце, збережіть коди в менеджері паролів або запишіть на папері.',
    hold: 'Утримуйте, щоб показати',
    hidden: 'Коди приховано',
    download: 'Завантажити .txt',
    copy: 'Копіювати',
    copied: 'Скопійовано',
    fileHeader: 'Резервні коди VIRaTeC — кожен код можна використати один раз',
    generated: 'Створено',
    acknowledge: 'Я зберіг(-ла) ці коди в безпечному місці',
    confirmLabel: 'Введіть будь-який із кодів, щоб підтвердити збереження',
    confirmError: 'Такого коду немає в списку',
    done: 'Готово',
  },
});

const normalize = (code: string) => code.replace(/[\s-]/g, '').toUpperCase();

interface BackupCodesPanelProps {
  codes: string[];
  onDone: () => void;
}

export function BackupCodesPanel({ codes, onDone }: BackupCodesPanelProps) {
  const t = useLocalized(MESSAGES);
  const listId = useId();
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasExported, setHasExported] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  useEffect(() => {
    if (!isRevealed) return;
    const hide = () => setIsRevealed(false);
    const timer = window.setTimeout(hide, AUTO_HIDE_MS);
    const onVisibility = () => document.hidden && hide();
    window.addEventListener('blur', hide);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('blur', hide);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isRevealed]);

  const fileContent = [
    t.fileHeader,
    `${t.generated}: ${new Date().toISOString()}`,
    '',
    ...codes,
    '',
  ].join('\n');

  const download = () => {
    const url = URL.createObjectURL(new Blob([fileContent], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'viratec-backup-codes.txt';
    link.click();
    URL.revokeObjectURL(url);
    setHasExported(true);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      setIsCopied(true);
      setHasExported(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setIsCopied(false);
    }
  };

  const normalizedCodes = codes.map(normalize);
  const confirmationMatches =
    confirmation.length > 0 && normalizedCodes.includes(normalize(confirmation));
  const canFinish = acknowledged && confirmationMatches;

  const revealHandlers = {
    onPointerDown: () => setIsRevealed(true),
    onPointerUp: () => setIsRevealed(false),
    onPointerLeave: () => setIsRevealed(false),
    onPointerCancel: () => setIsRevealed(false),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        setIsRevealed(true);
      }
    },
    onKeyUp: () => setIsRevealed(false),
    onBlur: () => setIsRevealed(false),
  };

  return (
    <div className="flex flex-col gap-5 print:hidden">
      <div className="flex flex-col gap-2">
        <h4 className="text-lg font-medium text-white">{t.title}</h4>
        <p className="text-[15px] leading-6 text-viratec-muted">{t.intro}</p>
        <p className="flex gap-2 rounded-2xl border border-amber-300/30 bg-amber-300/8 p-3 text-sm leading-5 text-amber-100">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {t.warning}
        </p>
      </div>

      <div className="relative">
        <ol
          id={listId}
          aria-hidden={!isRevealed}
          className={cn(
            'grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-[15px] tracking-[0.08em] text-white transition-[filter] select-none',
            !isRevealed && 'blur-md',
          )}
        >
          {codes.map((code) => (
            <li key={code}>{isRevealed ? code : '•••••-•••••'}</li>
          ))}
        </ol>
        {!isRevealed && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-viratec-soft">
            {t.hidden}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          aria-controls={listId}
          aria-pressed={isRevealed}
          {...revealHandlers}
          className="inline-flex touch-none items-center gap-2 rounded-control border border-border-strong bg-bg-input px-5 py-3 text-control-md font-medium text-white select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <Eye aria-hidden="true" className="size-[18px]" />
          {t.hold}
        </button>
        <button
          type="button"
          onClick={download}
          className="inline-flex items-center gap-2 rounded-control border border-border-strong bg-bg-input px-5 py-3 text-control-md font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <Download aria-hidden="true" className="size-[18px]" />
          {t.download}
        </button>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-control border border-border-strong bg-bg-input px-5 py-3 text-control-md font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <Copy aria-hidden="true" className="size-[18px]" />
          <span aria-live="polite">{isCopied ? t.copied : t.copy}</span>
        </button>
      </div>

      {hasExported && (
        <div className="flex flex-col gap-4 border-t border-white/10 pt-5">
          <label className="flex items-start gap-3 text-[15px] text-white">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
              className="mt-1 size-4 accent-viratec-lime"
            />
            {t.acknowledge}
          </label>
          <Input
            label={t.confirmLabel}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="font-mono uppercase"
            error={confirmation.length >= 10 && !confirmationMatches ? t.confirmError : undefined}
          />
          <Button label={t.done} disabled={!canFinish} onClick={onDone} className="self-start" />
        </div>
      )}
    </div>
  );
}

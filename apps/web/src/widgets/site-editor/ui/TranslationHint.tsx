import { useRef } from 'react';
import { Copy, Languages, LoaderCircle, WandSparkles } from 'lucide-react';
import { LOCALES, type Locale } from '@/shared/i18n';
import type { SiteEditorMessages } from '../model/messages';
import { useSiteEditorStore } from '../model/store';
import { EDITOR_ROOT_ATTRIBUTE } from '../model/useCanvasTargets';
import { useTranslateText } from '../model/useTranslateText';

const ACTION_CLASS =
  'inline-flex min-h-6 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] text-viratec-cyan hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus disabled:cursor-wait disabled:opacity-60';

const hasText = (value: unknown) =>
  typeof value === 'string'
    ? value.trim().length > 0
    : Array.isArray(value) && value.some((item) => typeof item === 'string' && item.trim());

const isTextValue = (value: unknown) =>
  value === undefined || value === null || typeof value === 'string' || Array.isArray(value);

interface TranslationHintProps {
  values: Record<Locale, unknown>;
  readOnly: boolean;
  t: SiteEditorMessages;
  onCopy: (from: Locale, to: Locale) => void;
  onTranslated?: (to: Locale, text: string) => void;
}

export function TranslationHint({
  values,
  readOnly,
  t,
  onCopy,
  onTranslated,
}: TranslationHintProps) {
  const ref = useRef<HTMLDivElement>(null);
  const translation = useTranslateText();
  if (!LOCALES.every((locale) => isTextValue(values[locale]))) return null;
  const missing = LOCALES.find((locale) => !hasText(values[locale]));
  const source = LOCALES.find((locale) => hasText(values[locale]));
  if (!missing || !source) return null;
  const sourceText = values[source];

  const focusTarget = () =>
    ref.current
      ?.closest(`fieldset, [${EDITOR_ROOT_ATTRIBUTE}]`)
      ?.querySelector<HTMLElement>(`textarea[lang="${missing}"], input[lang="${missing}"]`)
      ?.focus();

  return (
    <div ref={ref} className="-mt-1 flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 text-[12px] text-text-muted">
          <Languages aria-hidden="true" className="size-3.5" />
          {t.translation.missingIn[missing]}
        </span>
        {!readOnly && onTranslated && typeof sourceText === 'string' && (
          <button
            type="button"
            disabled={translation.isPending}
            aria-busy={translation.isPending}
            onClick={async () => {
              const { announce } = useSiteEditorStore.getState();
              announce(t.translation.translating);
              const text = await translation.translate(source, missing, sourceText);
              if (text === null) return;
              onTranslated(missing, text);
              announce(t.translation.translated);
              focusTarget();
            }}
            className={ACTION_CLASS}
          >
            {translation.isPending ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-3.5 animate-spin motion-reduce:animate-none"
              />
            ) : (
              <WandSparkles aria-hidden="true" className="size-3.5" />
            )}
            {translation.isPending ? t.translation.translating : t.translation.translate[missing]}
          </button>
        )}
        {!readOnly && (
          <button
            type="button"
            onClick={() => {
              onCopy(source, missing);
              useSiteEditorStore.getState().announce(t.translation.copied);
              focusTarget();
            }}
            className={ACTION_CLASS}
          >
            <Copy aria-hidden="true" className="size-3.5" />
            {t.translation.copyFrom[source]}
          </button>
        )}
      </div>
      {translation.error && (
        <p role="alert" className="text-[13px] text-state-error">
          {translation.error}
        </p>
      )}
    </div>
  );
}

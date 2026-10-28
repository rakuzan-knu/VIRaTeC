import { EyeOff } from 'lucide-react';
import { LOCALES, type Locale } from '@/shared/i18n';
import type { SiteEditorMessages } from '../model/messages';

const isEmpty = (value: unknown) => typeof value !== 'string' || value.trim().length === 0;

interface AltHintProps {
  values: Record<Locale, unknown>;
  t: SiteEditorMessages;
}

export function AltHint({ values, t }: AltHintProps) {
  if (!LOCALES.every((locale) => isEmpty(values[locale]))) return null;
  return (
    <p className="-mt-1 flex items-start gap-2 rounded-xl bg-white/6 px-3 py-2 text-[13px] text-text-primary">
      <EyeOff aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-viratec-cyan" />
      {t.alt.missing}
    </p>
  );
}

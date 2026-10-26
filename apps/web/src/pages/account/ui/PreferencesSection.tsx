import { LOCALES, useLocale, useLocaleStore, type Locale } from '@/shared/i18n';
import { ChipGroup } from '@/shared/ui/chip';
import { useAccountMessages } from '../model/messages';
import { SectionCard } from './SectionCard';

const LANGUAGE_LABELS: Record<Locale, string> = { en: 'English', uk: 'Українська' };

const LANGUAGE_OPTIONS = LOCALES.map((value) => ({ value, label: LANGUAGE_LABELS[value] }));

export function PreferencesSection() {
  const t = useAccountMessages();
  const locale = useLocale();
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <SectionCard title={t.language}>
      <ChipGroup
        label={t.language}
        options={LANGUAGE_OPTIONS}
        value={locale}
        onChange={setLocale}
      />
    </SectionCard>
  );
}

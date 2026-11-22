import { LANGUAGE_NAMES, LOCALES, useLocale, useLocaleStore } from '@/shared/i18n';
import { ChipGroup } from '@/shared/ui/chip';
import { useAccountMessages } from '../model/messages';
import { SectionCard } from './SectionCard';

const LANGUAGE_OPTIONS = LOCALES.map((value) => ({ value, label: LANGUAGE_NAMES[value] }));

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

import { useFormState, type Control, type UseFormRegister } from 'react-hook-form';
import { PROFILE_LINK_KEYS, type ProfileLinkKey } from '@viratec/contracts';
import { useAccountLabels } from '@/entities/session';
import { Input } from '@/shared/ui/Input';
import { useProfileFormMessages } from '../model/messages';
import type { ProfileFormValues } from '../model/schema';
import { FormSection } from './FormSection';

const LINK_PLACEHOLDERS: Record<ProfileLinkKey, string> = {
  orcid: '0000-0002-1825-0097',
  googleScholar: 'https://scholar.google.com/citations?user=…',
  scopus: '57190000000',
  researchGate: 'https://www.researchgate.net/profile/…',
  linkedin: 'https://www.linkedin.com/in/…',
  github: 'octocat',
  website: 'https://example.com',
};

interface SectionProps {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
}

export function LinksSection({ control, register }: SectionProps) {
  const t = useProfileFormMessages();
  const labels = useAccountLabels();
  const { errors } = useFormState({ control });

  return (
    <FormSection title={t.sections.links} hint={t.sections.linksHint}>
      <div className="grid gap-5 sm:grid-cols-2">
        {PROFILE_LINK_KEYS.map((key) => (
          <Input
            key={key}
            label={labels.links[key]}
            placeholder={LINK_PLACEHOLDERS[key]}
            inputMode={key === 'orcid' || key === 'scopus' ? 'text' : 'url'}
            autoComplete={key === 'website' ? 'url' : 'off'}
            spellCheck={false}
            error={errors.links?.[key]?.message}
            {...register(`links.${key}`)}
          />
        ))}
      </div>
    </FormSection>
  );
}

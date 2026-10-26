import { useSearchParams } from 'react-router-dom';
import { ACCOUNT_SECTION_PARAM } from '@/shared/config/routes';
import { isAccountSection, type AccountSection } from './sections';

export function useAccountSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get(ACCOUNT_SECTION_PARAM);
  const active: AccountSection = isAccountSection(requested) ? requested : 'profile';

  const select = (section: AccountSection) =>
    setSearchParams(section === 'profile' ? {} : { [ACCOUNT_SECTION_PARAM]: section }, {
      replace: true,
      preventScrollReset: true,
      viewTransition: false,
    });

  return { active, select };
}

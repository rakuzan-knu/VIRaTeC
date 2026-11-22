import { useLayoutEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ACCOUNT_SECTION_ANCHOR, ACCOUNT_SECTION_PARAM } from '@/shared/config/routes';
import { isAccountSection, type AccountSection } from './sections';

export function useAccountSection() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requested = searchParams.get(ACCOUNT_SECTION_PARAM);
  const active: AccountSection = isAccountSection(requested) ? requested : 'profile';

  useLayoutEffect(() => {
    if (window.location.hash === `#${ACCOUNT_SECTION_ANCHOR}`) {
      document.getElementById(ACCOUNT_SECTION_ANCHOR)?.scrollIntoView();
    }
  }, []);

  const select = (section: AccountSection) =>
    navigate(
      {
        search: section === 'profile' ? '' : `?${ACCOUNT_SECTION_PARAM}=${section}`,
        hash: `#${ACCOUNT_SECTION_ANCHOR}`,
      },
      { replace: true, viewTransition: false },
    );

  return { active, select };
}

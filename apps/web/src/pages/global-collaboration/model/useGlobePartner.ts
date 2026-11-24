import { useSyncExternalStore } from 'react';
import { useSearchParams } from 'react-router-dom';

const PARTNER_PARAM = 'partner';

const subscribe = () => () => undefined;

export const partnerAnchor = (slug: string) => `partner-${slug}`;

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';

export function useGlobePartner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const partner = isHydrated ? searchParams.get(PARTNER_PARAM) : null;

  const select = (slug: string | null) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (slug === null) next.delete(PARTNER_PARAM);
        else next.set(PARTNER_PARAM, slug);
        return next;
      },
      { replace: partner !== null, preventScrollReset: true, viewTransition: false },
    );
  };

  const showOnGlobe = (slug: string, globeId: string) => {
    select(slug);
    document
      .getElementById(globeId)
      ?.scrollIntoView({ block: 'center', behavior: scrollBehavior() });
  };

  const showDetails = (slug: string) => {
    select(null);
    window.setTimeout(() => {
      const card = document.getElementById(partnerAnchor(slug));
      card?.focus({ preventScroll: true });
      card?.scrollIntoView({ block: 'center', behavior: scrollBehavior() });
    }, 150);
  };

  return { partner, select, showOnGlobe, showDetails };
}

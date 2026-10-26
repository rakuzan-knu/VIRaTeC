import { useEffect, useRef } from 'react';
import {
  Bookmark,
  Lock,
  LogOut,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
  UserRound,
  Users,
} from 'lucide-react';
import { cn } from '@/shared/lib';
import { useAccountMessages } from '../model/messages';
import { ACCOUNT_SECTIONS, type AccountSection } from '../model/sections';

const SECTION_ICONS: Record<AccountSection, typeof UserRound> = {
  profile: UserRound,
  saved: Bookmark,
  security: ShieldCheck,
  privacy: Lock,
  preferences: SlidersHorizontal,
  accounts: Users,
  danger: TriangleAlert,
};

interface AccountNavProps {
  active: AccountSection;
  isSigningOut: boolean;
  onSelect: (section: AccountSection) => void;
  onSignOut: () => void;
}

export function AccountNav({ active, isSigningOut, onSelect, onSignOut }: AccountNavProps) {
  const t = useAccountMessages();
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tab = activeTabRef.current;
    const list = tab?.closest('ul');
    if (!tab || !list || list.scrollWidth <= list.clientWidth) return;
    const offset = tab.getBoundingClientRect().left - list.getBoundingClientRect().left;
    list.scrollLeft += offset - 20;
  }, [active]);

  return (
    <nav aria-label={t.sectionsNav} className="lg:sticky lg:top-28 lg:w-[280px] lg:shrink-0">
      <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
        {ACCOUNT_SECTIONS.map((section) => {
          const Icon = SECTION_ICONS[section];
          const isActive = section === active;
          return (
            <li key={section} className="shrink-0">
              <button
                type="button"
                ref={isActive ? activeTabRef : undefined}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSelect(section)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-full px-4 py-2.5 text-left text-[15px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime lg:rounded-[14px] lg:py-3',
                  isActive
                    ? 'bg-white text-viratec-ink'
                    : 'border border-white/14 bg-white/4 text-white hover:bg-white/10 lg:border-transparent lg:bg-transparent',
                  section === 'danger' && !isActive && 'text-state-error',
                )}
              >
                <Icon aria-hidden="true" className="size-[18px] shrink-0" />
                {t.sections[section]}
              </button>
            </li>
          );
        })}
        <li className="shrink-0 lg:mt-3 lg:border-t lg:border-white/8 lg:pt-3">
          <button
            type="button"
            onClick={onSignOut}
            disabled={isSigningOut}
            className="flex w-full cursor-pointer items-center gap-3 rounded-full border border-white/14 bg-white/4 px-4 py-2.5 text-left text-[15px] font-medium whitespace-nowrap text-viratec-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime disabled:opacity-50 lg:rounded-[14px] lg:border-transparent lg:bg-transparent lg:py-3"
          >
            <LogOut aria-hidden="true" className="size-[18px] shrink-0" />
            {t.signOut}
          </button>
        </li>
      </ul>
    </nav>
  );
}

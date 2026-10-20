import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn, useBodyScrollLock } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';
import { MAIN_NAV } from '@/shared/config/navigation';
import { Logo } from '@/shared/ui/logo';
import { LinkButton } from '@/shared/ui/link-button';
import closeIcon from '@/shared/assets/icons/close.svg';
import menuChevron from '@/shared/assets/icons/menu-chevron.svg';

interface MobileMenuProps {
  onClose: () => void;
}

const ROW_CLASS =
  'flex w-full items-center justify-between border-b border-white/10 py-[18px] text-left text-[22px] font-medium text-white';

export function MobileMenu({ onClose }: MobileMenuProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useBodyScrollLock(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-viratec-bg font-viratec xl:hidden"
    >
      <div className="flex items-center justify-between px-5 py-3.5">
        <Link to={ROUTES.HOME} onClick={onClose} aria-label="VIRaTeC home">
          <Logo className="w-[141px]" />
        </Link>
        <button type="button" onClick={onClose} aria-label="Close menu" className="cursor-pointer">
          <img src={closeIcon} alt="" />
        </button>
      </div>

      <nav aria-label="Main" className="px-5 pt-3">
        <ul>
          {MAIN_NAV.map((entry, index) => {
            const isLast = index === MAIN_NAV.length - 1;

            if (entry.type === 'link') {
              return (
                <li key={entry.link.to}>
                  <Link
                    to={entry.link.to}
                    onClick={onClose}
                    className={cn(ROW_CLASS, isLast && 'border-b-0')}
                  >
                    {entry.link.label}
                  </Link>
                </li>
              );
            }

            const { group } = entry;
            const isOpen = openGroup === group.label;
            const panelId = `mobile-submenu-${index}`;

            return (
              <li key={group.label}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                  className={cn(ROW_CLASS, 'cursor-pointer')}
                >
                  {group.label}
                  <img
                    src={menuChevron}
                    alt=""
                    className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
                  />
                </button>
                {isOpen && (
                  <ul id={panelId} className="flex flex-col gap-4 py-4 pl-4">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={onClose}
                          className="text-[17px] leading-[22px] text-viratec-soft transition-colors hover:text-white"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto flex flex-col gap-3 px-5 pt-8 pb-8">
        <LinkButton to={ROUTES.CONTACT} onClick={onClose} className="w-full">
          Contact / Collaborate
        </LinkButton>
        <Link
          to={ROUTES.LOGIN}
          onClick={onClose}
          className="flex w-full justify-center rounded-2xl border-[1.5px] border-white/30 py-[15px] text-[17px] font-medium text-white transition-colors hover:bg-white/6"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}

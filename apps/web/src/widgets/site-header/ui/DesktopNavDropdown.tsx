import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib';
import type { NavGroup } from '@/shared/config/navigation';
import navChevron from '@/shared/assets/icons/nav-chevron.svg';

interface DesktopNavDropdownProps {
  group: NavGroup;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

export function DesktopNavDropdown({
  group,
  isOpen,
  onOpen,
  onClose,
  onToggle,
}: DesktopNavDropdownProps) {
  const menuId = `nav-menu-${group.id}`;

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={(event) => (event.detail === 0 ? onToggle() : onOpen())}
        className={cn(
          'flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-[15px] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime',
          isOpen ? 'text-white' : 'text-viratec-light/72',
        )}
      >
        {group.label}
        <img
          src={navChevron}
          alt=""
          className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>

      <div
        id={menuId}
        className={cn(
          'absolute top-full left-1/2 z-30 w-[380px] -translate-x-1/2 pt-3 transition-[opacity,translate] duration-200 ease-apple',
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
        )}
      >
        <ul className="flex flex-col gap-0.5 rounded-[24px] border border-white/10 bg-viratec-dropdown p-2 shadow-overlay">
          {group.items.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onClose}
                className="group flex flex-col gap-1 rounded-[18px] px-[18px] py-3.5 transition-colors hover:bg-white/7 focus-visible:bg-white/7 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-viratec-lime"
              >
                <span className="flex items-center gap-2 text-base font-medium tracking-[-0.01em] text-white">
                  {item.label}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 -translate-x-1 text-viratec-accent opacity-0 transition-[opacity,translate] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                  />
                </span>
                {item.description && (
                  <span className="text-sm leading-5 text-viratec-subtle">{item.description}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

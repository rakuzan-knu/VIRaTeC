import { Link } from 'react-router-dom';
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
  const menuId = `nav-menu-${group.label.toLowerCase().replace(/[^a-z]+/g, '-')}`;

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={(event) => (event.detail === 0 ? onToggle() : onOpen())}
        className="flex cursor-pointer items-center gap-[5px] text-base text-white transition-opacity hover:opacity-80"
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
          'absolute top-full left-1/2 z-30 w-[362px] -translate-x-1/2 pt-[22px] transition-[opacity,translate] duration-200',
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
        )}
      >
        <ul className="flex flex-col gap-1 rounded-[20px] border border-white/12 bg-viratec-dropdown p-2.5 shadow-[0px_24px_60px_0px_rgba(0,5,26,0.55)]">
          {group.items.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onClose}
                className="group flex flex-col gap-1 rounded-[14px] px-[18px] py-3.5 transition-colors hover:bg-white/7 focus-visible:bg-white/7 focus-visible:outline-none"
              >
                <span className="flex items-center gap-2 text-[17px] font-medium text-white">
                  {item.label}
                  <span
                    aria-hidden="true"
                    className="font-normal text-viratec-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    →
                  </span>
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

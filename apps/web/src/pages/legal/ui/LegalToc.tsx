import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib';
import { formatIndex } from '../model/documents';
import type { LegalSection } from '../model/types';

interface LegalTocProps {
  label: string;
  sections: LegalSection[];
}

function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0]);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

function TocLinks({ sections, activeId }: { sections: LegalSection[]; activeId?: string }) {
  return (
    <ol className="flex flex-col gap-1">
      {sections.map((section, index) => {
        const isActive = section.id === activeId;
        return (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={isActive ? 'location' : undefined}
              className={cn(
                'flex gap-3 rounded-lg px-3 py-2 text-sm leading-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime',
                isActive
                  ? 'bg-white/6 text-white'
                  : 'text-viratec-subtle hover:bg-white/4 hover:text-white',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'font-medium tabular-nums',
                  isActive ? 'text-viratec-accent' : 'text-white/30',
                )}
              >
                {formatIndex(index)}
              </span>
              {section.title}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function LegalToc({ label, sections }: LegalTocProps) {
  const ids = useMemo(() => sections.map((section) => section.id), [sections]);
  const activeId = useActiveSection(ids);

  return (
    <>
      <details className="group rounded-2xl border border-white/10 bg-white/[0.035] lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium text-white [&::-webkit-details-marker]:hidden">
          {label}
          <ChevronDown
            aria-hidden="true"
            className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <nav aria-label={label} className="px-2 pb-3">
          <TocLinks sections={sections} />
        </nav>
      </details>

      <nav aria-label={label} className="sticky top-28 hidden self-start lg:block">
        <p className="mb-3 px-3 text-[13px] font-medium text-white">{label}</p>
        <TocLinks sections={sections} activeId={activeId} />
      </nav>
    </>
  );
}

import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { usePartnerNames } from '@/entities/partner';
import { useCommonMessages } from '@/shared/i18n';
import { useIntlNames } from '@/shared/lib/intlNames';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { Chip } from '@/shared/ui/chip';
import { PARTNERS } from '../lib/partners';
import { useGlobeMessages } from '../model/messages';
import { useIsDesktop } from '../model/useIsDesktop';
import { GLOBE_BUTTON } from './styles';

const COUNTRIES = [...new Set(PARTNERS.map((partner) => partner.country))];

const regionOf = (country: string) => (country === 'UK' ? 'GB' : country);

interface GlobeSearchProps {
  onSelect: (index: number) => void;
  onFocusGroup: (indices: number[]) => void;
  onClose: () => void;
}

export function GlobeSearch({ onSelect, onFocusGroup, onClose }: GlobeSearchProps) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useGlobeMessages();
  const common = useCommonMessages();
  const partnerName = usePartnerNames();
  const { countryName } = useIntlNames();
  const isDesktop = useIsDesktop();
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, onClose]);

  const needle = query.trim().toLocaleLowerCase();
  const results = PARTNERS.flatMap((partner, index) => {
    if (country !== null && partner.country !== country) return [];
    const name = partnerName(partner.name);
    const haystack = `${name} ${partner.name} ${countryName(regionOf(partner.country))}`;
    if (!haystack.toLocaleLowerCase().includes(needle)) return [];
    return [{ index, name, place: countryName(regionOf(partner.country)) }];
  });

  const toggleCountry = (next: string) => {
    const value = next === country ? null : next;
    setCountry(value);
    if (value === null || !isDesktop) return;
    onFocusGroup(PARTNERS.flatMap((partner, index) => (partner.country === value ? [index] : [])));
  };

  const closeButton = (
    <button type="button" aria-label={common.close} onClick={onClose} className={GLOBE_BUTTON}>
      <X aria-hidden="true" className="size-4" />
    </button>
  );

  const content = (
    <>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label={t.search}
        placeholder={t.search}
        className="w-full rounded-[14px] border border-white/14 bg-white/6 px-4 py-2.5 text-[15px] text-white outline-hidden placeholder:text-viratec-subtle focus:border-viratec-lime"
      />
      <div role="group" aria-label={t.countries} className="flex flex-wrap gap-1.5">
        {COUNTRIES.map((code) => (
          <Chip
            key={code}
            isActive={code === country}
            onClick={() => toggleCountry(code)}
            className="px-3 py-1 text-[13px]"
          >
            {countryName(regionOf(code))}
          </Chip>
        ))}
      </div>
      <p role="status" className="sr-only">
        {t.universities(results.length)}
      </p>
      {results.length === 0 ? (
        <p className="text-sm text-viratec-muted">{t.noResults}</p>
      ) : (
        <ul className="flex max-h-[220px] flex-col overflow-y-auto max-lg:max-h-none">
          {results.map(({ index, name, place }) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                className="flex w-full cursor-pointer flex-col rounded-xl px-3 py-2 text-start transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-viratec-lime"
              >
                <span className="text-[15px] leading-5 text-white">{name}</span>
                <span className="text-[13px] leading-5 text-viratec-subtle">{place}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  if (!isDesktop) {
    return (
      <BottomSheet isOpen title={t.search} onClose={onClose} headerAction={closeButton}>
        {content}
      </BottomSheet>
    );
  }

  return (
    <section
      aria-labelledby={titleId}
      className="intro-globe-card intro-globe-panel flex w-[340px] flex-col gap-3 rounded-[24px] border border-white/10 bg-viratec-sheet p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={titleId} className="font-display text-xl leading-[26px] font-medium text-white">
          {t.search}
        </h2>
        {closeButton}
      </div>
      {content}
    </section>
  );
}

import { useEffect, useId, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PartnerSummary, usePartnerNames } from '@/entities/partner';
import { useCommonMessages } from '@/shared/i18n';
import { BottomSheet } from '@/shared/ui/bottom-sheet';
import { formatCoordinates } from '../lib/coordinates';
import type { Partner } from '../lib/partners';
import { useGlobeMessages } from '../model/messages';
import { useIsDesktop } from '../model/useIsDesktop';
import { GlobeLocalTime } from './GlobeLocalTime';
import { GLOBE_BUTTON } from './styles';

interface GlobePartnerCardProps {
  partner: Partner;
  position: number;
  total: number;
  onStep: (step: 1 | -1) => void;
  onShowDetails?: () => void;
  onClose: () => void;
}

export function GlobePartnerCard({
  partner,
  position,
  total,
  onStep,
  onShowDetails,
  onClose,
}: GlobePartnerCardProps) {
  const titleId = useId();
  const cardRef = useRef<HTMLElement>(null);
  const t = useGlobeMessages();
  const common = useCommonMessages();
  const name = usePartnerNames()(partner.name);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, onClose]);

  const closeButton = (
    <button type="button" aria-label={common.close} onClick={onClose} className={GLOBE_BUTTON}>
      <X aria-hidden="true" className="size-4" />
    </button>
  );
  const details = (
    <div key={partner.name} className="intro-globe-card-content flex flex-col gap-3">
      <PartnerSummary name={partner.name} coordinates={formatCoordinates(partner)} />
      <GlobeLocalTime timeZone={partner.timeZone} />
      {onShowDetails && (
        <button
          type="button"
          onClick={onShowDetails}
          className="inline-flex min-h-6 cursor-pointer items-center self-start rounded text-[15px] font-medium text-viratec-cyan underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
        >
          {t.details}
        </button>
      )}
    </div>
  );
  const navigation = (
    <div className="flex items-center justify-between border-t border-white/10 pt-3">
      <button
        type="button"
        aria-label={t.previous}
        onClick={() => onStep(-1)}
        className={GLOBE_BUTTON}
      >
        <ChevronLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
      </button>
      <span dir="ltr" className="text-sm text-viratec-subtle tabular-nums">
        {position} / {total}
      </span>
      <button type="button" aria-label={t.next} onClick={() => onStep(1)} className={GLOBE_BUTTON}>
        <ChevronRight aria-hidden="true" className="size-4 rtl:rotate-180" />
      </button>
    </div>
  );

  if (!isDesktop) {
    return (
      <BottomSheet
        isOpen
        title={name}
        onClose={onClose}
        headerAction={closeButton}
        footer={navigation}
      >
        {details}
      </BottomSheet>
    );
  }

  return (
    <section
      ref={cardRef}
      tabIndex={-1}
      aria-labelledby={titleId}
      className="intro-globe-card intro-globe-panel flex w-[340px] flex-col gap-3 rounded-[24px] border border-white/10 bg-viratec-sheet p-5 outline-hidden"
    >
      <span aria-hidden="true" className="intro-globe-leader" />
      <div className="flex items-start justify-between gap-3">
        <h2
          id={titleId}
          aria-live="polite"
          className="font-display text-xl leading-[26px] font-medium tracking-[-0.02em] text-white"
        >
          {name}
        </h2>
        {closeButton}
      </div>
      {details}
      {navigation}
    </section>
  );
}

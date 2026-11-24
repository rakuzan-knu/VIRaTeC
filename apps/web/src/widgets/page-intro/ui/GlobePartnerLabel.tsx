import { usePartnerNames } from '@/entities/partner';
import { PARTNERS } from '../lib/partners';
import { useGlobeMessages } from '../model/messages';

interface GlobePartnerLabelProps {
  indices: number[];
}

export function GlobePartnerLabel({ indices }: GlobePartnerLabelProps) {
  const t = useGlobeMessages();
  const partnerName = usePartnerNames();
  const [first = 0] = indices;

  return (
    <span className="block w-max max-w-[260px] rounded-2xl border border-white/10 bg-viratec-sheet px-3.5 py-1.5 text-center text-sm leading-5 text-white">
      {indices.length > 1
        ? t.universities(indices.length)
        : partnerName(PARTNERS[first]?.name ?? '')}
    </span>
  );
}

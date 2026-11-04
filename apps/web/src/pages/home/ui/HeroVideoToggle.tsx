import { Pause, Play } from 'lucide-react';
import { useLocalized } from '@/shared/i18n';
import { HERO_VIDEO_MESSAGES } from '../model/messages';

interface HeroVideoToggleProps {
  isPaused: boolean;
  onToggle: () => void;
}

export function HeroVideoToggle({ isPaused, onToggle }: HeroVideoToggleProps) {
  const t = useLocalized(HERO_VIDEO_MESSAGES);
  const Icon = isPaused ? Play : Pause;

  return (
    <button
      type="button"
      aria-label={isPaused ? t.play : t.pause}
      onClick={onToggle}
      className="absolute right-6 bottom-6 z-20 hidden size-10 cursor-pointer items-center justify-center rounded-full border border-white/14 bg-white/6 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime lg:flex"
    >
      <Icon aria-hidden="true" className="size-4" />
    </button>
  );
}

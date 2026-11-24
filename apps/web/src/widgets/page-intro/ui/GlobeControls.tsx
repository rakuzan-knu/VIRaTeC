import { Minus, Pause, Play, Plus, Route, Search, Square } from 'lucide-react';
import { cn } from '@/shared/lib';
import { useGlobeMessages } from '../model/messages';
import { GLOBE_BUTTON } from './styles';

interface GlobeControlsProps {
  isFeatured: boolean;
  isPlaying: boolean;
  isTouring: boolean;
  onExplore: () => void;
  onSearch: () => void;
  onToggleTour: () => void;
  onTogglePlay: () => void;
  onZoom: (direction: 1 | -1) => void;
}

export function GlobeControls({
  isFeatured,
  isPlaying,
  isTouring,
  onExplore,
  onSearch,
  onToggleTour,
  onTogglePlay,
  onZoom,
}: GlobeControlsProps) {
  const t = useGlobeMessages();
  const PlayIcon = isPlaying ? Pause : Play;
  const TourIcon = isTouring ? Square : Route;

  return (
    <div className="intro-globe-controls flex w-max items-center gap-1 rounded-full border border-white/10 bg-viratec-sheet p-1">
      <button
        type="button"
        onClick={onExplore}
        className="h-9 cursor-pointer rounded-full px-3.5 text-sm font-medium whitespace-nowrap text-viratec-cyan transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime"
      >
        {t.explore}
      </button>
      <span aria-hidden="true" className="h-5 w-px bg-white/10" />
      {isFeatured && (
        <>
          <button type="button" aria-label={t.search} onClick={onSearch} className={GLOBE_BUTTON}>
            <Search aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            aria-label={isTouring ? t.stopTour : t.startTour}
            onClick={onToggleTour}
            className={cn(GLOBE_BUTTON, 'max-lg:hidden')}
          >
            <TourIcon aria-hidden="true" className="size-4" />
          </button>
        </>
      )}
      <button
        type="button"
        aria-label={t.zoomOut}
        onClick={() => onZoom(-1)}
        className={cn(GLOBE_BUTTON, 'max-sm:hidden')}
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <button
        type="button"
        aria-label={t.zoomIn}
        onClick={() => onZoom(1)}
        className={cn(GLOBE_BUTTON, 'max-sm:hidden')}
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
      <button
        type="button"
        aria-label={isPlaying ? t.pause : t.play}
        onClick={onTogglePlay}
        className={cn(GLOBE_BUTTON, 'motion-reduce:hidden')}
      >
        <PlayIcon aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}

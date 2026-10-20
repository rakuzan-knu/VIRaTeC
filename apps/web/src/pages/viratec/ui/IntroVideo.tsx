import { useState } from 'react';
import playIcon from '@/shared/assets/icons/play.svg';

export interface VideoSource {
  src: string;
  type: string;
}

interface IntroVideoProps {
  title: string;
  duration: string;
  sources: VideoSource[];
  poster?: string;
}

const FRAME_CLASS =
  'relative aspect-video w-full overflow-hidden rounded-[22px] border border-white/14 lg:aspect-auto lg:h-[714px] lg:rounded-[32px]';

export function IntroVideo({ title, duration, sources, poster }: IntroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const caption = `${title} · ${duration}`;

  if (isPlaying) {
    return (
      <video
        controls
        autoPlay
        playsInline
        poster={poster}
        aria-label={caption}
        className={`${FRAME_CLASS} bg-black object-contain`}
      >
        {sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </video>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsPlaying(true)}
      aria-label={`Play video: ${caption}`}
      className={`${FRAME_CLASS} group flex cursor-pointer flex-col items-center justify-center gap-3.5 bg-[linear-gradient(143.14deg,#0a2b73_0%,#0d6b8c_42.86%,#339e73_71.43%)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-viratec-lime`}
    >
      {poster && (
        <>
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-[rgba(3,18,46,0.45)]" />
        </>
      )}
      <span className="relative flex size-16 items-center justify-center rounded-full bg-white transition-transform group-hover:scale-105 lg:size-24">
        <img src={playIcon} alt="" className="ml-1 h-6 w-auto lg:ml-1.5 lg:h-8" />
      </span>
      <span className="relative text-sm leading-5 font-medium text-white lg:text-[15px]">
        {caption}
      </span>
    </button>
  );
}

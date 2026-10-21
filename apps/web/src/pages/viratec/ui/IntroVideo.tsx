import { useState } from 'react';
import { defineMessages, useLocalized } from '@/shared/i18n';
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

const INTRO_VIDEO_MESSAGES = defineMessages({
  en: { play: (caption: string) => `Play video: ${caption}` },
  uk: { play: (caption: string) => `Відтворити відео: ${caption}` },
});

const FRAME_CLASS =
  'relative aspect-video w-full overflow-hidden rounded-[24px] border border-white/10 lg:aspect-auto lg:h-[714px] lg:rounded-[40px]';

export function IntroVideo({ title, duration, sources, poster }: IntroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const caption = `${title} · ${duration}`;
  const t = useLocalized(INTRO_VIDEO_MESSAGES);

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
      aria-label={t.play(caption)}
      className={`${FRAME_CLASS} group flex cursor-pointer flex-col items-center justify-center gap-3.5 bg-viratec-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-viratec-lime`}
    >
      {poster && (
        <>
          <img
            src={poster}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-[rgba(3,18,46,0.45)]" />
        </>
      )}
      <span className="relative flex size-16 items-center justify-center rounded-full bg-white transition-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 lg:size-24">
        <img src={playIcon} alt="" className="ml-1 h-6 w-auto lg:ml-1.5 lg:h-8" />
      </span>
      <span className="relative text-sm leading-5 font-medium text-white lg:text-[15px]">
        {caption}
      </span>
    </button>
  );
}

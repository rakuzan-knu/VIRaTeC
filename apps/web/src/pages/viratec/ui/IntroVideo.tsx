import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { defineMessages, useLocalized } from '@/shared/i18n';
import playIcon from '@/shared/assets/icons/play.svg';
import { ResponsiveImage } from '@/shared/ui/responsive-image';

export interface VideoSource {
  src: string;
  type: string;
}

interface IntroVideoProps {
  title: string;
  duration: string;
  sources: VideoSource[];
  poster?: string;
  transcriptLabel: string;
  transcript: string[];
}

interface VideoTranscriptProps {
  label: string;
  paragraphs: string[];
}

function VideoTranscript({ label, paragraphs }: VideoTranscriptProps) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-white/[0.035]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="space-y-3 px-5 pb-5 text-sm leading-6 text-viratec-muted">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </details>
  );
}

const INTRO_VIDEO_MESSAGES = defineMessages({
  en: { play: (caption: string) => `Play video: ${caption}` },
  uk: { play: (caption: string) => `Відтворити відео: ${caption}` },
});

const FRAME_CLASS =
  'relative aspect-video w-full overflow-hidden rounded-[24px] border border-white/10 lg:aspect-auto lg:h-[714px] lg:rounded-[40px]';

export function IntroVideo({
  title,
  duration,
  sources,
  poster,
  transcriptLabel,
  transcript,
}: IntroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const caption = `${title} · ${duration}`;
  const t = useLocalized(INTRO_VIDEO_MESSAGES);

  const player = isPlaying ? (
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
  ) : (
    <button
      type="button"
      onClick={() => setIsPlaying(true)}
      aria-label={t.play(caption)}
      className={`${FRAME_CLASS} group flex cursor-pointer flex-col items-center justify-center gap-3.5 bg-viratec-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-viratec-lime`}
    >
      {poster && (
        <>
          <ResponsiveImage
            src={poster}
            sizes="(min-width: 1440px) 1270px, 100vw"
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

  return (
    <>
      {player}
      <VideoTranscript label={transcriptLabel} paragraphs={transcript} />
    </>
  );
}

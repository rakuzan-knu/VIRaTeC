import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { cn } from '@/shared/lib';
import posterSrc from '../assets/hero-background.webp';
import webmSrc from '../assets/hero-background.webm';
import mp4Src from '../assets/hero-background.mp4';

const VIDEO_MEDIA_QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

function subscribeToMediaQuery(onChange: () => void) {
  const mediaQueryList = window.matchMedia(VIDEO_MEDIA_QUERY);
  mediaQueryList.addEventListener('change', onChange);
  return () => mediaQueryList.removeEventListener('change', onChange);
}

function getCanPlayVideo() {
  const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;
  return !saveData && window.matchMedia(VIDEO_MEDIA_QUERY).matches;
}

function getServerCanPlayVideo() {
  return false;
}

export function HeroBackgroundVideo() {
  const canPlayVideo = useSyncExternalStore(
    subscribeToMediaQuery,
    getCanPlayVideo,
    getServerCanPlayVideo,
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!canPlayVideo || !video) return;

    let isInView = false;

    const sync = () => {
      if (isInView && !document.hidden) {
        video.play().catch(() => setIsPlaying(false));
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting;
      sync();
    });
    observer.observe(video);
    document.addEventListener('visibilitychange', sync);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [canPlayVideo]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${posterSrc})` }}
      />
      {canPlayVideo && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          disablePictureInPicture
          preload="auto"
          poster={posterSrc}
          onPlaying={() => setIsPlaying(true)}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-700',
            isPlaying ? 'opacity-100' : 'opacity-0',
          )}
        >
          <source src={webmSrc} type="video/webm" />
          <source src={mp4Src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

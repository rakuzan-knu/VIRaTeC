import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { cn } from '@/shared/lib';
import posterSrc from '../assets/hero-background.webp';
import av1Src from '../assets/hero-background.av1.mp4';
import webmSrc from '../assets/hero-background.webm';
import mp4Src from '../assets/hero-background.mp4';

const VIDEO_MEDIA_QUERY = '(min-width: 1024px)';

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

function whenPageSettled(callback: () => void): () => void {
  let cancelIdle = () => {};

  const scheduleIdle = () => {
    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(callback, { timeout: 2000 });
      cancelIdle = () => window.cancelIdleCallback(idleId);
    } else {
      const timeoutId = window.setTimeout(callback, 200);
      cancelIdle = () => window.clearTimeout(timeoutId);
    }
  };

  if (document.readyState === 'complete') {
    scheduleIdle();
  } else {
    window.addEventListener('load', scheduleIdle, { once: true });
  }

  return () => {
    window.removeEventListener('load', scheduleIdle);
    cancelIdle();
  };
}

export function HeroBackgroundVideo() {
  const canPlayVideo = useSyncExternalStore(
    subscribeToMediaQuery,
    getCanPlayVideo,
    getServerCanPlayVideo,
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPageSettled, setIsPageSettled] = useState(false);
  const shouldRenderVideo = canPlayVideo && isPageSettled;

  useEffect(() => {
    if (!canPlayVideo) return;
    return whenPageSettled(() => setIsPageSettled(true));
  }, [canPlayVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!shouldRenderVideo || !video) return;

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
  }, [shouldRenderVideo]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${posterSrc})` }}
      />
      {shouldRenderVideo && (
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
          <source src={av1Src} type='video/mp4; codecs="av01.0.05M.08"' />
          <source src={webmSrc} type="video/webm" />
          <source src={mp4Src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

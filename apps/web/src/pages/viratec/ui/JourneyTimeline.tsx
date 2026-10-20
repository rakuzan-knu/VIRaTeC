import { useEffect, useRef, type RefObject } from 'react';
import { cn } from '@/shared/lib';
import dotIcon from '@/shared/assets/icons/timeline-dot.svg';
import upcomingDotIcon from '@/shared/assets/icons/timeline-dot-upcoming.svg';
import type { Milestone } from '../model/content';

interface JourneyTimelineProps {
  milestones: Milestone[];
}

function useScrollProgress(
  trackRef: RefObject<HTMLElement | null>,
  barRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const track = trackRef.current;
    const bar = barRef.current;
    if (!track || !bar) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const anchor = window.innerHeight * 0.6;
      const progress = Math.min(Math.max((anchor - rect.top) / rect.height, 0), 1);
      bar.style.transform = `scaleY(${progress})`;
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);
        requestUpdate();
      } else {
        window.removeEventListener('scroll', requestUpdate);
        window.removeEventListener('resize', requestUpdate);
      }
    });

    observer.observe(track);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [trackRef, barRef]);
}

export function JourneyTimeline({ milestones }: JourneyTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useScrollProgress(trackRef, barRef);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        aria-hidden="true"
        className="absolute top-6 bottom-6 left-[9px] w-0.5 lg:top-[91px] lg:bottom-[91px] lg:left-1/2 lg:-translate-x-1/2"
      >
        <span className="absolute inset-0 bg-white/15" />
        <span
          ref={barRef}
          className="absolute inset-0 origin-top [transform:scaleY(0)] bg-linear-to-b from-[rgba(181,250,102,0.2)] to-[#b5fa66] will-change-transform"
        />
      </div>

      <ol className="flex flex-col gap-4 lg:gap-0">
        {milestones.map((milestone, index) => {
          const isLeft = index % 2 === 1;
          const isLast = index === milestones.length - 1;

          return (
            <li
              key={milestone.date}
              className={cn(
                'relative pl-10 lg:grid lg:grid-cols-[1fr_80px_1fr] lg:items-center lg:pl-0',
                !isLast && 'lg:-mb-[60px]',
              )}
            >
              <img
                src={milestone.isUpcoming ? upcomingDotIcon : dotIcon}
                alt=""
                className="absolute top-7 -left-[30px] lg:static lg:col-start-2 lg:row-start-1"
              />
              <article
                className={cn(
                  'flex flex-col gap-2.5 rounded-[22px] border bg-white/5 p-5 lg:row-start-1 lg:w-full lg:max-w-[560px] lg:p-7',
                  milestone.isUpcoming ? 'border-dashed border-white/20' : 'border-white/12',
                  isLeft ? 'lg:col-start-1 lg:justify-self-end' : 'lg:col-start-3',
                )}
              >
                <p className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'text-[22px] leading-7 font-medium uppercase lg:text-[26px] lg:leading-8',
                      milestone.isUpcoming ? 'text-viratec-soft' : 'text-[#b5fa66]',
                    )}
                  >
                    {milestone.date}
                  </span>
                  {milestone.isUpcoming && (
                    <span className="text-[13px] leading-[18px] text-viratec-subtle">Upcoming</span>
                  )}
                </p>
                <h3 className="text-lg leading-[24px] font-medium text-white lg:text-xl lg:leading-[26px]">
                  {milestone.title}
                </h3>
                <p className="text-[15px] leading-[23px] text-viratec-muted">
                  {milestone.description}
                </p>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

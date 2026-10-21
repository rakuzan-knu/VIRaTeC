import { useLayoutEffect, useRef } from 'react';

interface CountUpProps {
  value: string;
  durationMs?: number;
}

const NUMERIC_VALUE = /^(\D*)(\d+)(\D*)$/;

const easeOutExpo = (progress: number) => (progress === 1 ? 1 : 1 - 2 ** (-10 * progress));

export function CountUp({ value, durationMs = 1600 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    const match = NUMERIC_VALUE.exec(value);
    if (!element || !match || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const [, prefix = '', digits = '0', suffix = ''] = match;
    const target = Number(digits);
    const render = (current: number) => {
      element.textContent = `${prefix}${current}${suffix}`;
    };

    let frameId = 0;
    render(0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / durationMs);
          render(Math.round(target * easeOutExpo(progress)));
          if (progress < 1) frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
      element.textContent = value;
    };
  }, [value, durationMs]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}

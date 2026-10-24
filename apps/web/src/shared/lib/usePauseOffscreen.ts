import { useEffect, type RefObject } from 'react';

export function usePauseOffscreen(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      element.toggleAttribute('data-offscreen', !(entry?.isIntersecting ?? false));
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      element.removeAttribute('data-offscreen');
    };
  }, [ref]);
}

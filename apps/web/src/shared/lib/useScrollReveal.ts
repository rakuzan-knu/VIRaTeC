import { useLayoutEffect, type RefObject } from 'react';

const ITEM_SELECTOR = 'ul > li, ol > li';
const BLOCK_SELECTOR = 'section > div > *';
const STAGGER_MS = 70;
const MAX_STAGGER_STEPS = 6;

function isOptedOut(element: Element): boolean {
  return element.closest('[data-reveal="off"]') !== null;
}

function collectTargets(root: HTMLElement): HTMLElement[] {
  const items = Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
    (item) => !item.parentElement?.closest('li'),
  );
  const blocks = Array.from(root.querySelectorAll<HTMLElement>(BLOCK_SELECTOR)).filter(
    (block) => !block.closest('li') && !items.some((item) => block.contains(item)),
  );

  return [...blocks, ...items].filter((element) => !element.dataset.reveal && !isOptedOut(element));
}

export function useScrollReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const settle = (element: HTMLElement) => {
      const running = element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.timeline === document.timeline)
        .map((animation) => animation.finished);

      void Promise.allSettled(running).then(() => {
        if (element.dataset.reveal !== 'visible') return;
        element.dataset.reveal = 'done';
        element.style.removeProperty('--reveal-delay');
      });
    };

    const intersection = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) =>
            a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
          );

        visible.forEach((element, index) => {
          const step = Math.min(index, MAX_STAGGER_STEPS);
          element.style.setProperty('--reveal-delay', `${step * STAGGER_MS}ms`);
          element.dataset.reveal = 'visible';
          intersection.unobserve(element);
          requestAnimationFrame(() => settle(element));
        });
      },
      { rootMargin: '0px 0px -8% 0px' },
    );

    const scan = () => {
      for (const element of collectTargets(root)) {
        element.dataset.reveal = 'pending';
        intersection.observe(element);
      }
    };

    const mutation = new MutationObserver(scan);

    scan();
    mutation.observe(root, { childList: true, subtree: true });

    return () => {
      mutation.disconnect();
      intersection.disconnect();
      root.querySelectorAll<HTMLElement>('[data-reveal="pending"]').forEach((element) => {
        delete element.dataset.reveal;
      });
    };
  }, [rootRef]);
}

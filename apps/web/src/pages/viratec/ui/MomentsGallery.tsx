import { cn } from '@/shared/lib';
import { ResponsiveImage } from '@/shared/ui/responsive-image';
import type { MomentItem } from '../model/content';

interface MomentsGalleryProps {
  moments: MomentItem[];
}

export function MomentsGallery({ moments }: MomentsGalleryProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {moments.map((moment, index) => (
        <li
          key={moment.image}
          className={cn(
            'relative overflow-hidden rounded-[18px] ring-1 ring-white/8 lg:rounded-[22px]',
            index === 0 ? 'col-span-2 aspect-[4/3] lg:row-span-2 lg:aspect-auto' : 'aspect-[4/3]',
          )}
        >
          <figure className="reveal-frame size-full">
            <ResponsiveImage
              src={moment.image}
              sizes={
                index === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'
              }
              alt={moment.caption}
              loading="lazy"
              decoding="async"
              className="reveal-media size-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-viratec-bg/90 to-transparent px-3 pt-8 pb-3 text-xs leading-4 text-white/90 lg:px-4 lg:pb-4 lg:text-sm lg:leading-5">
              {moment.caption}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

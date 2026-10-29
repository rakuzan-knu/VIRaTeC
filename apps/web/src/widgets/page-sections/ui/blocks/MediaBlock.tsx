import { cn } from '@/shared/lib';
import { PageSection } from '@/shared/ui/page-section';
import { ResponsiveImage } from '@/shared/ui/responsive-image';
import { SectionHeader } from '@/shared/ui/section-header';
import { Paragraphs } from './Paragraphs';
import type { BlockProps } from './types';

const MEDIA_IMAGE_SIZES = '(min-width: 1024px) 620px, 100vw';

export function MediaBlock({ block, headingId }: BlockProps<'media'>) {
  return (
    <PageSection aria-labelledby={headingId}>
      <div
        className={cn(
          'grid items-center gap-8 lg:grid-cols-2 lg:gap-16',
          block.imageSide === 'right' && 'lg:[&>*:first-child]:order-2',
        )}
      >
        {block.image ? (
          <span className="reveal-frame block overflow-hidden rounded-[28px] lg:rounded-[36px]">
            <ResponsiveImage
              src={block.image}
              sizes={MEDIA_IMAGE_SIZES}
              alt={block.imageAlt}
              loading="lazy"
              decoding="async"
              className="reveal-media aspect-[4/3] w-full object-cover"
            />
          </span>
        ) : (
          <span aria-hidden="true" className="hidden lg:block" />
        )}
        <div className="flex min-w-0 flex-col gap-6">
          <SectionHeader id={headingId} eyebrow={block.eyebrow} title={block.title} />
          <div className="flex flex-col gap-5 text-base leading-[27px] text-viratec-soft lg:text-lg lg:leading-[30px]">
            <Paragraphs text={block.body} />
          </div>
        </div>
      </div>
    </PageSection>
  );
}

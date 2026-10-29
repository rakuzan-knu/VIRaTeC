import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import { Paragraphs } from './Paragraphs';
import type { BlockProps } from './types';

export function TextBlock({ block, headingId }: BlockProps<'text'>) {
  return (
    <PageSection aria-labelledby={headingId}>
      <SectionHeader id={headingId} eyebrow={block.eyebrow} title={block.title} />
      <div className="flex max-w-[72ch] flex-col gap-5 text-base leading-[27px] text-viratec-soft lg:ml-[276px] lg:text-lg lg:leading-[30px]">
        <Paragraphs text={block.body} />
      </div>
    </PageSection>
  );
}

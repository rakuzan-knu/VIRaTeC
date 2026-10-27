import { InfoCard } from '@/shared/ui/info-card';
import { PageSection } from '@/shared/ui/page-section';
import { SectionHeader } from '@/shared/ui/section-header';
import type { BlockProps } from './types';

export function CardsBlock({ block, headingId }: BlockProps<'cards'>) {
  return (
    <PageSection aria-labelledby={headingId}>
      <SectionHeader
        id={headingId}
        eyebrow={block.eyebrow}
        title={block.title}
        description={block.description}
      />
      {block.items.length > 0 && (
        <ul className="grid gap-6 lg:grid-cols-3">
          {block.items.map((item, index) => (
            <li key={index}>
              <InfoCard
                image={item.image}
                meta={item.meta}
                title={item.title}
                description={item.description}
                linkLabel={item.linkLabel}
                to={item.to}
              />
            </li>
          ))}
        </ul>
      )}
    </PageSection>
  );
}

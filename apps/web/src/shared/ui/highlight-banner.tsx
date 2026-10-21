import { ExpandableText } from './expandable-text';

export interface HighlightStat {
  value: string;
  label: string;
}

interface HighlightBannerProps {
  title: string;
  description: string;
  stats: HighlightStat[];
}

export function HighlightBanner({ title, description, stats }: HighlightBannerProps) {
  return (
    <div className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-viratec-deep px-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:rounded-[36px] lg:px-14 lg:py-14">
      <div className="flex flex-col gap-3.5 lg:max-w-[680px]">
        <h2 className="font-display text-[28px] leading-[34px] font-medium tracking-[-0.025em] text-white lg:text-[40px] lg:leading-[46px]">
          {title}
        </h2>
        <ExpandableText className="text-[15px] leading-[23px] text-viratec-soft lg:text-lg lg:leading-7">
          {description}
        </ExpandableText>
      </div>
      <ul className="flex gap-10 border-t border-white/10 pt-6 lg:shrink-0 lg:gap-14 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
        {stats.map((stat) => (
          <li key={stat.label} className="flex flex-col gap-0.5">
            <span className="font-display text-[40px] leading-[44px] font-medium tracking-[-0.03em] text-viratec-accent tabular-nums lg:text-[56px] lg:leading-[60px]">
              {stat.value}
            </span>
            <span className="text-[13px] text-viratec-muted lg:text-[15px]">{stat.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

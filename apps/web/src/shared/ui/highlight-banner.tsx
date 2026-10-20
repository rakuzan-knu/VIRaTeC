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
    <div className="flex flex-col gap-3.5 rounded-[22px] bg-[linear-gradient(146.23deg,#0b3f8a_0%,#138a8a_71.43%)] px-[22px] py-[26px] lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:rounded-[28px] lg:bg-[linear-gradient(168deg,#0b3f8a_0%,#138a8a_71.43%)] lg:px-12 lg:py-11">
      <div className="flex flex-col gap-3.5 lg:max-w-[680px]">
        <h2 className="text-[26px] leading-8 tracking-[-0.52px] text-white lg:text-[34px] lg:leading-[42px] lg:tracking-[-0.68px]">
          {title}
        </h2>
        <ExpandableText className="text-[15px] leading-[23px] text-viratec-soft lg:text-lg lg:leading-7">
          {description}
        </ExpandableText>
      </div>
      <ul className="flex gap-8 pt-1.5 lg:shrink-0 lg:gap-14 lg:pt-0">
        {stats.map((stat) => (
          <li key={stat.label} className="flex flex-col gap-0.5">
            <span className="text-[34px] leading-10 text-viratec-accent lg:text-[44px] lg:leading-[50px]">
              {stat.value}
            </span>
            <span className="text-[13px] text-viratec-soft lg:text-[15px]">{stat.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useCommonMessages } from '@/shared/i18n';

interface PersonCardProps {
  name: string;
  role: string;
  photo?: string;
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function PersonCard({ name, role, photo }: PersonCardProps) {
  const common = useCommonMessages();
  const placeholderLabel = common.unavailable(common.photo);

  return (
    <article className="atlas-card flex h-full items-center gap-4 rounded-[28px] border border-transparent p-4 lg:flex-col lg:items-stretch lg:gap-5 lg:p-3 lg:pb-6">
      {photo ? (
        <img
          src={photo}
          alt=""
          width={320}
          height={400}
          loading="lazy"
          className="size-16 shrink-0 rounded-[18px] object-cover lg:aspect-[4/5] lg:size-auto lg:w-full lg:rounded-[22px]"
        />
      ) : (
        <span
          role="img"
          aria-label={placeholderLabel}
          title={placeholderLabel}
          className="flex size-16 shrink-0 items-center justify-center rounded-[18px] bg-[radial-gradient(120%_120%_at_85%_10%,rgba(3,197,234,0.3)_0%,transparent_55%),linear-gradient(140deg,#0b2f6b_0%,#061a39_60%,#03122e_100%)] font-display text-xl font-medium tracking-[-0.03em] text-white/85 lg:aspect-[4/5] lg:size-auto lg:w-full lg:rounded-[22px] lg:text-[56px]"
        >
          {getInitials(name)}
        </span>
      )}
      <div className="flex flex-col gap-1 lg:px-3">
        <h3 className="font-display text-lg font-medium tracking-[-0.015em] text-white lg:text-[22px] lg:leading-7">
          {name}
        </h3>
        <p className="text-sm leading-5 text-viratec-muted lg:text-[15px] lg:leading-[22px]">
          {role}
        </p>
      </div>
    </article>
  );
}

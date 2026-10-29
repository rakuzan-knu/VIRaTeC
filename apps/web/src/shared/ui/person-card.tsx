import { useCommonMessages } from '@/shared/i18n';
import { ResponsiveImage } from './responsive-image';

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

const PORTRAIT_ASPECT = 4 / 5;

export function PersonCard({ name, role, photo }: PersonCardProps) {
  const common = useCommonMessages();
  const placeholderLabel = common.unavailable(common.photo);

  return (
    <article className="atlas-card flex h-full items-center gap-4 rounded-[28px] border border-transparent p-4 lg:flex-col lg:items-stretch lg:gap-5 lg:p-3 lg:pb-6">
      {photo ? (
        <ResponsiveImage
          src={photo}
          sizes="(min-width: 1024px) 320px, 64px"
          faceCrop={PORTRAIT_ASPECT}
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
          className="flex size-16 shrink-0 items-center justify-center rounded-[18px] person-card-fill font-display text-xl font-medium tracking-[-0.03em] text-white/85 lg:aspect-[4/5] lg:size-auto lg:w-full lg:rounded-[22px] lg:text-[56px]"
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

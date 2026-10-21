import { NOT_AVAILABLE_YET } from '@/shared/config/navigation';

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
  return (
    <article className="flex h-full items-center gap-4 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 lg:flex-col lg:items-start lg:gap-5 lg:p-7">
      {photo ? (
        <img
          src={photo}
          alt=""
          width={80}
          height={80}
          loading="lazy"
          className="size-14 shrink-0 rounded-full object-cover ring-1 ring-white/12 lg:size-24"
        />
      ) : (
        <span
          role="img"
          aria-label={`Photo: ${NOT_AVAILABLE_YET}`}
          title={`Photo: ${NOT_AVAILABLE_YET}`}
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-viratec-deep font-display text-lg font-medium text-viratec-accent ring-1 ring-white/12 lg:size-24 lg:text-2xl"
        >
          {getInitials(name)}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-lg font-medium tracking-[-0.015em] text-white lg:text-xl">
          {name}
        </h3>
        <p className="text-sm leading-5 text-viratec-muted">{role}</p>
      </div>
    </article>
  );
}

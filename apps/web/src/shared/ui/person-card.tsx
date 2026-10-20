import avatarPlaceholder from '@/shared/assets/people/avatar-placeholder.svg';

interface PersonCardProps {
  name: string;
  role: string;
  photo?: string;
}

export function PersonCard({ name, role, photo }: PersonCardProps) {
  return (
    <article className="flex h-full items-center gap-3.5 rounded-[22px] border border-white/12 bg-white/5 p-5 lg:flex-col lg:items-start lg:p-7">
      <img
        src={photo ?? avatarPlaceholder}
        alt={photo ? name : ''}
        width={80}
        height={80}
        loading="lazy"
        className="size-14 shrink-0 rounded-full object-cover lg:size-20"
      />
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-medium text-white lg:text-xl">{name}</h3>
        <p className="text-sm leading-5 text-viratec-muted">{role}</p>
      </div>
    </article>
  );
}

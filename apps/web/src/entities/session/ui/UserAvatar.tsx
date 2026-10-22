import { useState } from 'react';
import { resolveApiUrl } from '@/shared/api/apiClient';
import { cn } from '@/shared/lib';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export function UserAvatar({ name, avatarUrl, className }: UserAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(avatarUrl) && failedUrl !== avatarUrl;

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-viratec-lime to-viratec-cyan text-sm font-semibold text-viratec-ink select-none',
        className,
      )}
    >
      {showImage && avatarUrl ? (
        <img
          src={resolveApiUrl(avatarUrl)}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(avatarUrl)}
          className="size-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}

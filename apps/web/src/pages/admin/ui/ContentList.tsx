import type { RecordResource } from '@viratec/contracts';
import { useLocale } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { recordLabel } from '@/widgets/site-editor';
import type { ContentItemStatus, ContentListItem } from '../api/adminApi';
import { useAdminMessages } from '../model/messages';
import { Badge } from './Badge';

const STATUS_TONES: Record<ContentItemStatus, 'lime' | 'cyan' | 'muted' | 'error'> = {
  published: 'muted',
  draft: 'cyan',
  new: 'lime',
  deleted: 'error',
};

export function ContentList({
  resource,
  items,
  query,
  selectedKey,
  onSelect,
}: {
  resource: RecordResource;
  items: ContentListItem[];
  query: string;
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) {
  const t = useAdminMessages();
  const locale = useLocale();

  if (items.length === 0) {
    return <p className="px-5 py-8 text-center text-viratec-muted">{t.content.empty}</p>;
  }

  const needle = query.trim().toLowerCase();
  const matches = needle
    ? items.filter((item) =>
        `${recordLabel(resource, item.data, locale)} ${item.key}`.toLowerCase().includes(needle),
      )
    : items;

  if (matches.length === 0) {
    return (
      <p role="status" className="px-5 py-8 text-center break-words text-viratec-muted">
        {t.content.noMatches(query.trim())}
      </p>
    );
  }

  return (
    <ul aria-label={t.content.listLabel(t.content.tabs[resource])} className="flex flex-col">
      {matches.map((item) => {
        const isSelected = item.key === selectedKey;
        return (
          <li key={item.key} className="border-b border-white/6 last:border-0">
            <button
              type="button"
              aria-current={isSelected ? 'true' : undefined}
              onClick={() => onSelect(item.key)}
              className={cn(
                'flex w-full cursor-pointer items-start justify-between gap-3 px-5 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-viratec-lime motion-reduce:transition-none',
                isSelected ? 'bg-white/10' : 'hover:bg-white/5',
              )}
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[15px] break-words text-white">
                  {recordLabel(resource, item.data, locale)}
                </span>
                {resource === 'publication' && (
                  <span className="font-mono text-xs break-all text-viratec-subtle">
                    {item.key}
                  </span>
                )}
              </span>
              <Badge tone={STATUS_TONES[item.status]}>{t.content.status[item.status]}</Badge>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

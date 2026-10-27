import { useOutletContext, useSearchParams } from 'react-router-dom';
import { isRecordResource, type RecordResource } from '@viratec/contracts';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui/Button';
import { canEditRecords } from '@/widgets/site-editor';
import type { AdminCapabilities } from '../api/adminApi';
import { useAdminMessages } from '../model/messages';
import { useContentList } from '../model/queries';
import { ADMIN_CARD_CLASS, AdminSectionHeader } from './AdminLayout';
import { AddContentButton } from './AddContentButton';
import { ContentList } from './ContentList';
import { ContentRecordForm } from './ContentRecordForm';

const TABS: readonly RecordResource[] = ['publication', 'event', 'project'];

const PANE_CLASS =
  'lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8.5rem)] lg:overflow-y-auto lg:overscroll-contain';

const TAB_CLASS =
  'rounded-full px-4 py-2 text-[15px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-viratec-lime motion-reduce:transition-none';

export function AdminContentPage() {
  const t = useAdminMessages();
  const capabilities = useOutletContext<AdminCapabilities>();
  const [params, setParams] = useSearchParams();
  const type = params.get('type');
  const resource: RecordResource = isRecordResource(type) ? type : 'publication';
  const selectedKey = params.get('key');
  const list = useContentList(resource);
  const canCreate = canEditRecords(capabilities.permissions, resource);

  const open = (next: RecordResource, key: string | null) =>
    setParams(key ? { type: next, key } : { type: next }, { preventScrollReset: true });

  return (
    <>
      <AdminSectionHeader
        title={t.content.title}
        subtitle={t.content.subtitle}
        aside={
          canCreate ? (
            <AddContentButton resource={resource} onCreated={(key) => open(resource, key)} />
          ) : undefined
        }
      />

      <div
        role="group"
        aria-label={t.content.tabsLabel}
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0"
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            aria-pressed={tab === resource}
            onClick={() => open(tab, null)}
            className={cn(
              TAB_CLASS,
              tab === resource
                ? 'bg-white text-viratec-ink'
                : 'border border-white/14 bg-white/4 text-white hover:bg-white/10',
            )}
          >
            {t.content.tabs[tab]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start">
        <div className={cn(ADMIN_CARD_CLASS, PANE_CLASS, 'overflow-hidden p-0 lg:p-0')}>
          {list.isPending && (
            <p role="status" className="px-5 py-8 text-center text-viratec-muted">
              {t.content.loading}
            </p>
          )}
          {list.isError && (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 px-5 py-8 text-viratec-muted"
            >
              {t.content.loadFailed}
              <Button
                label={t.content.retry}
                variant="secondary"
                onClick={() => void list.refetch()}
              />
            </div>
          )}
          {list.data && (
            <ContentList
              resource={resource}
              items={list.data}
              selectedKey={selectedKey}
              onSelect={(key) => open(resource, key)}
            />
          )}
        </div>

        <section
          key={`${resource}:${selectedKey ?? ''}`}
          aria-label={t.content.title}
          className={cn(ADMIN_CARD_CLASS, PANE_CLASS)}
        >
          {selectedKey ? (
            <ContentRecordForm
              resource={resource}
              recordKey={selectedKey}
              permissions={capabilities.permissions}
              onClosed={() => open(resource, null)}
            />
          ) : (
            <p className="py-8 text-center text-viratec-muted">{t.content.pick}</p>
          )}
        </section>
      </div>
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { isRecordResource, type RecordResource } from '@viratec/contracts';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
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

const NARROW_QUERY = '(max-width: 1023px)';

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
  const [query, setQuery] = useState('');
  const formRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selectedKey && window.matchMedia(NARROW_QUERY).matches) {
      formRef.current?.scrollIntoView({ block: 'start' });
    }
  }, [selectedKey]);

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
            onClick={() => {
              setQuery('');
              open(tab, null);
            }}
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
          {list.data && list.data.length > 0 && (
            <div className="border-b border-white/6 p-4">
              <Input
                type="search"
                label={t.content.search}
                helperText={t.content.searchHelp}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          )}
          {list.data && (
            <ContentList
              resource={resource}
              items={list.data}
              query={query}
              selectedKey={selectedKey}
              onSelect={(key) => open(resource, key)}
            />
          )}
        </div>

        <section
          ref={formRef}
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
            <div className="flex flex-col gap-4 py-4">
              <p className="text-viratec-muted">{t.content.pick}</p>
              <section aria-label={t.content.howToLabel}>
                <ol className="flex list-none flex-col gap-3">
                  {t.content.howTo.map((step, index) => (
                    <li key={step} className="flex gap-3 text-[15px] leading-6 text-viratec-soft">
                      <span
                        aria-hidden="true"
                        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-viratec-cyan/15 text-[13px] font-medium text-viratec-cyan"
                      >
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

import { ROUTES } from '@/shared/config/routes';
import { PAGE_LABELS, isLayoutPage } from '@/shared/config/pageLayout';
import { useLocale } from '@/shared/i18n';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { allowedValues, findField, linkId, withFieldValue } from '../model/contentModel';
import type { SiteEditorMessages } from '../model/messages';
import { useEditorEntry } from '../model/queries';
import { useSiteEditorStore } from '../model/store';

const LINK_TYPE_ID = 'link';

const LINK_FIELDS: Record<string, { label: string; link: string }> = {
  card: { label: 'linkLabel', link: 'link' },
  pageBlock: { label: 'actionLabel', link: 'link' },
};

export const linkFieldFor = (contentTypeId: string, fieldId: string) => {
  const mapping = LINK_FIELDS[contentTypeId];
  return mapping && mapping.label === fieldId ? mapping.link : null;
};

const isRouteKey = (value: string): value is keyof typeof ROUTES => value in ROUTES;

interface InlineLinkTargetProps {
  entryId: string;
  linkFieldId: string;
  t: SiteEditorMessages;
}

export function InlineLinkTarget({ entryId, linkFieldId, t }: InlineLinkTargetProps) {
  const locale = useLocale();
  const parent = useEditorEntry(entryId);
  const parentDraft = useSiteEditorStore((state) => state.drafts[entryId]);
  const parentFields = parentDraft?.fields ?? parent.data?.fields;
  const linkedId = parent.data
    ? linkId(parentFields?.[linkFieldId]?.[parent.data.locales.en])
    : null;
  const link = useEditorEntry(linkedId ?? null);
  const linkDraft = useSiteEditorStore((state) => (linkedId ? state.drafts[linkedId] : undefined));

  if (!parent.data) return null;
  if (!linkedId || !link.data) {
    return linkedId ? null : <p className="text-[13px] text-text-muted">{t.inline.linkMissing}</p>;
  }

  const loaded = link.data;
  const fields = linkDraft?.fields ?? loaded.fields;
  const code = loaded.locales.en;
  const route = fields.route?.[code];
  const url = fields.url?.[code];
  const routeField = findField(LINK_TYPE_ID, 'route');
  const routes = (routeField && allowedValues(routeField)) || [];

  const write = (fieldId: 'route' | 'url', value: string) => {
    const current = useSiteEditorStore.getState().drafts[loaded.id];
    const base = current?.fields ?? loaded.fields;
    const other = fieldId === 'route' ? 'url' : 'route';
    const cleared = value ? withFieldValue(base, other, code, undefined) : base;
    useSiteEditorStore.getState().setDraft(loaded.id, {
      version: current?.version ?? loaded.version,
      base: current?.base ?? loaded.fields,
      fields: withFieldValue(cleared, fieldId, code, value || undefined),
    });
  };

  const routeLabel = (key: string) =>
    isLayoutPage(key) ? PAGE_LABELS[key][locale] : isRouteKey(key) ? ROUTES[key] : key;

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-[13px] font-medium text-text-primary">
        {t.inline.linkTarget}
      </legend>
      <Select
        label={t.inline.linkPage}
        value={typeof route === 'string' ? route : ''}
        placeholder={t.inline.linkNone}
        options={routes.map((key) => ({ value: key, label: routeLabel(key) }))}
        onChange={(event) => write('route', event.target.value)}
      />
      <Input
        label={t.inline.linkUrl}
        type="url"
        inputMode="url"
        value={typeof url === 'string' ? url : ''}
        placeholder="https://"
        onChange={(event) => write('url', event.target.value.trim())}
      />
    </fieldset>
  );
}

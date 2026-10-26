import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import {
  SECTION_ROUTE_KEYS,
  type CustomSectionItem,
  type SectionRouteKey,
} from '@/shared/config/pageLayout';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { moveItem } from '../model/layoutModel';
import type { SiteEditorMessages } from '../model/messages';
import { IconButton } from './IconButton';
import { LocalizedInput } from './LocalizedInput';
import { SectionImageField } from './SectionImageField';

const EXTERNAL = 'external';

const isRouteKey = (value: string): value is SectionRouteKey =>
  SECTION_ROUTE_KEYS.some((key) => key === value);

const ADD_ITEM_CLASS =
  'inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-dashed border-white/20 px-3 py-2 text-[14px] text-text-primary transition-colors hover:border-viratec-cyan/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none';

const ITEM_CLASS = 'flex min-w-0 flex-col gap-3 rounded-xl border border-white/8 bg-white/3 p-3';

function ItemControls({
  index,
  count,
  readOnly,
  t,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  readOnly: boolean;
  t: SiteEditorMessages;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  const labels = t.structure;
  return (
    <div className="flex items-center gap-1">
      <span className="flex-1 text-[13px] font-medium text-text-muted">
        {labels.item(index + 1)}
      </span>
      {!readOnly && (
        <>
          <IconButton
            size="sm"
            icon={ArrowUp}
            label={labels.moveItemUp(index + 1)}
            disabled={index === 0}
            onClick={() => onMove(index - 1)}
          />
          <IconButton
            size="sm"
            icon={ArrowDown}
            label={labels.moveItemDown(index + 1)}
            disabled={index === count - 1}
            onClick={() => onMove(index + 1)}
          />
          <IconButton size="sm" icon={X} label={labels.removeItem(index + 1)} onClick={onRemove} />
        </>
      )}
    </div>
  );
}

interface SectionEditorProps {
  section: CustomSectionItem;
  readOnly: boolean;
  t: SiteEditorMessages;
  onChange: (section: CustomSectionItem) => void;
}

export function SectionEditor({ section, readOnly, t, onChange }: SectionEditorProps) {
  const labels = t.structure;
  const routeOptions = SECTION_ROUTE_KEYS.map((key) => ({ value: key, label: key }));
  const typeHelp = (
    <p className="rounded-xl bg-white/5 px-3 py-2 text-caption text-text-muted">
      {labels.typeHelp[section.type]}
    </p>
  );

  if (section.type === 'text' || section.type === 'media') {
    return (
      <div className="flex min-w-0 flex-col gap-4">
        {typeHelp}
        {section.type === 'media' && (
          <>
            <SectionImageField
              value={section.image}
              readOnly={readOnly}
              t={t}
              onChange={(image) => onChange({ ...section, image })}
            />
            <Select
              label={labels.imageSide}
              value={section.imageSide}
              disabled={readOnly}
              options={(['left', 'right'] as const).map((side) => ({
                value: side,
                label: labels.sides[side],
              }))}
              onChange={(event) =>
                onChange({
                  ...section,
                  imageSide: event.target.value === 'right' ? 'right' : 'left',
                })
              }
            />
          </>
        )}
        <LocalizedInput
          label={labels.eyebrow}
          value={section.eyebrow}
          readOnly={readOnly}
          t={t}
          onChange={(eyebrow) => onChange({ ...section, eyebrow })}
        />
        <LocalizedInput
          label={labels.sectionTitle}
          value={section.title}
          readOnly={readOnly}
          t={t}
          onChange={(title) => onChange({ ...section, title })}
        />
        <LocalizedInput
          label={labels.body}
          value={section.body}
          multiline
          helperText={labels.bodyHelp}
          readOnly={readOnly}
          t={t}
          onChange={(body) => onChange({ ...section, body })}
        />
      </div>
    );
  }

  if (section.type === 'cta') {
    const isExternal = !isRouteKey(section.link);
    return (
      <div className="flex min-w-0 flex-col gap-4">
        {typeHelp}
        <LocalizedInput
          label={labels.sectionTitle}
          value={section.title}
          readOnly={readOnly}
          t={t}
          onChange={(title) => onChange({ ...section, title })}
        />
        <LocalizedInput
          label={labels.description}
          value={section.description}
          multiline
          readOnly={readOnly}
          t={t}
          onChange={(description) => onChange({ ...section, description })}
        />
        <LocalizedInput
          label={labels.actionLabel}
          value={section.actionLabel}
          readOnly={readOnly}
          t={t}
          onChange={(actionLabel) => onChange({ ...section, actionLabel })}
        />
        <Select
          label={labels.link}
          value={isExternal ? EXTERNAL : section.link}
          disabled={readOnly}
          options={[...routeOptions, { value: EXTERNAL, label: labels.external }]}
          onChange={(event) =>
            onChange({
              ...section,
              link: event.target.value === EXTERNAL ? 'https://' : event.target.value,
            })
          }
        />
        {isExternal && (
          <Input
            label={labels.externalUrl}
            helperText={labels.externalHelp}
            type="url"
            inputMode="url"
            value={section.link}
            readOnly={readOnly}
            maxLength={2048}
            onChange={(event) => onChange({ ...section, link: event.target.value.trim() })}
          />
        )}
      </div>
    );
  }

  if (section.type === 'stats') {
    return (
      <div className="flex min-w-0 flex-col gap-4">
        {typeHelp}
        <LocalizedInput
          label={labels.sectionTitle}
          value={section.title}
          readOnly={readOnly}
          t={t}
          onChange={(title) => onChange({ ...section, title })}
        />
        <LocalizedInput
          label={labels.description}
          value={section.description}
          multiline
          readOnly={readOnly}
          t={t}
          onChange={(description) => onChange({ ...section, description })}
        />
        <fieldset className="flex min-w-0 flex-col gap-3">
          <legend className="mb-1 text-label font-medium text-text-primary">{labels.items}</legend>
          {section.items.map((item, index) => {
            const update = (patch: Partial<typeof item>) =>
              onChange({
                ...section,
                items: section.items.map((current, position) =>
                  position === index ? { ...current, ...patch } : current,
                ),
              });
            return (
              <div key={index} className={ITEM_CLASS}>
                <ItemControls
                  index={index}
                  count={section.items.length}
                  readOnly={readOnly}
                  t={t}
                  onMove={(to) =>
                    onChange({ ...section, items: moveItem(section.items, index, to) })
                  }
                  onRemove={() =>
                    onChange({
                      ...section,
                      items: section.items.filter((_, position) => position !== index),
                    })
                  }
                />
                <Input
                  label={labels.value}
                  helperText={labels.valueHelp}
                  value={item.value}
                  readOnly={readOnly}
                  maxLength={24}
                  onChange={(event) => update({ value: event.target.value })}
                />
                <LocalizedInput
                  label={labels.label}
                  value={item.label}
                  readOnly={readOnly}
                  t={t}
                  onChange={(label) => update({ label })}
                />
              </div>
            );
          })}
          {!readOnly && section.items.length < 6 && (
            <button
              type="button"
              className={ADD_ITEM_CLASS}
              onClick={() =>
                onChange({
                  ...section,
                  items: [...section.items, { value: '', label: { en: '', uk: '' } }],
                })
              }
            >
              <Plus aria-hidden="true" className="size-4" />
              {labels.addItem}
            </button>
          )}
        </fieldset>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {typeHelp}
      <LocalizedInput
        label={labels.eyebrow}
        value={section.eyebrow}
        readOnly={readOnly}
        t={t}
        onChange={(eyebrow) => onChange({ ...section, eyebrow })}
      />
      <LocalizedInput
        label={labels.sectionTitle}
        value={section.title}
        readOnly={readOnly}
        t={t}
        onChange={(title) => onChange({ ...section, title })}
      />
      <LocalizedInput
        label={labels.description}
        value={section.description}
        multiline
        readOnly={readOnly}
        t={t}
        onChange={(description) => onChange({ ...section, description })}
      />
      <fieldset className="flex min-w-0 flex-col gap-3">
        <legend className="mb-1 text-label font-medium text-text-primary">{labels.items}</legend>
        {section.items.map((item, index) => {
          const update = (patch: Partial<typeof item>) =>
            onChange({
              ...section,
              items: section.items.map((current, position) =>
                position === index ? { ...current, ...patch } : current,
              ),
            });
          return (
            <div key={index} className={ITEM_CLASS}>
              <ItemControls
                index={index}
                count={section.items.length}
                readOnly={readOnly}
                t={t}
                onMove={(to) => onChange({ ...section, items: moveItem(section.items, index, to) })}
                onRemove={() =>
                  onChange({
                    ...section,
                    items: section.items.filter((_, position) => position !== index),
                  })
                }
              />
              <SectionImageField
                value={item.image}
                readOnly={readOnly}
                t={t}
                onChange={(image) => update({ image })}
              />
              <LocalizedInput
                label={labels.sectionTitle}
                value={item.title}
                readOnly={readOnly}
                t={t}
                onChange={(title) => update({ title })}
              />
              <LocalizedInput
                label={labels.description}
                value={item.description}
                multiline
                readOnly={readOnly}
                t={t}
                onChange={(description) => update({ description })}
              />
              <Select
                label={labels.link}
                value={item.link ?? ''}
                disabled={readOnly}
                placeholder={labels.noLink}
                options={routeOptions}
                onChange={(event) =>
                  update({ link: isRouteKey(event.target.value) ? event.target.value : null })
                }
              />
              {item.link && (
                <LocalizedInput
                  label={labels.linkLabel}
                  value={item.linkLabel}
                  readOnly={readOnly}
                  t={t}
                  onChange={(linkLabel) => update({ linkLabel })}
                />
              )}
            </div>
          );
        })}
        {!readOnly && section.items.length < 12 && (
          <button
            type="button"
            className={ADD_ITEM_CLASS}
            onClick={() =>
              onChange({
                ...section,
                items: [
                  ...section.items,
                  {
                    title: { en: '', uk: '' },
                    description: { en: '', uk: '' },
                    linkLabel: { en: '', uk: '' },
                    link: null,
                    image: null,
                  },
                ],
              })
            }
          >
            <Plus aria-hidden="true" className="size-4" />
            {labels.addItem}
          </button>
        )}
      </fieldset>
    </div>
  );
}

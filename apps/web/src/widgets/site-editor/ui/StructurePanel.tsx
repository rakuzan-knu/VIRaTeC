import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, LocateFixed, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminPermission } from '@viratec/contracts';
import { useSessionStore } from '@/entities/session';
import { PAGE_BLOCK_TYPE_ID } from '@/shared/config/pageBlock';
import { PAGE_BLOCKS } from '@/shared/config/pageBlocks.generated';
import {
  CUSTOM_SECTION_TYPES,
  PAGE_LABELS,
  pageSectionsSchema,
  resolveSections,
  type CustomSectionType,
  type PageSectionItem,
} from '@/shared/config/pageLayout';
import { useLocale, type Locale } from '@/shared/i18n';
import { cn, useContentPreviewStore, useLiveContent } from '@/shared/lib';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Select';
import { isConflict, useEditorErrorMessage } from '../model/errors';
import { entryCreateAction, entrySaveAction } from '../model/history';
import { LAYOUT_TYPE_ID, moveItem, newSection, sectionLabel } from '../model/layoutModel';
import type { SiteEditorMessages } from '../model/messages';
import { NO_PERMISSIONS } from '../model/permissions';
import { useCreateEntry, useEditorEntry, useSaveEntry } from '../model/queries';
import { useSiteEditorStore } from '../model/store';
import { findSectionField } from '../model/useCanvasTargets';
import { ConfirmDialog } from './ConfirmDialog';
import { IconButton } from './IconButton';
import { SHORTCUTS } from '../model/shortcuts';
import { EditorPanel, useSaveShortcut } from './EditorPanel';
import { SectionEditor } from './SectionEditor';

const scrollToSection = (sectionId: string) =>
  document.querySelector(`[data-page-section="${CSS.escape(sectionId)}"]`)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  });

const editBuiltinSection = (sectionId: string) => {
  scrollToSection(sectionId);
  const address = findSectionField(sectionId);
  if (!address) return;
  useSiteEditorStore.getState().select({
    entryId: address.entryId,
    contentTypeId: address.contentTypeId,
    fieldId: address.fieldId,
    locale: address.locale,
  });
};

const editBlock = (sectionId: string, blockId: string, locale: Locale) => {
  scrollToSection(sectionId);
  useSiteEditorStore.getState().select({
    entryId: blockId,
    contentTypeId: PAGE_BLOCK_TYPE_ID,
    fieldId: 'title',
    locale,
  });
};

export function StructurePanel({ t }: { t: SiteEditorMessages }) {
  const locale = useLocale();
  const blocks = useLiveContent(PAGE_BLOCK_TYPE_ID, 'PAGE_BLOCKS', PAGE_BLOCKS)[locale];
  const activeLayout = useContentPreviewStore((state) => state.activeLayout);
  const focus = useSiteEditorStore((state) => state.structure);
  const page = activeLayout?.page ?? null;
  const draft = useSiteEditorStore((state) => (page ? state.layoutDrafts[page] : undefined));
  const { setLayoutDraft, dropLayoutDraft, closeStructure, pushAction, announce } =
    useSiteEditorStore.getState();
  const permissions = useSessionStore((state) => state.user?.permissions ?? NO_PERMISSIONS);
  const canEdit = permissions.includes(AdminPermission.CONTENT_EDIT);

  const entry = useEditorEntry(activeLayout?.entryId ?? null);
  const save = useSaveEntry();
  const create = useCreateEntry();
  const saveError = useEditorErrorMessage(save.error ?? create.error);
  const [expanded, setExpanded] = useState<string | null>(focus?.sectionId ?? null);
  const [addType, setAddType] = useState<CustomSectionType>('text');
  const [invalid, setInvalid] = useState(false);
  const [deleting, setDeleting] = useState<PageSectionItem | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const focusedRow = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (focus?.sectionId) setExpanded(focus.sectionId);
  }, [focus?.sectionId]);

  useEffect(() => {
    focusedRow.current?.scrollIntoView({ block: 'nearest' });
  }, [expanded]);

  const localeCode = entry.data?.locales.en ?? 'en';
  const stored = pageSectionsSchema.safeParse(entry.data?.fields.sections?.[localeCode]);
  const published = page ? resolveSections(page, stored.success ? stored.data : undefined) : [];
  const sections = draft?.sections ?? published;
  const version = entry.data?.version ?? null;
  const isLoading = Boolean(activeLayout?.entryId) && entry.isPending;

  const update = (next: PageSectionItem[]) => {
    if (!page) return;
    setInvalid(false);
    setSavedAt(null);
    setLayoutDraft(page, { version: draft?.version ?? version, sections: next });
  };

  const submit = () => {
    if (!page || !draft) return;
    const parsed = pageSectionsSchema.safeParse(draft.sections);
    if (!parsed.success) {
      setInvalid(true);
      return;
    }
    const pageName = PAGE_LABELS[page][locale];
    const label = `${t.structure.title}: ${pageName}`;
    const finish = () => {
      dropLayoutDraft(page);
      setSavedAt(Date.now());
      announce(t.announce.saved);
    };
    const current = entry.data;
    if (current && draft.version !== null) {
      const fields = { ...current.fields, sections: { [localeCode]: parsed.data } };
      save.mutate(
        { id: current.id, dto: { version: draft.version, fields, label } },
        {
          onSuccess: () => {
            finish();
            pushAction(
              entrySaveAction({
                entry: current,
                after: fields,
                label: t.history.layout(pageName),
                changeLabel: label,
              }),
            );
          },
        },
      );
      return;
    }
    create.mutate(
      {
        contentTypeId: LAYOUT_TYPE_ID,
        label,
        fields: {
          internalName: { [localeCode]: `Layout: ${page}` },
          page: { [localeCode]: page },
          sections: { [localeCode]: parsed.data },
        },
      },
      {
        onSuccess: (created) => {
          finish();
          pushAction(entryCreateAction({ id: created.id, label: t.history.layout(pageName) }));
        },
      },
    );
  };

  useSaveShortcut(submit);

  if (!page) {
    return (
      <EditorPanel
        t={t}
        label={t.structure.title}
        kicker={t.structure.kicker}
        title={t.structure.title}
        status={null}
        onClose={closeStructure}
      >
        <p className="text-[14px] text-text-muted">{t.structure.unsupported}</p>
      </EditorPanel>
    );
  }

  const isStale = Boolean(draft && version !== null && draft.version !== version);
  const isSaving = save.isPending || create.isPending;

  return (
    <EditorPanel
      t={t}
      label={t.structure.title}
      kicker={t.structure.kicker}
      title={PAGE_LABELS[page][locale]}
      status={null}
      onClose={closeStructure}
      focusTitle
      footer={
        canEdit ? (
          <>
            {(isStale || isConflict(save.error)) && (
              <div role="alert" className="flex items-center gap-3 text-[14px] text-state-error">
                <span className="flex-1">{t.inspector.conflict}</span>
                <Button
                  label={t.inspector.reload}
                  variant="secondary"
                  onClick={() => {
                    dropLayoutDraft(page);
                    save.reset();
                    void entry.refetch();
                  }}
                />
              </div>
            )}
            {invalid && (
              <p role="alert" className="text-[14px] text-state-error">
                {t.structure.invalid}
              </p>
            )}
            {saveError && !isConflict(save.error) && (
              <p role="alert" className="text-[14px] text-state-error">
                {saveError}
              </p>
            )}
            {savedAt && !draft && (
              <p role="status" className="text-[14px] text-viratec-cyan">
                {t.inspector.saved}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                label={t.inspector.save}
                aria-keyshortcuts={SHORTCUTS.save.aria}
                className="flex-1"
                disabled={!draft || isStale}
                loading={isSaving}
                onClick={submit}
              />
              <Button
                label={t.inspector.reset}
                variant="secondary"
                disabled={!draft || isSaving}
                onClick={() => {
                  dropLayoutDraft(page);
                  setInvalid(false);
                }}
              />
            </div>
            <p className="text-caption text-text-subtle">{t.saveHint(SHORTCUTS.save.label)}</p>
          </>
        ) : null
      }
    >
      <div className="flex flex-col gap-1.5 text-[14px] text-text-muted">
        <p>{t.structure.hint}</p>
        <p>{t.structure.autoTone}</p>
      </div>
      {!canEdit && (
        <p className="rounded-2xl bg-white/5 p-3 text-[14px] text-text-muted">
          {t.inspector.readOnly}
        </p>
      )}
      {isLoading ? (
        <p role="status" className="text-text-muted">
          {t.loading}
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {sections.map((section, index) => {
            const label = sectionLabel(section, page, locale, t, blocks);
            const isExpanded =
              expanded === section.id && section.type !== 'builtin' && section.type !== 'block';
            return (
              <li
                key={section.id}
                ref={expanded === section.id ? focusedRow : undefined}
                className={cn(
                  'flex min-w-0 flex-col gap-3 rounded-2xl border p-2 pl-3',
                  expanded === section.id
                    ? 'border-viratec-cyan/70 bg-viratec-cyan/6'
                    : 'border-white/8 bg-white/3',
                )}
              >
                <div className="flex min-w-0 items-center gap-1">
                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate text-[15px]',
                      section.hidden ? 'text-text-subtle line-through' : 'text-text-primary',
                    )}
                  >
                    {label}
                  </span>
                  {section.hidden && (
                    <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[11px] text-text-muted">
                      {t.structure.hidden}
                    </span>
                  )}
                  {!section.hidden && (
                    <IconButton
                      size="sm"
                      icon={LocateFixed}
                      label={t.structure.scrollTo(label)}
                      onClick={() => scrollToSection(section.id)}
                    />
                  )}
                  {canEdit && (
                    <>
                      {section.type === 'builtin' ? (
                        !section.hidden && (
                          <IconButton
                            size="sm"
                            icon={Pencil}
                            label={t.structure.edit(label)}
                            onClick={() => editBuiltinSection(section.id)}
                          />
                        )
                      ) : section.type === 'block' ? (
                        <IconButton
                          size="sm"
                          icon={Pencil}
                          label={t.structure.edit(label)}
                          onClick={() => editBlock(section.id, section.blockId, locale)}
                        />
                      ) : (
                        <IconButton
                          size="sm"
                          icon={Pencil}
                          label={t.structure.edit(label)}
                          aria-expanded={isExpanded}
                          onClick={() => setExpanded(isExpanded ? null : section.id)}
                        />
                      )}
                      <IconButton
                        size="sm"
                        icon={ArrowUp}
                        label={t.structure.moveUp(label)}
                        disabled={index === 0}
                        onClick={() => update(moveItem(sections, index, index - 1))}
                      />
                      <IconButton
                        size="sm"
                        icon={ArrowDown}
                        label={t.structure.moveDown(label)}
                        disabled={index === sections.length - 1}
                        onClick={() => update(moveItem(sections, index, index + 1))}
                      />
                      {section.type === 'builtin' ? (
                        <IconButton
                          size="sm"
                          icon={section.hidden ? Eye : EyeOff}
                          label={
                            section.hidden ? t.structure.unhide(label) : t.structure.hide(label)
                          }
                          aria-pressed={Boolean(section.hidden)}
                          onClick={() =>
                            update(
                              sections.map((item) =>
                                item.id === section.id ? { ...item, hidden: !item.hidden } : item,
                              ),
                            )
                          }
                        />
                      ) : (
                        <IconButton
                          size="sm"
                          icon={Trash2}
                          label={t.structure.remove(label)}
                          onClick={() => setDeleting(section)}
                        />
                      )}
                    </>
                  )}
                </div>
                {isExpanded && (
                  <div className="pr-1 pb-2">
                    <SectionEditor
                      section={section}
                      readOnly={!canEdit}
                      t={t}
                      onChange={(next) =>
                        update(sections.map((item) => (item.id === section.id ? next : item)))
                      }
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {canEdit && !isLoading && (
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Select
              label={t.structure.addType}
              helperText={t.structure.typeHelp[addType]}
              value={addType}
              options={CUSTOM_SECTION_TYPES.map((type) => ({
                value: type,
                label: t.structure.types[type],
              }))}
              onChange={(event) => {
                const next = CUSTOM_SECTION_TYPES.find((type) => type === event.target.value);
                if (next) setAddType(next);
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const section = newSection(addType);
              const anchor = sections.findIndex((item) => item.id === expanded);
              const position = anchor === -1 ? sections.length : anchor + 1;
              update([...sections.slice(0, position), section, ...sections.slice(position)]);
              setExpanded(section.id);
            }}
            className="mt-7 inline-flex h-[50px] shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 px-3 text-[14px] text-text-primary transition-colors hover:border-viratec-cyan/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none"
          >
            <Plus aria-hidden="true" className="size-4" />
            {t.structure.add}
          </button>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        title={
          deleting ? t.structure.deleteTitle(sectionLabel(deleting, page, locale, t, blocks)) : ''
        }
        description={
          deleting?.type === 'block'
            ? `${t.structure.deleteText} ${t.structure.blockKept}`
            : t.structure.deleteText
        }
        confirmLabel={t.structure.deleteConfirm}
        cancelLabel={t.keepEditing}
        closeLabel={t.close}
        onConfirm={() => {
          if (deleting) update(sections.filter((item) => item.id !== deleting.id));
          setDeleting(null);
        }}
        onClose={() => setDeleting(null)}
      />
    </EditorPanel>
  );
}

import type { RecordDto, RecordResource } from '@viratec/contracts';
import { getPublicationCover } from '@/entities/publication';
import { buildPublicationPath } from '@/shared/config/routes';
import { absoluteImageUrl, cn, contentCoverSrc } from '@/shared/lib';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { imageRecordSchema } from '../model/fieldText';
import { withLengthHint } from '../model/lengthLimits';
import type { SiteEditorMessages } from '../model/messages';
import { useRecordWizard } from '../model/useRecordWizard';
import { ImageUploadField } from './ImageUploadField';
import { WizardPreview } from './WizardPreview';
import { WizardTemplatePicker } from './WizardTemplatePicker';

interface RecordWizardProps {
  resource: RecordResource;
  t: SiteEditorMessages;
  onClose: () => void;
  onCreated: (record: RecordDto, label: string) => void;
}

export function RecordWizard({ resource, t, onClose, onCreated }: RecordWizardProps) {
  const wizard = useRecordWizard(resource, onCreated);
  const coverSchema = wizard.coverPath ? imageRecordSchema(resource, wizard.coverPath) : undefined;
  const coverPreview = wizard.cover
    ? resource === 'publication'
      ? getPublicationCover(wizard.cover)
      : contentCoverSrc(wizard.cover)
    : undefined;

  return (
    <Dialog
      open
      title={t.wizard.title[resource]}
      description={`${t.wizard.step(wizard.stepIndex + 1, wizard.steps.length)} · ${t.wizard.steps[wizard.step]}`}
      closeLabel={t.close}
      onClose={onClose}
    >
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (wizard.isLast) void wizard.submit();
          else wizard.next();
        }}
      >
        <ol aria-hidden="true" className="flex gap-1.5">
          {wizard.steps.map((item, index) => (
            <li
              key={item}
              className={cn(
                'h-1 flex-1 rounded-full',
                index <= wizard.stepIndex ? 'bg-viratec-cyan' : 'bg-white/12',
              )}
            />
          ))}
        </ol>

        {wizard.step === 'template' && (
          <WizardTemplatePicker value={wizard.template} t={t} onChange={wizard.setTemplate} />
        )}

        {wizard.step === 'title' && (
          <>
            <Input
              key="title"
              label={t.wizard.titleLabel}
              helperText={withLengthHint(t.wizard.titleHelp, wizard.title, wizard.titleLimit, t)}
              value={wizard.title}
              error={wizard.titleError ?? undefined}
              required
              autoComplete="off"
              maxLength={300}
              autoFocus
              data-autofocus
              onChange={(event) => wizard.setTitle(event.target.value)}
            />
            {wizard.needsSlug &&
              (wizard.slugError ? (
                <Input
                  label={t.wizard.slugLabel}
                  helperText={t.records.slugHelp}
                  value={wizard.slug}
                  error={wizard.slugError}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={120}
                  onChange={(event) => wizard.setSlug(event.target.value)}
                />
              ) : (
                wizard.slug && (
                  <p className="text-[13px] break-words text-text-subtle">
                    {t.wizard.address(buildPublicationPath(wizard.slug))}
                  </p>
                )
              ))}
          </>
        )}

        {wizard.step === 'summary' && (
          <Textarea
            label={t.wizard.summaryLabel}
            helperText={withLengthHint(
              t.wizard.summaryHelp,
              wizard.summary,
              wizard.summaryLimit,
              t,
            )}
            value={wizard.summary}
            rows={4}
            maxLength={600}
            autoFocus
            onChange={(event) => wizard.setSummary(event.target.value)}
          />
        )}

        {wizard.step === 'photo' && (
          <ImageUploadField
            label={t.wizard.photoLabel}
            help={t.wizard.photoHelp}
            previewSrc={coverPreview}
            previewAlt=""
            hasValue={Boolean(wizard.cover)}
            canRemove
            readOnly={false}
            uploadName="cover"
            t={t}
            onUploaded={(asset) => {
              const url = absoluteImageUrl(asset.url);
              if (coverSchema && !coverSchema.safeParse(url).success) {
                return t.inspector.imageNotSaved;
              }
              wizard.setCover(url);
              return null;
            }}
            onRemove={() => wizard.setCover(null)}
          />
        )}

        {wizard.step === 'when' && (
          <>
            <Input
              label={t.wizard.startLabel}
              type="datetime-local"
              value={wizard.start}
              autoFocus
              onChange={(event) => wizard.setStart(event.target.value)}
            />
            <Input
              label={t.wizard.endLabel}
              type="datetime-local"
              value={wizard.end}
              onChange={(event) => wizard.setEnd(event.target.value)}
            />
            <Input
              label={t.wizard.placeLabel}
              helperText={t.wizard.placeHelp}
              value={wizard.place}
              maxLength={300}
              onChange={(event) => wizard.setPlace(event.target.value)}
            />
          </>
        )}

        {wizard.step === 'preview' && (
          <div className="flex flex-col gap-4">
            <p className="text-[14px] text-text-muted">{t.wizard.previewHelp}</p>
            <WizardPreview
              resource={resource}
              data={wizard.data}
              title={wizard.title}
              summary={wizard.summary}
              cover={wizard.cover}
              start={wizard.start}
              place={wizard.place}
              t={t}
            />
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={wizard.translateOther}
                onChange={(event) => wizard.setTranslateOther(event.target.checked)}
                className="mt-0.5 shrink-0 accent-viratec-cyan"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] text-text-primary">
                  {t.wizard.translateOther[wizard.other]}
                </span>
                <span className="text-[13px] text-text-subtle">{t.wizard.translateHelp}</span>
              </span>
            </label>
          </div>
        )}

        {wizard.createError && (
          <p role="alert" className="text-[14px] text-state-error">
            {wizard.createError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {wizard.stepIndex > 0 && (
            <Button label={t.wizard.back} variant="secondary" onClick={wizard.back} />
          )}
          <Button
            type="submit"
            label={
              wizard.isTranslating
                ? t.wizard.translating
                : wizard.isLast
                  ? t.wizard.create
                  : t.wizard.next
            }
            loading={wizard.isPending}
          />
        </div>
      </form>
    </Dialog>
  );
}

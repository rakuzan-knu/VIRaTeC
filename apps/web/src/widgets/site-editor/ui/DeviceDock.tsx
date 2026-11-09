import { ArrowLeft, Eye, Smartphone, Tablet } from 'lucide-react';
import type { SiteEditorMessages } from '../model/messages';
import { useSiteEditorStore, type PreviewDevice } from '../model/store';
import { SegmentedChoice } from './SegmentedChoice';

interface DeviceDockProps {
  device: Exclude<PreviewDevice, 'desktop'>;
  t: SiteEditorMessages;
}

export function DeviceDock({ device, t }: DeviceDockProps) {
  const { setDevice, setMode } = useSiteEditorStore.getState();

  return (
    <div className="editor-pop-in flex max-w-full shrink-0 flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/12 bg-viratec-deep/95 p-2 xl:absolute xl:top-[160px] xl:right-3 xl:w-[360px] xl:flex-col xl:items-stretch xl:p-4">
      <p className="hidden items-start gap-2.5 text-[13px] leading-[18px] text-text-muted md:flex xl:text-[14px] xl:leading-5">
        <Eye aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-viratec-cyan" />
        <span className="max-w-[340px] xl:max-w-none">{t.device.previewOnly}</span>
      </p>
      <SegmentedChoice<Exclude<PreviewDevice, 'desktop'>>
        label={t.device.label}
        value={device}
        options={[
          { value: 'tablet', label: t.device.tablet, icon: Tablet },
          { value: 'phone', label: t.device.phone, icon: Smartphone },
        ]}
        onChange={setDevice}
      />
      <button
        type="button"
        onClick={() => {
          setDevice('desktop');
          setMode('edit');
        }}
        className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-viratec-cyan px-4 text-[14px] font-medium text-viratec-ink transition-colors hover:bg-viratec-cyan/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none"
      >
        <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
        {t.device.close}
      </button>
    </div>
  );
}

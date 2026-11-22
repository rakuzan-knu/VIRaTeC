import { useState } from 'react';
import { Input } from '@/shared/ui/Input';
import { MAX_SCREEN, MIN_SCREEN } from '../model/devicePresets';
import type { SiteEditorMessages } from '../model/messages';

interface DeviceSizeFieldsProps {
  width: number;
  height: number;
  t: SiteEditorMessages;
  onApply: (width: number, height: number) => void;
}

export function DeviceSizeFields({ width, height, t, onApply }: DeviceSizeFieldsProps) {
  const [draft, setDraft] = useState({ width: String(width), height: String(height) });

  const apply = () => {
    const nextWidth = Number(draft.width);
    const nextHeight = Number(draft.height);
    if (!Number.isFinite(nextWidth) || !Number.isFinite(nextHeight)) return;
    if (nextWidth === width && nextHeight === height) return;
    onApply(nextWidth, nextHeight);
  };

  return (
    <form
      className="grid grid-cols-2 gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}
    >
      <Input
        label={t.device.width}
        type="number"
        inputMode="numeric"
        min={MIN_SCREEN}
        max={MAX_SCREEN}
        value={draft.width}
        onChange={(event) => setDraft((current) => ({ ...current, width: event.target.value }))}
        onBlur={apply}
      />
      <Input
        label={t.device.height}
        type="number"
        inputMode="numeric"
        min={MIN_SCREEN}
        max={MAX_SCREEN}
        value={draft.height}
        onChange={(event) => setDraft((current) => ({ ...current, height: event.target.value }))}
        onBlur={apply}
      />
      <button type="submit" hidden />
    </form>
  );
}

import { useId } from 'react';
import { Crosshair, RotateCcw } from 'lucide-react';
import { COVER_FOCUS_PATTERN } from '@viratec/contracts';
import type { SiteEditorMessages } from '../model/messages';

const CENTER = 50;
const STEP = 5;

const FRAMES = [
  { key: 'phone', className: 'h-[72px] w-[156px]' },
  { key: 'desktop', className: 'h-[86px] w-[176px]' },
] as const;

const parseFocus = (value: string | null) => {
  const match = value && COVER_FOCUS_PATTERN.test(value) ? value.match(/\d+/g) : null;
  return { x: Number(match?.[0] ?? CENTER), y: Number(match?.[1] ?? CENTER) };
};

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

interface FocusPickerProps {
  src: string;
  value: string | null;
  readOnly: boolean;
  t: SiteEditorMessages;
  onChange: (value: string | null) => void;
}

export function FocusPicker({ src, value, readOnly, t, onChange }: FocusPickerProps) {
  const helpId = useId();
  const { x, y } = parseFocus(value);
  const position = `${x}% ${y}%`;
  const set = (nextX: number, nextY: number) => onChange(`${clamp(nextX)}% ${clamp(nextY)}%`);

  return (
    <fieldset aria-describedby={helpId} className="flex min-w-0 flex-col gap-3">
      <legend className="mb-1 flex items-center gap-2 text-label font-medium text-text-primary">
        <Crosshair aria-hidden="true" className="size-4 text-viratec-cyan" />
        {t.focus.title}
      </legend>
      <p id={helpId} className="-mt-1 text-[13px] text-text-muted">
        {t.focus.help}
      </p>
      <div className="relative self-start overflow-hidden rounded-xl">
        <img
          src={src}
          alt=""
          draggable={false}
          onClick={(event) => {
            if (readOnly) return;
            const rect = event.currentTarget.getBoundingClientRect();
            set(
              ((event.clientX - rect.left) / rect.width) * 100,
              ((event.clientY - rect.top) / rect.height) * 100,
            );
          }}
          className="block max-h-56 w-auto max-w-full cursor-crosshair"
        />
        <span
          aria-hidden="true"
          style={{ left: `${x}%`, top: `${y}%` }}
          className="pointer-events-none absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_var(--color-viratec-cyan)]"
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {(
          [
            ['x', t.focus.horizontal, x],
            ['y', t.focus.vertical, y],
          ] as const
        ).map(([axis, label, current]) => (
          <label key={axis} className="flex flex-col gap-1 text-[13px] text-text-muted">
            {label}
            <input
              type="range"
              min={0}
              max={100}
              step={STEP}
              value={current}
              disabled={readOnly}
              aria-valuetext={`${current}%`}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (axis === 'x') set(next, y);
                else set(x, next);
              }}
              className="accent-viratec-cyan"
            />
          </label>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] text-text-muted">{t.focus.preview}</span>
        <div className="flex flex-wrap gap-3">
          {FRAMES.map((frame) => (
            <figure key={frame.key} className="flex flex-col gap-1">
              <img
                src={src}
                alt=""
                style={{ objectPosition: position }}
                className={`${frame.className} rounded-lg object-cover ring-1 ring-white/10`}
              />
              <figcaption className="text-[12px] text-text-subtle">{t.focus[frame.key]}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      {!readOnly && value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex min-h-6 cursor-pointer items-center gap-1.5 self-start rounded-lg px-2 py-1 text-[13px] text-viratec-cyan hover:bg-white/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
        >
          <RotateCcw aria-hidden="true" className="size-3.5" />
          {t.focus.reset}
        </button>
      )}
    </fieldset>
  );
}

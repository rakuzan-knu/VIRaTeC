import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

export function FieldSection({
  title,
  hint,
  open,
  children,
}: {
  title: string;
  hint?: string;
  open: boolean;
  children: ReactNode;
}) {
  return (
    <details open={open} className="group min-w-0 rounded-2xl border border-white/8">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-2xl px-4 py-2 text-[15px] font-medium text-text-primary transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden="true"
          className="size-4 shrink-0 text-text-muted transition-transform group-open:rotate-90 motion-reduce:transition-none"
        />
        <span className="flex min-w-0 flex-col">
          <span className="break-words">{title}</span>
          {hint && <span className="text-[13px] font-normal text-text-muted">{hint}</span>}
        </span>
      </summary>
      <div className="flex min-w-0 flex-col gap-3 p-3 pt-1">{children}</div>
    </details>
  );
}

import { cn } from '@/shared/lib';

export function Badge({
  tone,
  children,
}: {
  tone: 'lime' | 'cyan' | 'muted' | 'error';
  children: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        tone === 'lime' && 'bg-viratec-lime/14 text-viratec-lime',
        tone === 'cyan' && 'bg-viratec-cyan/14 text-viratec-cyan',
        tone === 'muted' && 'bg-white/8 text-viratec-soft',
        tone === 'error' && 'bg-red-500/14 text-red-300',
      )}
    >
      {children}
    </span>
  );
}

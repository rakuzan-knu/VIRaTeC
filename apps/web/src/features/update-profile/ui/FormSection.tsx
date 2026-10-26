import type { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  hint: string;
  children: ReactNode;
}

export function FormSection({ title, hint, children }: FormSectionProps) {
  return (
    <section className="flex flex-col gap-5 border-t border-white/8 pt-7 first:border-t-0 first:pt-0">
      <header className="flex flex-col gap-1">
        <h4 className="font-display text-lg leading-6 font-medium tracking-[-0.01em] text-white">
          {title}
        </h4>
        <p className="text-sm leading-5 text-viratec-muted">{hint}</p>
      </header>
      {children}
    </section>
  );
}

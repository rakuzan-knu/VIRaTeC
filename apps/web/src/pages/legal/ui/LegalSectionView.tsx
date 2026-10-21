import { formatIndex } from '../model/documents';
import type { LegalSection, LegalTable } from '../model/types';

interface LegalSectionViewProps {
  section: LegalSection;
  index: number;
  summaryLabel: string;
}

function LegalTableView({ table }: { table: LegalTable }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm leading-[22px]">
        <thead className="bg-white/[0.04]">
          <tr>
            {table.columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-medium text-white">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row[0]} className="border-t border-white/8 align-top">
              {row.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <th key={cell} scope="row" className="px-4 py-3 font-medium text-viratec-soft">
                    {cell}
                  </th>
                ) : (
                  <td key={cell} className="px-4 py-3 text-viratec-muted">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalSectionView({ section, index, summaryLabel }: LegalSectionViewProps) {
  const titleId = `${section.id}-title`;

  return (
    <section
      id={section.id}
      aria-labelledby={titleId}
      className="scroll-mt-24 border-t border-white/8 py-10 first:border-t-0 first:pt-0 lg:py-14"
    >
      <div className="mb-6 flex flex-col gap-2 lg:mb-8">
        <span aria-hidden="true" className="text-sm font-medium text-viratec-accent tabular-nums">
          {formatIndex(index)}
        </span>
        <h2
          id={titleId}
          className="font-display text-[26px] leading-[32px] font-medium tracking-[-0.025em] text-white lg:text-[34px] lg:leading-[40px]"
        >
          {section.title}
        </h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-12">
        <aside className="self-start rounded-2xl border border-viratec-lime/25 bg-viratec-lime/[0.04] p-5 xl:order-2">
          <p className="mb-2 text-xs font-medium tracking-[0.08em] text-viratec-accent uppercase">
            {summaryLabel}
          </p>
          <p className="text-[15px] leading-6 text-white">{section.summary}</p>
        </aside>

        <div className="flex flex-col gap-5 text-base leading-[27px] text-viratec-muted lg:text-[17px] lg:leading-[29px] xl:order-1">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.list && (
            <ul className="flex flex-col gap-3">
              {section.list.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-[11px] size-1.5 shrink-0 rounded-full bg-viratec-lime lg:mt-3"
                  />
                  {item}
                </li>
              ))}
            </ul>
          )}
          {section.table && <LegalTableView table={section.table} />}
          {section.note && (
            <p className="rounded-xl border-l-2 border-viratec-cyan bg-white/[0.03] px-4 py-3 text-[15px] leading-6 text-viratec-soft">
              {section.note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";

export type WebExtractionPanelProps = {
  data: any;
  onClear: () => void;
  sourceUrl?: string;
};

const tagClasses = "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300";

function renderTable(table: string[][], index: number) {
  return (
    <div key={`table-${index}`} className="overflow-hidden rounded-xl border border-white/10 bg-white/5 dark:bg-white/5">
      <table className="min-w-full divide-y divide-white/10 text-sm text-[var(--text-primary)]">
        <tbody>
          {table.map((row, rowIdx) => (
            <tr key={rowIdx} className="divide-x divide-white/10">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-3 py-2 text-left">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WebExtractionPanel({ data, onClear, sourceUrl }: WebExtractionPanelProps) {
  if (!data) return null;

  const headings = data.headings ?? [];
  const paragraphs = data.paragraphs ?? [];
  const tables = data.tables ?? [];
  const links = data.links ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-4 space-y-4 rounded-2xl border border-white/10 bg-[var(--panel-bg)] p-6 shadow-lg"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={tagClasses}>Verified</span>
        <span className={tagClasses}>Public Webpage</span>
        <span className={tagClasses}>Read-Only</span>
        {sourceUrl && (
          <span className="text-xs text-[var(--text-secondary)]">Source: {sourceUrl}</span>
        )}
      </div>

      <div className="space-y-6">
        {headings.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Headings</h3>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {headings.map((heading: any, idx: number) => (
                <div
                  key={`heading-${idx}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)] dark:bg-white/5"
                >
                  <span className="mr-2 rounded-lg bg-black/30 px-2 py-1 text-xs uppercase tracking-wide text-[var(--text-secondary)] dark:bg-white/10">
                    {heading.level}
                  </span>
                  {heading.text}
                </div>
              ))}
            </div>
          </section>
        )}

        {paragraphs.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Paragraphs</h3>
            {paragraphs.map((para: string, idx: number) => (
              <p
                key={`paragraph-${idx}`}
                className="rounded-xl border border-white/5 bg-white/5 p-3 text-sm leading-relaxed text-[var(--text-secondary)] shadow-inner dark:border-white/10 dark:bg-white/5"
              >
                {para}
              </p>
            ))}
          </section>
        )}

        {tables.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Tables</h3>
            <div className="space-y-3">
              {tables.map((table: string[][], idx: number) => renderTable(table, idx))}
            </div>
          </section>
        )}

        {links.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Links (not followed)</h3>
            <div className="flex flex-wrap gap-2">
              {links.map((link: any, idx: number) => (
                <span
                  key={`link-${idx}`}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--text-secondary)]"
                >
                  {link.text}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-[var(--text-secondary)]">Extracted data stored temporarily only.</div>
        <button
          onClick={onClear}
          className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:-translate-y-0.5"
        >
          Delete Extracted Data
        </button>
      </div>
    </motion.div>
  );
}

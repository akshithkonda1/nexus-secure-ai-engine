import { BadgePlus, Copy, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

type TemplateCardProps = {
  title: string;
  description: string;
  tags: string[];
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
};

export function TemplateCard({ title, description, tags, onEdit, onDuplicate, onDelete }: TemplateCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="card card-hover relative overflow-hidden p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[rgb(var(--text))]">{title}</h3>
          <p className="mt-1 max-w-xl text-sm text-[color:rgba(var(--text)/0.65)]">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] text-[rgb(var(--text))] transition hover:border-[color:var(--ring)] hover:text-[color:var(--ring)]"
              aria-label="Edit template"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={onDuplicate}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] text-[rgb(var(--text))] transition hover:border-[color:var(--ring)] hover:text-[color:var(--ring)]"
              aria-label="Duplicate template"
            >
              <Copy className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] text-red-500 transition hover:border-red-400"
              aria-label="Delete template"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-2 rounded-full border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]"
          >
            <BadgePlus className="h-3 w-3" />
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export function EmptyTemplates({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-6 py-12 text-center text-sm text-[color:rgba(var(--text)/0.6)]">
      <p>{label}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

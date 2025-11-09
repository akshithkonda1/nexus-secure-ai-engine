import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type HistorySectionProps = {
  title: string;
  description: string;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function HistorySection({ title, description, defaultOpen = true, actions, children }: HistorySectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        className="flex w-full items-center justify-between gap-4 px-8 py-6 text-left transition-all duration-300 hover:px-9"
      >
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-[rgb(var(--text))]">{title}</h3>
          <p className="text-sm text-[color:rgba(var(--text)/0.6)]">{description}</p>
        </div>
        <div className="flex items-center gap-4">
          {actions}
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] text-[rgb(var(--text))]">
            <ChevronDown className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "rotate-0")} />
          </span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-[color:rgba(var(--border))] px-8 py-7 text-sm text-[rgb(var(--text))]"
        >
          <div className="space-y-5">{children}</div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

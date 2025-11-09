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
    <div className="rounded-[calc(var(--radius-xl)*1.4)] border border-white/30 bg-white/70 shadow-[0_40px_110px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-[#0d111a]/70">
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        className="flex w-full items-center justify-between gap-4 px-8 py-6 text-left transition-all duration-300 hover:px-9"
      >
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-[rgb(var(--text))]">{title}</h3>
          <p className="text-sm text-[rgb(var(--text)/0.6)]">{description}</p>
        </div>
        <div className="flex items-center gap-4">
          {actions}
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-white/70 text-[rgb(var(--text))] shadow-[0_10px_30px_rgba(15,23,42,0.12)] dark:bg-white/10">
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
            className="overflow-hidden border-t border-white/20 px-8 py-7 text-sm text-[rgb(var(--text))] dark:border-white/10"
          >
            <div className="space-y-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

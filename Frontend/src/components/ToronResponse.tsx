import { AnimatePresence, motion } from "framer-motion";

type ToronResponseProps = {
  content: string;
};

export default function ToronResponse({ content }: ToronResponseProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">Response</div>
      <div className="min-h-[180px] rounded-lg border border-white/10 bg-black/15 p-5 shadow-inner shadow-black/20">
        <AnimatePresence mode="wait">
          {content ? (
            <motion.p
              key={content}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.22 }}
              className="text-base font-medium leading-relaxed text-slate-100"
            >
              {content}
            </motion.p>
          ) : (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm font-medium leading-relaxed text-slate-400"
            >
              Idle.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

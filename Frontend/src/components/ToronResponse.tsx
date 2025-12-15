import { AnimatePresence, motion } from "framer-motion";

type ToronResponseProps = {
  content: string;
};

export default function ToronResponse({ content }: ToronResponseProps) {
  return (
    <div className="space-y-4 text-base leading-relaxed text-slate-100/90">
      <AnimatePresence mode="wait">
        {content ? (
          <motion.p
            key={content}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.2 }}
            className="whitespace-pre-wrap"
          >
            {content}
          </motion.p>
        ) : (
          <motion.p
            key="placeholder"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm font-medium text-slate-400"
          >
            Awaiting input.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

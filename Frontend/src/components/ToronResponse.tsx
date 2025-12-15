import { AnimatePresence, motion } from "framer-motion";

type ToronResponseProps = {
  content: string;
};

export default function ToronResponse({ content }: ToronResponseProps) {
  return (
    <AnimatePresence mode="wait">
      {content && (
        <motion.div
          key={content}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl bg-white/5 px-5 py-4 text-base leading-relaxed text-slate-100/90 shadow-inner shadow-black/30"
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

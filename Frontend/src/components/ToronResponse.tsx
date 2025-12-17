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
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.2 }}
          className="space-y-4 text-base leading-relaxed text-slate-100/90"
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

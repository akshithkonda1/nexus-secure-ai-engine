import { motion } from "framer-motion";

import { RyuzenBrandmark } from "@/components/RyuzenBrandmark";

export function ToronWelcome() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 px-6 py-10 text-center text-[var(--text-primary)]">
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <div className="absolute inset-[-120px] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.2),transparent_45%)] blur-3xl" />
        <div className="absolute inset-[-80px] rounded-full bg-[radial-gradient(circle_at_60%_40%,rgba(16,185,129,0.2),transparent_50%)] blur-3xl" />
        <motion.div
          className="relative"
          animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <RyuzenBrandmark size={96} className="drop-shadow-2xl" />
        </motion.div>
      </motion.div>

      <div className="relative space-y-2">
        <motion.h2
          className="text-3xl font-semibold"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: "easeOut" }}
        >
          Hello, I’m Toron.
        </motion.h2>
        <motion.p
          className="text-base text-[var(--text-secondary)]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45, ease: "easeOut" }}
        >
          Your adaptive multi-model Ryuzen assistant.
        </motion.p>
      </div>
    </div>
  );
}

export default ToronWelcome;

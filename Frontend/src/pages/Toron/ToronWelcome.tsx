import { motion } from "framer-motion";

const avatarSrc = "/src/assets/branding/ryuzen-logo.png";

export default function ToronWelcome() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 px-6 py-10 text-center text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,225,255,0.14),transparent_40%),radial-gradient(circle_at_55%_46%,rgba(154,77,255,0.12),transparent_45%),radial-gradient(circle_at_50%_70%,rgba(0,225,255,0.08),transparent_55%)] blur-3xl" />
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-[-140px] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,225,255,0.18),transparent_40%)] blur-3xl"
          animate={{ opacity: [0.6, 0.9, 0.7], scale: [1, 1.04, 1] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={avatarSrc}
          alt="Toron avatar"
          className="relative h-24 w-24 rounded-full border border-white/30 bg-white/60 p-4 shadow-xl backdrop-blur-lg dark:border-white/10 dark:bg-white/10"
          animate={{ scale: [1, 1.045, 1] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
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
          Your adaptive, multi-model Ryuzen assistant.
        </motion.p>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";

import type { ToronMessage } from "./toronTypes";

type ToronMessageBubbleProps = {
  message: ToronMessage;
};

const bubbleVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function ToronMessageBubble({ message }: ToronMessageBubbleProps) {
  const isUser = message.sender === "user";

  const userBg =
    "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(248,250,252,0.9))";

  const toronBg =
    "linear-gradient(140deg, rgba(99,102,241,0.28), rgba(56,189,248,0.22), rgba(16,185,129,0.24))";

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className="relative w-full max-w-[720px]">
        <div
          className={`relative w-fit max-w-full rounded-3xl border px-4 py-3 shadow-lg transition ${
            isUser
              ? "ml-auto text-[var(--text-primary)]"
              : "mr-auto text-[var(--text-primary)]"
          }`}
          style={{
            background: isUser ? `var(--toron-glass-light, ${userBg})` : `var(--toron-glass-dark, ${toronBg})`,
            borderColor: isUser ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)",
            boxShadow: isUser
              ? "0 18px 45px rgba(59,130,246,0.18)"
              : "0 18px 38px rgba(15,23,42,0.25)",
            color: isUser ? "var(--text-primary)" : "var(--text-primary)",
          }}
        >
          {!isUser && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_40%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,rgba(16,185,129,0.12),transparent_45%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(59,130,246,0.16),transparent_45%)]" />
            </div>
          )}
          <p className="relative whitespace-pre-wrap text-base leading-relaxed">{message.text}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default ToronMessageBubble;

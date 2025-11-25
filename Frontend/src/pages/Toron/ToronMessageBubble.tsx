import { motion } from "framer-motion";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import type { ToronMessage } from "./toronTypes";

type ToronMessageBubbleProps = {
  message: ToronMessage;
};

const bubbleVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const markdownComponents: Components = {
  code({ inline, className, children, ...props }) {
    if (inline) {
      return (
        <code
          className={`rounded-md bg-white/40 px-1.5 py-0.5 text-[0.95em] font-semibold text-slate-800 dark:bg-white/10 dark:text-slate-100 ${className ?? ""}`}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <pre
        className="relative mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-100 shadow-inner"
        {...props}
      >
        <code className={className}>{children}</code>
      </pre>
    );
  },
  p({ children }: { children?: ReactNode }) {
    return <p className="mb-2 last:mb-0 leading-relaxed text-[var(--text-primary)]">{children}</p>;
  },
  ul({ children }: { children?: ReactNode }) {
    return <ul className="mb-2 list-disc space-y-1 pl-5 text-[var(--text-primary)]">{children}</ul>;
  },
  ol({ children }: { children?: ReactNode }) {
    return <ol className="mb-2 list-decimal space-y-1 pl-5 text-[var(--text-primary)]">{children}</ol>;
  },
  strong({ children }: { children?: ReactNode }) {
    return <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>;
  },
};

export function ToronMessageBubble({ message }: ToronMessageBubbleProps) {
  const isUser = message.sender === "user";

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className="relative w-full max-w-[720px]">
        <div
          className={`relative w-fit max-w-full rounded-3xl px-4 py-3 shadow-xl transition ${
            isUser ? "ml-auto text-[var(--text-primary)]" : "mr-auto text-[var(--text-primary)]"
          }`}
          style={{
            background: isUser
              ? "var(--toron-glass-light)"
              : "linear-gradient(140deg, rgba(34,211,238,0.18), rgba(168,85,247,0.18), rgba(16,185,129,0.18))",
            boxShadow: isUser
              ? "0 18px 45px rgba(59,130,246,0.18)"
              : "0 22px 48px rgba(15,23,42,0.35)",
          }}
        >
          {!isUser && (
            <>
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-3xl"
                style={{
                  background:
                    "linear-gradient(120deg, rgba(34,211,238,0.18), rgba(168,85,247,0.16), rgba(16,185,129,0.18))",
                }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              />
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute inset-[-40%] bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.18),transparent_55%)] blur-3xl" />
                <div className="absolute inset-[-30%] bg-[radial-gradient(circle_at_70%_40%,rgba(16,185,129,0.18),transparent_55%)] blur-3xl" />
              </div>
            </>
          )}

          <div className="relative">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
              className="prose prose-invert max-w-none text-base leading-relaxed"
            >
              {message.text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ToronMessageBubble;

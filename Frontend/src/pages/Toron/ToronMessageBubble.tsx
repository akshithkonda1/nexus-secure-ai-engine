import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import type { ToronMessage } from "./toronTypes";

type ToronMessageBubbleProps = {
  message: ToronMessage;
};

const bubbleVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function ToronMessageBubble({ message }: ToronMessageBubbleProps) {
  if (!message || typeof message.text !== "string") {
    console.warn("Invalid message:", message);
    return null;
  }

  const isUser = message.sender === "user";

  const userBg = `
  linear-gradient(
    135deg,
    rgba(10,132,255,0.95) 0%,
    rgba(30,144,255,0.92) 40%,
    rgba(0,102,255,0.92) 100%
  )
`;

  const toronBg =
    "linear-gradient(150deg, rgba(99,102,241,0.28), rgba(56,189,248,0.22), rgba(16,185,129,0.24))";

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
          className={`group relative w-fit max-w-full rounded-3xl border px-4 py-3 shadow-lg transition-all duration-150 ease-out ${
            isUser
              ? "ml-auto"
              : "mr-auto"
          }`}
          style={{
            background: isUser ? userBg : toronBg,
            color: isUser ? "#fff" : "var(--text-primary)",
            borderColor: isUser
              ? "rgba(255,255,255,0.35)"
              : "rgba(255,255,255,0.18)",
            boxShadow: isUser
              ? "0 18px 40px rgba(10,132,255,0.35)"
              : "0 18px 38px rgba(15,23,42,0.28)",
          }}
        >
          {!isUser && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_48%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_35%,rgba(56,189,248,0.14),transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(99,102,241,0.14),transparent_50%)]" />
              <div className="absolute inset-[-14%] blur-3xl bg-[radial-gradient(circle_at_60%_40%,rgba(14,165,233,0.12),transparent_55%)]" />
            </div>
          )}
          {isUser && (
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_60%)]" />
          )}

          <div className="relative whitespace-pre-wrap text-base leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              linkTarget="_blank"
              className="prose prose-sm max-w-none text-[inherit] prose-headings:text-[inherit] prose-p:text-[inherit] prose-strong:text-[inherit] prose-em:text-[inherit] prose-code:text-[inherit]"
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

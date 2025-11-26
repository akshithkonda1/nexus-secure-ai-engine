import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import type { ToronMessage } from "@/state/toron/toronSessionTypes";

type ToronMessageBubbleProps = {
  message: ToronMessage;
  index: number;
  isStreaming?: boolean;
};

const avatarSrc = "/src/assets/branding/ryuzen-logo.png";

export default function ToronMessageBubble({ message, index, isStreaming = false }: ToronMessageBubbleProps) {
  const isUser = message.sender === "user";

  const userStyle = {
    background: "var(--toron-bubble-user)",
    color: "#fff",
    boxShadow: "0 18px 40px rgba(0,122,255,0.25)",
  } as const;

  const toronStyle = {
    background:
      "linear-gradient(135deg, color-mix(in srgb, var(--toron-cosmic-primary) 80%, rgba(255,255,255,0.12)) 0%, color-mix(in srgb, var(--toron-cosmic-secondary) 80%, rgba(255,255,255,0.12)) 45%, rgba(255,255,255,0.18) 100%)",
    color: "var(--text-primary)",
    border: "1px solid rgba(255,255,255,0.35)",
    backdropFilter: "blur(16px) saturate(140%)",
    WebkitBackdropFilter: "blur(16px) saturate(140%)",
    boxShadow: "0 20px 60px rgba(15,23,42,0.28)",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: Math.min(index * 0.02, 0.25) }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex max-w-[720px] items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser && (
          <motion.div
            className="relative mt-1 h-10 w-10 overflow-hidden rounded-full border border-white/30 bg-white/70 shadow-lg backdrop-blur-md dark:border-white/20 dark:bg-white/10"
            animate={isStreaming ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 2.8, repeat: isStreaming ? Infinity : 0, ease: "easeInOut" }}
          >
            <div className="absolute inset-[-14px] bg-[radial-gradient(circle_at_50%_40%,rgba(0,225,255,0.22),transparent_45%),radial-gradient(circle_at_60%_70%,rgba(154,77,255,0.16),transparent_50%)] blur-md" />
            <img src={avatarSrc} alt="Toron" className="relative h-full w-full object-contain p-2" />
          </motion.div>
        )}

        <div
          className={`relative w-full max-w-[720px] rounded-3xl px-4 py-3 text-base leading-relaxed ${
            isUser ? "ml-auto text-white" : "mr-auto text-[var(--text-primary)]"
          }`}
          style={isUser ? userStyle : toronStyle}
        >
          {!isUser && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.14),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(0,225,255,0.12),transparent_45%)]" />
              <div className="absolute inset-[-18%] bg-[radial-gradient(circle_at_60%_60%,rgba(154,77,255,0.14),transparent_55%)] blur-3xl" />
            </div>
          )}

          <div className={`relative whitespace-pre-wrap text-base ${isStreaming ? "animate-pulse" : ""}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              className="prose prose-sm max-w-none text-[inherit] prose-headings:text-[inherit] prose-p:text-[inherit] prose-strong:text-[inherit] prose-em:text-[inherit] prose-code:rounded-md prose-code:bg-black/10 prose-code:px-1 prose-code:py-[2px] prose-pre:bg-slate-900 prose-pre:text-white"
            >
              {message.text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

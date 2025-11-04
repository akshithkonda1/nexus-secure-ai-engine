import { motion } from "framer-motion";
import { Paperclip, Mic, Sparkles } from "lucide-react";
import { useSession } from "@/shared/state/session";
import { ThemeToggle } from "@/shared/ui/theme/ThemeToggle";

export function UserBar() {
  const { user } = useSession();
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border-t border-white/10 bg-black/80 px-4 py-4 text-silver backdrop-blur lg:px-8"
      aria-label="User controls"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-base font-semibold text-white">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <p className="text-xs text-silver/70">{user.handle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggle className="gap-2 rounded-full border-white/10 text-xs uppercase tracking-wide text-silver transition hover:border-trustBlue/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black" />
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-silver transition hover:border-trustBlue/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            Attach
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-silver transition hover:border-trustBlue/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label="Record voice note"
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
            Voice
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-trustBlue bg-trustBlue px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Prompt Browser
          </button>
        </div>
      </div>
    </motion.footer>
  );
}

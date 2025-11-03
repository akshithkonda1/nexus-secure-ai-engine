import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Command, HelpCircle, Menu } from "lucide-react";

const SEARCH_DELAY = 400;

type HeaderProps = {
  onToggleSidebar: () => void;
};

type SearchState = "idle" | "loading" | "success";

export function Header({ onToggleSidebar }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<SearchState>("idle");

  useEffect(() => {
    if (!searchTerm) {
      setStatus("idle");
      return;
    }
    setStatus("loading");
    const handler = window.setTimeout(() => {
      setStatus("success");
    }, SEARCH_DELAY);
    return () => window.clearTimeout(handler);
  }, [searchTerm]);

  const statusLabel = useMemo(() => {
    if (status === "loading") return "Searching";
    if (status === "success") return "Results ready";
    return "Search";
  }, [status]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur-lg lg:px-8"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex rounded-lg border border-white/10 p-2 text-silver hover:border-trustBlue/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black lg:hidden"
          onClick={onToggleSidebar}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-xl text-silver">Nexus</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase tracking-wide text-trustBlue">Beta</span>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="relative flex-1"
        role="search"
        aria-label="Global search"
      >
        <label htmlFor="global-search" className="sr-only">
          Search debates or sessions
        </label>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm shadow-inner">
          <Command className="h-4 w-4 text-silver/60" aria-hidden="true" />
          <input
            id="global-search"
            name="global-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search debates or sessions"
            className="h-8 flex-1 bg-transparent text-silver outline-none placeholder:text-silver/50"
            aria-describedby="search-status"
            autoComplete="off"
          />
          <span id="search-status" className="text-xs text-silver/60">
            {statusLabel}
          </span>
        </div>
      </form>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="hidden rounded-full border border-trustBlue bg-trustBlue px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black lg:inline-flex"
        >
          Join Waitlist 
        </button>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-silver transition hover:border-trustBlue/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="Open help"
        >
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </motion.header>
  );
}

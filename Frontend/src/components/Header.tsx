import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Command, HelpCircle, Loader2, Menu } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const SEARCH_DELAY = 400;

type HeaderProps = {
  onToggleSidebar: () => void;
};

type SearchState = "idle" | "loading" | "success" | "error";

export function Header({ onToggleSidebar }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<SearchState>("idle");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!searchTerm) {
      setStatus("idle");
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      return;
    }
    setStatus("loading");
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const handler = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchTerm }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Search failed with status ${response.status}`);
        }

        await response.json().catch(() => null);
        setStatus("success");
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        if (import.meta.env.DEV && error instanceof Error) {
          console.warn("Search stub failed", error.message);
        }
        setStatus("error");
      }
    }, SEARCH_DELAY);

    return () => {
      controller.abort();
      window.clearTimeout(handler);
    };
  }, [searchTerm]);

  const statusLabel = useMemo(() => {
    if (status === "loading") return "Searching";
    if (status === "success") return "Results ready";
    if (status === "error") return "Offline";
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
      className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-app-border bg-[color:var(--surface-elevated)] px-4 py-3 backdrop-blur lg:px-8"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex rounded-xl border border-app-border p-2 text-app-text transition hover:border-trustBlue/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] lg:hidden"
          onClick={onToggleSidebar}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <BrandLogo width={148} alt="Nexus" />
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
        <div className="flex items-center gap-2 rounded-full border border-app-border bg-[color:var(--surface-elevated)] px-4 py-2 text-sm shadow-inner">
          <Command className="h-4 w-4 text-app-text opacity-60" aria-hidden="true" />
          <input
            id="global-search"
            name="global-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search debates or sessions"
            className="h-8 flex-1 bg-transparent text-app-text outline-none placeholder:text-app-text placeholder:opacity-60"
            aria-describedby="search-status"
            autoComplete="off"
          />
          <span id="search-status" className="flex items-center gap-1 text-xs text-app-text opacity-70" aria-live="polite">
            {status === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
            {status === "success" ? <Check className="h-3.5 w-3.5 text-trustBlue" aria-hidden="true" /> : null}
            {status === "error" ? <AlertTriangle className="h-3.5 w-3.5 text-silver" aria-hidden="true" /> : null}
            <span>{statusLabel}</span>
          </span>
        </div>
      </form>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="hidden rounded-full border border-trustBlue bg-trustBlue px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] lg:inline-flex"
        >
          Join Waitlist 
        </button>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-app-border text-app-text transition hover:border-trustBlue/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)]"
          aria-label="Open help"
        >
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </motion.header>
  );
}

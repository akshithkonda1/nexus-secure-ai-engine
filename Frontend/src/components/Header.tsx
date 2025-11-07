import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Menu, Search } from "lucide-react";

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
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-elevated/90 backdrop-blur lg:left-64"
    >
      <div className="flex h-16 items-center gap-6 px-4 text-white sm:px-6 lg:px-10">
        <div className="flex flex-1 items-center gap-4">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-transparent text-muted transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            onClick={onToggleSidebar}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex flex-col">
            <span className="text-xl font-semibold leading-none">Nexus</span>
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-muted">Beta</span>
          </div>
          <form
            onSubmit={handleSubmit}
            className="hidden flex-1 items-center gap-3 rounded-xl border border-white/10 bg-surface/80 px-3 py-2 text-sm text-muted shadow-inner focus-within:border-primary focus-within:text-white sm:flex"
            role="search"
            aria-label="Global search"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <label htmlFor="global-search" className="sr-only">
              Search debates or sessions
            </label>
            <input
              id="global-search"
              name="global-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Find sessions, documents, and telemetry"
              className="h-8 flex-1 bg-transparent text-sm text-white placeholder:text-muted focus:outline-none"
              aria-describedby="search-status"
              autoComplete="off"
            />
            <span id="search-status" className="text-xs text-muted">
              {statusLabel}
            </span>
          </form>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:inline-flex"
          >
            Join Waitlist
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-muted transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Open help"
          >
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="px-4 pb-3 sm:hidden">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-surface/80 px-3 py-2 text-sm text-muted shadow-inner"
          role="search"
        >
          <label htmlFor="global-search-mobile" className="sr-only">
            Search Nexus
          </label>
          <Search className="h-4 w-4" aria-hidden="true" />
          <input
            id="global-search-mobile"
            name="global-search-mobile"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search"
            className="h-8 flex-1 bg-transparent text-sm text-white placeholder:text-muted focus:outline-none"
            aria-describedby="search-status-mobile"
            autoComplete="off"
          />
          <span id="search-status-mobile" className="text-xs text-muted">
            {statusLabel}
          </span>
        </form>
      </div>
    </motion.header>
  );
}

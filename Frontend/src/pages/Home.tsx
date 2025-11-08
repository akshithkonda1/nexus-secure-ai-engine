import { ArrowUpRight, FolderKanban, PlayCircle, Settings, Upload } from "lucide-react";

const quickActions = [
  {
    title: "New session",
    description: "Spin up an AI copilot session in seconds with curated prompts.",
    icon: PlayCircle,
    accent: "from-accent/40 via-accent/20 to-transparent",
  },
  {
    title: "Import transcript",
    description: "Bring your existing chat history to continue seamlessly.",
    icon: Upload,
    accent: "from-emerald-400/30 via-emerald-400/10 to-transparent",
  },
  {
    title: "Templates",
    description: "Start from Script.app-inspired frameworks for faster workflows.",
    icon: FolderKanban,
    accent: "from-purple-500/35 via-purple-500/15 to-transparent",
  },
  {
    title: "Settings",
    description: "Tweak preferences, access providers, and manage the workspace.",
    icon: Settings,
    accent: "from-amber-400/35 via-amber-400/15 to-transparent",
  },
];

const recentSessions = [
  { name: "Growth strategy review", date: "2 hours ago" },
  { name: "Product launch sync", date: "Yesterday" },
  { name: "Customer transcript import", date: "2 days ago" },
  { name: "Quarterly metrics deep dive", date: "Last week" },
  { name: "R&D narrative planning", date: "Last week" },
];

const Home = () => {
  return (
    <div className="space-y-12">
      <section className="glass-card overflow-hidden p-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 text-center">
          <span className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-accent/40 bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-accent">
            Nexus BETA
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Welcome to Nexus.ai
          </h1>
          <p className="text-base leading-relaxed text-muted sm:text-lg">
            A scriptable command center where AI orchestration feels natural. Craft prompts, resume sessions,
            and manage provider intelligence within a polished workspace.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button type="button" className="pill-button bg-accent text-accent-foreground hover:bg-accent">
              Launch Console
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="pill-button border-dashed border-accent/40 bg-transparent text-accent hover:border-accent/60 hover:bg-accent/10"
            >
              Browse Templates
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map(({ title, description, icon: Icon, accent }) => (
          <article
            key={title}
            className={`surface-card group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-glow`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} aria-hidden="true" />
            <div className="relative flex h-full flex-col gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card/60 text-accent shadow-soft">
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted">{description}</p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-accent">
                Explore
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="surface-card p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Last 5 sessions</h2>
            <p className="text-sm text-muted">Jump back into ongoing conversations or analytics instantly.</p>
          </div>
          <button type="button" className="pill-button bg-card/60 hover:bg-accent hover:text-accent-foreground">
            View all sessions
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {recentSessions.map(({ name, date }) => (
            <div
              key={name}
              className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/60 px-5 py-4 shadow-soft transition hover:border-accent/40 hover:bg-card/80 hover:shadow-glow sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-base font-medium text-foreground">{name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">{date}</p>
              </div>
              <button type="button" className="pill-button bg-accent text-accent-foreground hover:bg-accent/90">
                Resume
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

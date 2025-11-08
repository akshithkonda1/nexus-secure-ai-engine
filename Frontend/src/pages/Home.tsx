import type { ComponentType, SVGProps } from "react";
import { ArrowUpRight, FolderKanban, PlayCircle, Settings, Upload } from "lucide-react";

type QuickAction = {
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  cta?: string;
  onClick?: () => void;
};

const quickActions: QuickAction[] = [
  {
    title: "New session",
    description: "Spin up an AI copilot session in seconds with curated prompts.",
    Icon: PlayCircle,
    cta: "Launch",
  },
  {
    title: "Import transcript",
    description: "Bring your existing chat history to continue seamlessly.",
    Icon: Upload,
    cta: "Upload",
  },
  {
    title: "Templates",
    description: "Start from Script.app-inspired frameworks for faster workflows.",
    Icon: FolderKanban,
    cta: "Browse",
  },
  {
    title: "Settings",
    description: "Tweak preferences, access providers, and manage the workspace.",
    Icon: Settings,
    cta: "Open",
  },
];

const recentSessions = [
  { name: "Growth strategy review", date: "2 hours ago" },
  { name: "Product launch sync", date: "Yesterday" },
  { name: "Customer transcript import", date: "2 days ago" },
  { name: "Quarterly metrics deep dive", date: "Last week" },
  { name: "R&D narrative planning", date: "Last week" },
];

function QuickCard({ title, description, cta, onClick, Icon }: QuickAction) {
  return (
    <div className="card group flex items-start gap-4 p-5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-glow">
      <div className="gradient-brand grid h-10 w-10 place-items-center rounded-xl text-white shadow-glow">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <h3 className="text-white/90 font-medium">{title}</h3>
        <p className="text-subtle text-sm leading-relaxed">{description}</p>
        {cta && (
          <button onClick={onClick} className="btn ghost mt-3 inline-flex px-3 py-1.5 text-sm">
            {cta}
          </button>
        )}
      </div>
    </div>
  );
}

const Home = () => {
  return (
    <div className="space-y-12">
      <section className="card relative overflow-hidden px-8 py-12 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="gradient-brand absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 blur-3xl" />
          <div className="gradient-brand absolute bottom-0 right-[-20%] h-80 w-80 blur-[140px]" />
        </div>
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6">
          <span className="badge">NEXUS BETA</span>
          <h1 className="text-4xl font-semibold tracking-tight text-white/90 sm:text-5xl">
            Welcome to Nexus.ai
          </h1>
          <p className="text-base leading-relaxed text-subtle sm:text-lg">
            A scriptable command center where AI orchestration feels natural. Craft prompts, resume sessions,
            and manage provider intelligence within a polished workspace.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button type="button" className="btn h-11 px-6 text-sm font-semibold">
              Launch Console
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </button>
            <button type="button" className="btn ghost h-11 px-6 text-sm font-semibold">
              Browse Templates
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <QuickCard key={action.title} {...action} />
        ))}
      </section>

      <section className="card p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white/90">Last 5 sessions</h2>
            <p className="text-sm text-subtle">
              Jump back into ongoing conversations or analytics instantly.
            </p>
          </div>
          <button type="button" className="btn ghost px-4 py-2 text-sm">
            View all sessions
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {recentSessions.map(({ name, date }) => (
            <div
              key={name}
              className="card flex flex-col gap-3 border border-border/10 px-5 py-4 transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-glow sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-base font-medium text-white/90">{name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-subtle">{date}</p>
              </div>
              <button type="button" className="btn px-4 py-2 text-sm">
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

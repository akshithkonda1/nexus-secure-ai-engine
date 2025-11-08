import {
  ArrowRight,
  ChevronRight,
  FileText,
  History,
  Layers,
  MessageCircle,
  Upload
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    title: "Start a conversation",
    description: "Launch a fresh multi-model session and compare answers in real time.",
    to: "/chat",
    icon: MessageCircle
  },
  {
    title: "Build a template",
    description: "Design reusable debate prompts tailored for your workflows.",
    to: "/templates",
    icon: Layers
  },
  {
    title: "Sync a document",
    description: "Import briefs, policies, or research to ground responses.",
    to: "/documents",
    icon: FileText
  },
  {
    title: "Review history",
    description: "Audit past sessions, annotations, and compare model takes.",
    to: "/history",
    icon: History
  }
];

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 pt-10 xl:space-y-16">
      <section className="home-hero shadow-card">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:gap-16 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="flex flex-col gap-7">
            <span className="home-hero-badge">
              <ChevronRight className="h-3.5 w-3.5" /> Nexus Hub
            </span>
            <div className="space-y-5 text-balance">
              <h1 className="text-4xl font-semibold tracking-tight text-[rgb(var(--text))] sm:text-5xl xl:text-6xl">
                Welcome to Nexus
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-[rgb(var(--text)/0.78)] sm:text-lg">
                Orchestrate multi-model debates, keep knowledge synchronised, and move and
                think with more certainty.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button type="button" className="btn" onClick={() => navigate("/chat")}>
                Chat with Nexus <ArrowRight className="h-4.5 w-4.5" />
              </button>
              <button type="button" className="btn-glass" onClick={() => navigate("/documents")}>
                Upload knowledge <Upload className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
          <div className="grid gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.title}
                  className="home-highlight text-left"
                  type="button"
                  onClick={() => navigate(feature.to)}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand)]/18 text-[color:var(--brand)] shadow-soft dark:bg-[color:var(--brand)]/28">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[rgb(var(--text))] sm:text-base">
                        {feature.title}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-[rgb(var(--text)/0.72)]">
                        {feature.description}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--brand)]">
                        Explore <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-7 md:grid-cols-2 xl:grid-cols-4 xl:gap-8">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.title}
              className="panel group text-left px-6 py-6 transition-shadow hover:shadow-card xl:px-7 xl:py-7"
              type="button"
              onClick={() => navigate(feature.to)}
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--brand)] text-white">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="text-base font-medium text-[rgb(var(--text))]">{feature.title}</div>
              <div className="mt-1 text-sm leading-relaxed text-[rgb(var(--subtle))]">{feature.description}</div>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--brand)] opacity-0 transition group-hover:opacity-100">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </section>

      <section className="panel px-9 py-9 text-[rgb(var(--text)/0.8)] xl:px-12 xl:py-12">
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Nexus Control Center</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed">
          Customize your workspace, manage team access, and ensure every debate remains auditable. The settings area lets you
          connect data sources, configure model defaults, and toggle security guardrails without leaving your flow.
        </p>
        <button type="button" className="btn-secondary mt-6" onClick={() => navigate("/settings")}>
          Open settings <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
}

export default Home;

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
    <div className="space-y-16 pt-14 xl:space-y-20">
      <section className="home-hero shadow-card">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] xl:gap-20 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
          <div className="flex flex-col gap-9">
            <span className="home-hero-badge">
              <ChevronRight className="h-3.5 w-3.5" /> Nexus Hub
            </span>
            <div className="space-y-6 text-balance">
              <h1 className="text-4xl font-semibold tracking-tight text-[rgb(var(--text))] sm:text-[2.85rem] xl:text-6xl">
                Welcome to Nexus
              </h1>
              <p className="max-w-2xl text-[1.04rem] leading-relaxed text-[rgb(var(--text)/0.78)] sm:text-lg">
                Orchestrate multi-model debates, keep knowledge synchronised, and move and think with more
                certainty.
              </p>
            </div>
            <div className="flex flex-wrap gap-5">
              <button type="button" className="btn" onClick={() => navigate("/chat")}>
                Chat with Nexus <ArrowRight className="h-4.5 w-4.5" />
              </button>
              <button type="button" className="btn-glass" onClick={() => navigate("/documents")}>
                Upload knowledge <Upload className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
          <div className="grid gap-5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.title}
                  className="home-highlight text-left"
                  type="button"
                  onClick={() => navigate(feature.to)}
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--brand)]/18 text-[color:var(--brand)] shadow-soft dark:bg-[color:var(--brand)]/28">
                      <Icon className="h-[1.35rem] w-[1.35rem]" />
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[rgb(var(--text))] sm:text-[1.05rem]">
                        {feature.title}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text)/0.72)] sm:text-[0.95rem]">
                        {feature.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--brand)]">
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

      <section className="grid gap-8 md:grid-cols-2 xl:grid-cols-4 xl:gap-10">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.title}
              className="panel group text-left px-7 py-7 transition-shadow hover:shadow-card xl:px-8 xl:py-8"
              type="button"
              onClick={() => navigate(feature.to)}
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--brand)] text-white">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="text-base font-medium text-[rgb(var(--text))]">{feature.title}</div>
              <div className="mt-2 text-sm leading-relaxed text-[rgb(var(--subtle))]">{feature.description}</div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--brand)] opacity-0 transition group-hover:opacity-100">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </section>

      <section className="panel px-12 py-12 text-[rgb(var(--text)/0.8)] xl:px-16 xl:py-16">
        <h2 className="text-xl font-semibold text-[rgb(var(--text))] sm:text-2xl">Nexus Control Center</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed sm:text-base">
          Customize your workspace, manage team access, and ensure every debate remains auditable. The settings area lets you connect
          data sources, configure model defaults, and toggle security guardrails without leaving your flow.
        </p>
        <button type="button" className="btn-secondary mt-8" onClick={() => navigate("/settings")}>
          Open settings <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
}

export default Home;

import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  GitBranch,
  History,
  Layers,
  Link2,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const quickActions = [
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
    description: "Audit prior sessions, annotations, and model rationales.",
    to: "/history",
    icon: History
  }
];

const workspaceTracks = [
  {
    title: "Template spotlight",
    summary: "Pin the most effective prompts for your analysts.",
    to: "/templates",
    checklist: ["Surface trending templates", "Assign owners", "Schedule refresh cadences"],
    accent: "from-sky-500/20 via-sky-400/15 to-transparent"
  },
  {
    title: "Knowledge vault",
    summary: "Keep your corpus synchronized with automated ingest.",
    to: "/documents",
    checklist: ["Batch upload documents", "Tag sensitive material", "Enable nightly sync"],
    accent: "from-violet-500/20 via-purple-400/15 to-transparent"
  },
  {
    title: "Operational guardrails",
    summary: "Tune safety, access, and compliance settings.",
    to: "/settings",
    checklist: ["Configure redaction rules", "Manage user roles", "Set rate limits"],
    accent: "from-emerald-500/20 via-emerald-400/15 to-transparent"
  }
];

const timeline = [
  {
    title: "Resume strategic brief",
    meta: "Continue the last session to align the final answer.",
    to: "/history",
    action: "Open session"
  },
  {
    title: "Upload Q4 policy pack",
    meta: "Ground upcoming debates with the latest documentation.",
    to: "/documents",
    action: "Upload files"
  },
  {
    title: "Draft template rollout",
    meta: "Share curated prompts with your workspace.",
    to: "/templates",
    action: "Create plan"
  }
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-10 pb-16 pt-6">
      <motion.section
        layout
        className="relative overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.4)] bg-white/80 px-8 py-12 shadow-card backdrop-blur dark:border-white/10 dark:bg-[#0b0f16]/80"
      >
        <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--brand)]/40 bg-[color:var(--brand)]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand)]">
              <Sparkle className="h-4 w-4" /> Nexus hub
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--text))] sm:text-4xl">
              Welcome to your Nexus workspace
            </h1>
            <p className="text-base leading-relaxed text-[rgb(var(--text)/0.65)]">
              Orchestrate multi-model debates, keep knowledge synchronized, and move from idea to approved deliverable with clarity.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="btn" onClick={() => navigate("/chat")}>
                Launch studio <ArrowRight className="h-4.5 w-4.5" />
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("/documents")}>
                Upload knowledge <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
          <div className="grid w-full max-w-md gap-4">
            {quickActions.slice(0, 3).map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.title}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(action.to)}
                  className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-left text-sm shadow-card transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] dark:border-white/10 dark:bg-white/5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <div className="font-medium text-[rgb(var(--text))]">{action.title}</div>
                    <div className="text-xs text-[rgb(var(--text)/0.65)]">{action.description}</div>
                  </span>
                  <ArrowRight className="h-4 w-4 text-[rgb(var(--text)/0.35)]" />
                </motion.button>
              );
            })}
          </div>
        </div>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-24 h-72 w-72 rounded-full bg-[color:var(--brand)]/30 blur-[120px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 0.6 }}
        />
      </motion.section>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.title}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(action.to)}
              className="panel group flex h-full flex-col justify-between gap-4 p-5 text-left transition-shadow hover:shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--brand)]/12 text-[color:var(--brand)] group-hover:bg-[color:var(--brand)] group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-[rgb(var(--text))]">{action.title}</h2>
                <p className="text-sm leading-relaxed text-[rgb(var(--text)/0.6)]">{action.description}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--brand)]">
                Explore <ArrowRight className="h-4 w-4" />
              </span>
            </motion.button>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {workspaceTracks.map((track) => (
          <motion.article
            key={track.title}
            whileHover={{ y: -3 }}
            className="panel relative overflow-hidden p-6"
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${track.accent}`} />
            <div className="relative z-10 flex h-full flex-col gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white dark:border-white/20 dark:text-white">
                <GitBranch className="h-4 w-4" /> Track
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[rgb(var(--text))] dark:text-white">{track.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--text)/0.65)] dark:text-white/70">{track.summary}</p>
              </div>
              <ul className="flex flex-1 flex-col gap-2 text-sm text-[rgb(var(--text)/0.6)] dark:text-white/70">
                {track.checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--brand)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate(track.to)}
                className="inline-flex items-center justify-start gap-2 text-sm font-semibold text-[rgb(var(--text))] transition hover:text-[color:var(--brand)] dark:text-white"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <motion.div className="panel h-full p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[rgb(var(--text)/0.55)]">
            <Link2 className="h-4 w-4 text-[color:var(--brand)]" /> Workflow timeline
          </div>
          <div className="space-y-4">
            {timeline.map((item) => (
              <motion.button
                key={item.title}
                whileHover={{ x: 4 }}
                onClick={() => navigate(item.to)}
                className="flex w-full items-center justify-between rounded-2xl border border-transparent bg-white/60 px-4 py-3 text-left transition hover:border-[color:var(--brand)] hover:bg-white dark:bg-white/5"
              >
                <div>
                  <div className="text-sm font-semibold text-[rgb(var(--text))]">{item.title}</div>
                  <div className="text-xs text-[rgb(var(--text)/0.6)]">{item.meta}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--brand)]">
                  {item.action} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div className="panel h-full p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[rgb(var(--text)/0.55)]">
            <Settings className="h-4 w-4 text-[color:var(--brand)]" /> Quick configuration
          </div>
          <div className="space-y-4 text-sm text-[rgb(var(--text)/0.7)]">
            <p>
              Keep your workspace aligned by reviewing access controls, ensuring sensitive documents stay private, and scheduling automatic clean-up of stale debates.
            </p>
            <div className="grid gap-3">
              <button
                onClick={() => navigate("/settings")}
                className="flex items-center justify-between rounded-2xl border border-transparent bg-white/60 px-4 py-3 text-left text-sm font-semibold transition hover:border-[color:var(--brand)] hover:bg-white dark:bg-white/5"
              >
                Manage workspace <ArrowRight className="h-4 w-4 text-[color:var(--brand)]" />
              </button>
              <button
                onClick={() => navigate("/history")}
                className="flex items-center justify-between rounded-2xl border border-transparent bg-white/60 px-4 py-3 text-left text-sm font-semibold transition hover:border-[color:var(--brand)] hover:bg-white dark:bg-white/5"
              >
                Review audit trail <ArrowRight className="h-4 w-4 text-[color:var(--brand)]" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

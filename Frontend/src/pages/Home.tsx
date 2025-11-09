import {
  ArrowRight,
  ChevronRight,
  FileText,
  History,
  Layers,
  MessageCircle,
  Upload
} from "lucide-react";
import { motion } from "framer-motion";
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

const sectionMotion = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      <motion.section
        className="card p-10"
        initial="hidden"
        animate="visible"
        variants={sectionMotion}
      >
        <div className="flex flex-col gap-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--panel))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[color:rgba(var(--text)/0.65)]">
            <ChevronRight className="h-3 w-3" /> Nexus Hub
          </span>
          <div className="space-y-5 text-balance">
            <h1 className="text-4xl font-semibold tracking-tight">Welcome to Nexus</h1>
            <p className="max-w-2xl text-[color:rgba(var(--text)/0.75)]">
              Orchestrate multi-model debates, keep knowledge synchronised, and move and think with more certainty.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <motion.button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--elev-1)]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/chat")}
            >
              Chat with Nexus <ArrowRight className="h-4 w-4" />
            </motion.button>
            <motion.button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-4 py-2 text-sm font-semibold text-[rgb(var(--text))]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/documents")}
            >
              Upload knowledge <Upload className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="grid gap-6 md:grid-cols-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } }
        }}
      >
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.button
              key={feature.title}
              variants={sectionMotion}
              className="card card-hover flex flex-col gap-4 p-6 text-left"
              type="button"
              onClick={() => navigate(feature.to)}
              whileHover={{ y: -4 }}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand)]/15 text-[color:var(--brand)]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-[color:rgba(var(--text)/0.7)]">{feature.description}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--brand)]">
                Explore <ArrowRight className="h-3 w-3" />
              </span>
            </motion.button>
          );
        })}
      </motion.section>

      <motion.section
        className="card p-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionMotion}
      >
        <h2 className="text-xl font-semibold tracking-tight">Nexus Control Center</h2>
        <p className="mt-4 max-w-3xl text-sm text-[color:rgba(var(--text)/0.75)]">
          Customize your workspace, manage team access, and ensure every debate remains auditable. The settings area lets you connect data sources, configure model defaults, and toggle security guardrails without leaving your flow.
        </p>
        <motion.button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-4 py-2 text-sm font-semibold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/settings")}
        >
          Explore settings <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.section>
    </div>
  );
}

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
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.04 }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
};

export function Home() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f9fafe] via-[#f1f3ff] to-[#e8ecff] dark:from-[#0b0f17] dark:via-[#121825] dark:to-[#1b2233]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(160%_140%_at_0%_0%,rgba(94,151,255,0.12),transparent_60%)] dark:bg-[radial-gradient(150%_120%_at_0%_0%,rgba(94,151,255,0.18),transparent_68%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-[var(--page-padding)] pb-[min(12vh,8rem)] pt-20">
        <motion.section
          className="home-hero shadow-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] xl:gap-20">
            <div className="flex flex-col gap-10">
              <span className="home-hero-badge">
                <ChevronRight className="h-3.5 w-3.5" /> Nexus Hub
              </span>
              <div className="space-y-7 text-balance">
                <h1 className="text-4xl font-semibold tracking-tight text-[rgb(var(--text))] sm:text-[2.85rem] xl:text-6xl">
                  Welcome to Nexus
                </h1>
                <p className="max-w-2xl text-[1.06rem] leading-relaxed text-[rgb(var(--text)/0.78)] sm:text-lg">
                  Orchestrate multi-model debates, keep knowledge synchronised, and move and think with more
                  certainty.
                </p>
              </div>
              <div className="flex flex-wrap gap-5">
                <motion.button
                  type="button"
                  className="btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/chat")}
                >
                  Chat with Nexus <ArrowRight className="h-4.5 w-4.5" />
                </motion.button>
                <motion.button
                  type="button"
                  className="btn-glass"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/documents")}
                >
                  Upload knowledge <Upload className="h-4.5 w-4.5" />
                </motion.button>
              </div>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-5"
            >
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.button
                    key={feature.title}
                    variants={staggerItem}
                    className="home-highlight text-left"
                    type="button"
                    onClick={() => navigate(feature.to)}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
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
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="grid gap-[var(--card-gap)] pt-[calc(var(--section-gap)/2)] md:grid-cols-2 xl:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.button
                key={feature.title}
                variants={staggerItem}
                className="group rounded-[calc(var(--radius-xl)*1.1)] bg-white/70 px-8 py-9 text-left shadow-soft backdrop-blur-xl transition-all duration-300 hover:shadow-glow hover:scale-[1.015] dark:bg-[#0d111a]/80"
                type="button"
                onClick={() => navigate(feature.to)}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--brand)] text-white shadow-soft">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="text-base font-semibold text-[rgb(var(--text))]">{feature.title}</div>
                <div className="mt-3 text-sm leading-relaxed text-[rgb(var(--subtle))]">{feature.description}</div>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--brand)] opacity-0 transition-all duration-300 group-hover:opacity-100">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </motion.button>
            );
          })}
        </motion.section>

        <motion.section
          className="panel mt-[var(--section-gap)] px-12 py-14 text-[rgb(var(--text)/0.8)] xl:px-16 xl:py-16"
          variants={sectionMotion}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <h2 className="text-xl font-semibold tracking-tight text-[rgb(var(--text))] sm:text-2xl">
            Nexus Control Center
          </h2>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed sm:text-base">
            Customize your workspace, manage team access, and ensure every debate remains auditable. The
            settings area lets you connect data sources, configure model defaults, and toggle security
            guardrails without leaving your flow.
          </p>
          <motion.button
            type="button"
            className="btn-secondary mt-10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/settings")}
          >
            Open settings <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.section>
      </div>
    </main>
  );
}

export default Home;

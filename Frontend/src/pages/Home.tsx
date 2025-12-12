import { SlideUp } from "@/components/animations/SlideUp";
import { motion } from "framer-motion";
import { useTheme } from "@/theme/useTheme";

const sections = [
  {
    title: "Why Ryuzen Exists",
    paragraphs: [
      "Most AI systems optimize for speed, engagement, and output.",
      "Ryuzen is built around a different assumption: that intelligence without understanding eventually breaks trust.",
      "We believe people deserve to know how intelligence is applied, why conclusions are reached, and what role AI plays in shaping their decisions.",
      "Trust is not something you patch in later. It has to be present from the first design choice.",
    ],
  },
  {
    title: "ALOE Framework",
    paragraphs: [
      "ALOE (AI as a Life Orchestration Engine) is a first-of-its-kind framework that treats AI as a coordinated system designed to support real human goals, decisions, and long-term context.",
      "Instead of reacting to isolated prompts, ALOE aligns intelligence across reasoning, work, and responsibility.",
      "This approach prioritizes understanding over output.",
    ],
  },
  {
    title: "Toron",
    paragraphs: [
      "Toron is Ryuzen’s reasoning engine.",
      "Rather than relying on a single model, Toron evaluates and synthesizes intelligence across multiple AI systems, traditional search engines, and deep reasoning models — reducing error, bias, and overconfidence.",
      "It is designed to question itself before answering you.",
    ],
  },
  {
    title: "Workspace",
    paragraphs: [
      "Workspace is where thinking turns into progress.",
      "It brings documents, ideas, and tasks together alongside Toron’s intelligence — designed for sustained focus, real work, and calm productivity.",
      "It’s built around how people actually think and work — with moments of clarity, uncertainty, and momentum.",
      "AI supports the work without taking control.",
      "Your work remains yours.",
    ],
  },
  {
    title: "Designed for Transparency",
    paragraphs: [
      "Ryuzen is built so you can tell when AI is involved, how it’s being used, and why it behaves the way it does.",
      "No silent automation.",
      "No hidden reasoning.",
      "No unexplained outcomes.",
      "Ryuzen only uses the data you choose to provide, and it is designed so that your work and context are never quietly lost or overwritten.",
      "We do not sell user data.",
      "We sell anonymized system telemetry — performance signals that help improve reliability, safety, and accuracy without exposing personal information.",
      "Transparency isn’t a policy layer.",
      "It’s built into how the system works.",
    ],
  },
];

export default function Home() {
  const { resolvedTheme } = useTheme();

  const heroGradient =
    resolvedTheme === "dark"
      ? "from-cyan-400/20 via-purple-500/20 to-emerald-400/10"
      : "from-emerald-500/25 via-purple-500/20 to-cyan-400/20";

  return (
    <div className="space-y-10 pb-20">
      <SlideUp className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_96%,transparent)] p-10 shadow-[0_20px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${heroGradient} opacity-90 pointer-events-none`}
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="relative flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2 text-left">
            <p className="text-xs uppercase tracking-[0.30em] text-[var(--text-secondary)] drop-shadow">Ryuzen</p>
            <h1 className="text-4xl md:text-5xl font-semibold text-[var(--text-primary)] leading-tight drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
              A platform for working with AI you can understand and trust.
            </h1>
          </div>

          <div className="max-w-3xl space-y-4 text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
            <p>Ryuzen is built for people who want more than fast answers.</p>
            <p>
              It helps you think, work, and make decisions with AI systems that are transparent, deliberate, and aligned with human intent.
            </p>
            <p>Nothing here acts blindly.</p>
            <p>Nothing happens without context.</p>
          </div>

          <div className="flex flex-wrap gap-4 pt-3">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 14px 50px rgba(52,224,161,0.40)",
              }}
              whileTap={{ scale: 0.97 }}
              className="relative flex items-center gap-2 rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--accent-secondary)_40%,transparent)]
                         px-6 py-3 text-sm md:text-base font-semibold text-[var(--text-primary)]
                         shadow-[0_12px_40px_rgba(124,93,255,0.25)] backdrop-blur-lg transition-all"
            >
              Explore Ryuzen
              <span
                className="absolute inset-0 -z-10 rounded-2xl bg-[color-mix(in_srgb,var(--accent-primary)_32%,transparent)] blur-xl opacity-70"
                aria-hidden
              />
            </motion.button>
          </div>
        </motion.div>
      </SlideUp>

      <div className="grid gap-6">
        {sections.map((section, index) => (
          <SlideUp
            key={section.title}
            className="rounded-3xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-8 shadow-[0_12px_40px_rgba(0,0,0,0.24)]"
          >
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{section.title}</h2>
              <div className="space-y-3 text-base text-[var(--text-secondary)] leading-relaxed">
                {section.paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          </SlideUp>
        ))}
      </div>
    </div>
  );
}

import { SlideUp } from "@/components/animations/SlideUp";
import { motion } from "framer-motion";
import { useTheme } from "@/theme/useTheme";

const sections = [
  {
    title: "What is Ryuzen",
    paragraphs: [
      "Ryuzen is an intelligence system built to be understood. It keeps reasoning visible, respects human judgment, and safeguards context across every interaction.",
      "The interface is calm on purpose: nothing competes with your thinking, and every surface is aware of the theme you choose.",
    ],
  },
  {
    title: "Why Ryuzen Exists",
    paragraphs: [
      "Most AI systems optimize for speed, engagement, and output. Ryuzen is built around a different assumption: intelligence without understanding eventually breaks trust.",
      "People deserve to know how intelligence is applied, why conclusions are reached, and what role AI plays in shaping their decisions.",
      "Trust is not patched in later. It is present from the first design choice.",
    ],
  },
  {
    title: "ALOE Framework",
    paragraphs: [
      "ALOE (AI as a Life Orchestration Engine) treats AI as a coordinated system designed to support real human goals, decisions, and long-term context.",
      "Instead of reacting to isolated prompts, ALOE aligns intelligence across reasoning, work, and responsibility, prioritizing understanding over output.",
    ],
  },
  {
    title: "Toron",
    paragraphs: [
      "Toron is Ryuzen’s reasoning engine. It evaluates and synthesizes intelligence across multiple AI systems, traditional search, and deep reasoning models to reduce error, bias, and overconfidence.",
      "It is designed to question itself before answering you — preserving the deliberate chat layout, bubbles, composer, and sessions you already use.",
    ],
  },
  {
    title: "Workspace",
    paragraphs: [
      "Workspace is where thinking turns into progress. It keeps the central canvas, widgets, and glass bottom bar intact while ensuring perfect light and dark fidelity.",
      "Documents, ideas, and tasks stay together alongside Toron’s intelligence for calm, sustained focus.",
    ],
  },
  {
    title: "Designed for Transparency",
    paragraphs: [
      "Ryuzen is built so you can tell when AI is involved, how it’s being used, and why it behaves the way it does. No silent automation. No hidden reasoning.",
      "We only use the data you choose to provide. System telemetry is anonymized to improve reliability, safety, and accuracy without exposing personal information.",
      "Transparency isn’t a policy layer. It’s built into how the system works.",
    ],
  },
];

export default function Home() {
  const { resolvedTheme } = useTheme();

  const heroGradient =
    resolvedTheme === "dark"
      ? "from-cyan-400/12 via-purple-500/14 to-emerald-400/10"
      : "from-emerald-500/18 via-purple-500/16 to-cyan-400/18";

  return (
    <div className="space-y-10 pb-20">
      <SlideUp className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_96%,transparent)] p-10 shadow-[0_20px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${heroGradient} opacity-90 pointer-events-none`}
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="flex max-w-3xl flex-col gap-3 text-left">
            <p className="text-xs uppercase tracking-[0.30em] text-[var(--text-secondary)] drop-shadow">Ryuzen</p>
            <h1 className="text-4xl font-semibold leading-tight text-[var(--text-primary)] drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)] md:text-5xl">
              A calm surface for deliberate intelligence you can trust.
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
              Home is a narrative anchor. It explains what Ryuzen is, why it exists, and how the system stays transparent while keeping the cosmic identity intact. No chat, no widgets — just clarity.
            </p>
          </div>

          <div className="relative flex items-center gap-3 rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_86%,transparent)] px-4 py-4 text-sm text-[var(--text-secondary)] shadow-[0_12px_40px_rgba(0,0,0,0.24)]">
            <div className="relative h-12 w-12 rounded-xl bg-[color-mix(in_srgb,var(--accent-primary)_18%,transparent)]">
              <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_40%,rgba(124,93,255,0.45),transparent_60%)] blur-xl" aria-hidden />
              <span className="relative z-10 flex h-full items-center justify-center text-lg font-semibold text-[var(--text-primary)]">OS</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Pages</span>
              <span className="text-[var(--text-primary)]">Home · Toron · Workspace · Projects · Documents · History · Settings</span>
            </div>
          </div>
        </motion.div>
      </SlideUp>

      <div className="grid gap-6 lg:grid-cols-3">
        {sections.map((section, index) => (
          <SlideUp
            key={section.title}
            className="rounded-3xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.22)]"
          >
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="space-y-3"
            >
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">{section.title}</h2>
              <div className="space-y-3 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
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

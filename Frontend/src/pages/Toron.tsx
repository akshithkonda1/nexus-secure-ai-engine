import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { SlideUp } from "@/components/animations/SlideUp";
import { useTheme } from "@/theme/useTheme";
import { useUI } from "@/state/ui";

/* ---------------------------------------------------
   NEURAL LOAD WAVEFORM (animated heat signature)
----------------------------------------------------*/
function NeuralWaveform() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: [0.3, 0.9, 0.3],
      height: ["16px", "42px", "16px"],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    });
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        animate={controls}
        className="w-full max-w-lg"
        style={{
          height: "22px",
          borderRadius: "999px",
          background:
            "linear-gradient(90deg, rgba(0,200,255,0.4), rgba(200,120,255,0.35), rgba(0,200,255,0.4))",
          filter: "blur(22px)",
        }}
      />
    </div>
  );
}

/* ---------------------------------------------------
   AGENT ORBITAL BUBBLES
----------------------------------------------------*/
function FloatingAgents() {
  const { resolvedTheme } = useTheme();

  const tones =
    resolvedTheme === "dark"
      ? ["#6EE7B7", "#93C5FD", "#C4B5FD"]
      : ["#0EA5E9", "#A855F7", "#10B981"];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {tones.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{
            opacity: [0.25, 0.9, 0.25],
            scale: [0.7, 1.1, 0.7],
            x: [0, i % 2 ? 35 : -35, 0],
            y: [0, i % 2 ? -35 : 35, 0],
          }}
          transition={{
            duration: 6 + i * 1.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: c,
            filter: "blur(2px)",
          }}
          className="absolute left-1/2 top-1/2"
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------
   PIPELINE FLOW EFFECT
----------------------------------------------------*/
function PipelineFlow() {
  return (
    <motion.div
      className="absolute inset-0 opacity-20 pointer-events-none"
      animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
      transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(56,189,248,0.25), rgba(147,51,234,0.2), rgba(56,189,248,0.25))",
        backgroundSize: "300% 100%",
      }}
    />
  );
}

/* ---------------------------------------------------
   MAIN PAGE
----------------------------------------------------*/
export default function Toron() {
  const { resolvedTheme } = useTheme();
  const { openCommandCenter } = useUI();

  const bgGrad =
    resolvedTheme === "dark"
      ? "from-[#92CFFF]/10 via-[#CBA7FF]/10 to-[#A0FFD7]/10"
      : "from-[#D1FFF6]/40 via-[#F0E1FF]/35 to-[#CAFFF1]/35";

  const tiles = [
    {
      title: "Neural Load",
      desc: "Engine heat & model tension",
      emoji: "🧠",
      ornamental: <NeuralWaveform />,
    },
    {
      title: "Queue",
      desc: "Incoming Toron tasks",
      emoji: "🌀",
    },
    {
      title: "Agents",
      desc: "Autonomous model units",
      emoji: "🤖",
      ornamental: <FloatingAgents />,
    },
    {
      title: "Pipelines",
      desc: "Flow states & triggers",
      emoji: "🔗",
      ornamental: <PipelineFlow />,
    },
    {
      title: "Projects",
      desc: "Long-term context storage",
      emoji: "📦",
    },
  ];

  return (
    <div className="space-y-10 mb-20">
      {/* HEADER */}
      <SlideUp className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${bgGrad} pointer-events-none`}
        />

        <div className="relative">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
            Toron Operations
          </p>

          <h1 className="text-4xl font-semibold text-[var(--text-primary)] leading-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
            Mission Control
          </h1>

          <p className="max-w-2xl text-[var(--text-secondary)] text-sm pt-2">
            All model-fusion operations, queues, agents, and pipelines live
            here. This panel updates dynamically as Toron evolves.
          </p>
        </div>

        <div className="pt-6">
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 10px 30px rgba(56,189,248,0.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={openCommandCenter}
            className="rounded-xl px-6 py-3 text-sm font-semibold border border-[var(--border-strong)] 
            bg-[color-mix(in_srgb,var(--accent-secondary)_32%,transparent)] text-[var(--text-primary)] 
            shadow-[0_12px_40px_rgba(124,93,255,0.25)] backdrop-blur-md"
          >
            Open Command Center
          </motion.button>
        </div>
      </SlideUp>

      {/* GRID */}
      <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t, index) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 * index, ease: "easeOut" }}
            className="relative"
          >
            <SlideUp className="relative overflow-hidden rounded-2xl border border-[var(--border-soft)] 
            bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] 
            p-6 shadow-[0_16px_40px_rgba(0,0,0,0.22)] h-40">
              {t.ornamental}

              <p className="text-xs uppercase tracking-[0.26em] text-[var(--text-secondary)]">
                {t.title}
              </p>

              <div className="pt-1 flex items-center gap-2">
                <span className="text-xl">{t.emoji}</span>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {t.title}
                </h2>
              </div>

              <p className="text-sm text-[var(--text-secondary)] pt-1">{t.desc}</p>
            </SlideUp>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

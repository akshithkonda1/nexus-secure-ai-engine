import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function RyuzenCommandCenterOverlay({ onClose }) {
  console.log("Overlay Loaded Successfully");
  return (
    <div
      className="
        fixed inset-0 bg-black/40 backdrop-blur-3xl
        flex justify-center items-center p-4 z-50
      "
    >
      <div
        className="
          relative w-[95%] h-[85%]
          bg-gradient-to-b from-[#0b0f17]/70 to-[#03050a]/70
          rounded-2xl border border-white/10
          shadow-[0_20px_60px_rgba(0,0,0,0.8)]
          overflow-hidden
        "
      >
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 text-white/40
            hover:text-white/90 transition z-[99]
          "
        >
          <X size={24} />
        </button>

        <ToronGrid>

const panels = [
  { title: "Neural Load", body: "Model orchestration heat" },
  { title: "Pipelines", body: "Flow states & triggers" },
  { title: "Connectors", body: "Live integrations" },
  { title: "Workspace", body: "Quick context sync" },
  { title: "Telemetry", body: "Signal health" },
  { title: "Resume Project", body: "Jump back into focus" },
];

export function RyuzenCommandCenterOverlay() {
  const { isCommandCenterOpen, closeCommandCenter } = useUI();
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCommandCenter();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [closeCommandCenter]);

  return (
    <AnimatePresence>
      {isCommandCenterOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCommandCenter}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(124,93,255,0.26),transparent_55%),radial-gradient(circle_at_30%_70%,rgba(34,211,238,0.24),transparent_52%)] blur-2xl" />
          <motion.div
            ref={gridRef}
            className="relative w-[min(1160px,95vw)] overflow-hidden rounded-[32px] border border-[color-mix(in_srgb,var(--accent-secondary)_35%,transparent)] bg-[color-mix(in_srgb,var(--panel-elevated)_94%,transparent)] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)]"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.28, ease: "easeOut" } }}
            exit={{ scale: 0.94, opacity: 0, transition: { duration: 0.2 } }}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.25),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(124,93,255,0.38),transparent_34%),radial-gradient(circle_at_40%_80%,rgba(34,197,94,0.18),transparent_32%)] opacity-80" />
            <div className="relative flex items-center justify-between pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Ryuzen Command Center</p>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">PS5-grade control room</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={closeCommandCenter}
                className="rounded-full border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-strong)_88%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
              >
                Close
              </motion.button>
            </div>

            <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {panels.map((panel) => (
                <CommandCenterPanel key={panel.title} title={panel.title} body={panel.body} dragContainer={gridRef} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CommandCenterPanel({
  title,
  body,
  dragContainer,
}: {
  title: string;
  body: string;
  dragContainer: React.RefObject<HTMLDivElement>;
}) {
  return (
    <motion.div
      drag
      dragConstraints={dragContainer}
      dragElastic={0.12}
      dragMomentum={false}
      whileTap={{ cursor: "grabbing" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="group relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_90%,transparent)] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.4)]"
    >
      <motion.div
        className="absolute inset-0 opacity-0 transition group-hover:opacity-100"
        animate={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(124,93,255,0.22), transparent 55%), radial-gradient(circle at 80% 20%, rgba(34,211,238,0.18), transparent 45%)",
        }}
      />
      <div className="relative flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-2xl bg-[color-mix(in_srgb,var(--accent-secondary)_28%,transparent)]" />
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">{title}</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{body}</p>
          </div>
        </div>
        <motion.span
          className="h-2 w-12 rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_55%,transparent)]"
          animate={{ scaleX: [1, 0.8, 1.05, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <p className="relative text-sm text-[var(--text-secondary)]">
        Holographic blur, adaptive glow, and drag physics keep your workflow suspended like a console carousel. Drop panels to
        snap their state.
      </p>
    </motion.div>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { useToronStore } from "@/state/toron/toronStore";

type ToronProjectsModalProps = {
  open: boolean;
  onClose: () => void;
};

type ProjectMeta = {
  id: string;
  name: string;
};

const META_KEY = "toron:projects:meta";

function loadProjects(): ProjectMeta[] {
  if (typeof window === "undefined") return [{ id: "default", name: "Default Project" }];
  try {
    const saved = localStorage.getItem(META_KEY);
    if (!saved) return [{ id: "default", name: "Default Project" }];
    const parsed = JSON.parse(saved) as ProjectMeta[];
    return parsed.length ? parsed : [{ id: "default", name: "Default Project" }];
  } catch (error) {
    console.error("Failed to load project metadata", error);
    return [{ id: "default", name: "Default Project" }];
  }
}

export function ToronProjectsModal({ open, onClose }: ToronProjectsModalProps) {
  const { activeProjectId, setProject, deleteProject } = useToronStore();
  const [projects, setProjects] = useState<ProjectMeta[]>(() => loadProjects());

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(META_KEY, JSON.stringify(projects));
  }, [projects]);

  const handleCreate = () => {
    const id = `project-${Date.now()}`;
    const nextIndex = projects.length + 1;
    const meta = { id, name: `Project ${nextIndex}` };
    setProjects((prev) => [...prev, meta]);
    setProject(id);
  };

  const handleRename = (id: string, name: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const handleDelete = (id: string) => {
    if (projects.length === 1) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    deleteProject(id);
  };

  const modalBg = useMemo(
    () => ({
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
    }),
    [],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-lg rounded-3xl border border-white/20 bg-white/80 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-slate-900/80"
            style={modalBg}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Projects</div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">Long-term contexts</h3>
              </div>
              <button
                onClick={handleCreate}
                className="rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 px-3 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(59,130,246,0.35)] transition hover:-translate-y-0.5"
              >
                + New
              </button>
            </div>

            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-center justify-between rounded-2xl border border-white/20 bg-white/60 px-4 py-3 shadow-inner transition dark:border-white/10 dark:bg-white/5 ${
                    activeProjectId === project.id
                      ? "ring-2 ring-cyan-400/50 dark:ring-cyan-300/50"
                      : ""
                  }`}
                  style={modalBg}
                >
                  <div className="flex flex-1 flex-col">
                    <input
                      value={project.name}
                      onChange={(e) => handleRename(project.id, e.target.value)}
                      className="w-full bg-transparent text-base font-semibold text-[var(--text-primary)] focus:outline-none"
                    />
                    <span className="text-xs text-[var(--text-secondary)]">{project.id}</span>
                  </div>
                  <div className="flex items-center gap-2 pl-3">
                    <button
                      onClick={() => {
                        setProject(project.id);
                        onClose();
                      }}
                      className="rounded-full bg-emerald-500/80 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={projects.length === 1}
                      className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-[var(--text-primary)] transition hover:border-red-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ToronProjectsModal;

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { useToronStore } from "@/state/toron/toronStore";
import type { PersonaMode } from "./toronTypes";

type ToronProjectsModalProps = {
  onClose: () => void;
};

export default function ToronProjectsModal({ onClose }: ToronProjectsModalProps) {
  const {
    projects,
    activeProjectId,
    switchProject,
    createProject,
    renameProject,
    deleteProject,
    updateMetadata,
  } = useToronStore();

  const [newName, setNewName] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const projectList = useMemo(() => Object.values(projects), [projects]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const startRename = (id: string, current: string) => {
    setRenameId(id);
    setRenameValue(current);
  };

  const handleRename = () => {
    if (renameId && renameValue.trim()) {
      renameProject(renameId, renameValue.trim());
      setRenameId(null);
      setRenameValue("");
    }
  };

  const handleCreate = () => {
    const projectId = createProject(newName.trim() || "New Project");
    setNewName("");
    switchProject(projectId);
    onClose();
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setConfirmDelete(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onClose}
      >
        <motion.div
          onMouseDown={(e) => e.stopPropagation()}
          className="relative w-[520px] overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--panel-elevated)] p-6 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">Projects</p>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Toron Minds</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full px-3 py-1 text-sm text-[var(--text-secondary)] transition hover:bg-white/10"
            >
              Close
            </button>
          </div>

          <div className="max-h-[280px] space-y-3 overflow-y-auto pr-1">
            {projectList.map((project) => (
              <motion.div
                key={project.id}
                layout
                className={`group relative flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                  activeProjectId === project.id
                    ? "border-[var(--accent-primary)]/60 bg-[color-mix(in_srgb,var(--accent-primary),transparent_85%)]"
                    : "border-[var(--border-soft)] bg-[var(--panel-strong)]"
                }`}
                whileHover={{ y: -2 }}
              >
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        switchProject(project.id);
                        onClose();
                      }}
                      className="text-left text-[var(--text-primary)]"
                    >
                      <span className="font-semibold">{project.name}</span>
                    </button>
                    {project.metadata.personaMode && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                        {project.metadata.personaMode}
                      </span>
                    )}
                    <select
                      value={project.metadata.personaMode ?? "default"}
                      onChange={(e) => updateMetadata(project.id, { personaMode: e.target.value as PersonaMode })}
                      className="rounded-lg border border-[var(--border-soft)] bg-[var(--panel-elevated)] px-2 py-1 text-xs text-[var(--text-primary)] shadow-inner"
                    >
                      {[
                        "default",
                        "fitness",
                        "anime",
                        "journal",
                        "engineering",
                      ].map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {project.metadata.goals || "Adaptive workspace"}
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-80">
                  <button
                    onClick={() => startRename(project.id, project.name)}
                    className="rounded-xl px-3 py-1 text-xs text-[var(--text-secondary)] transition hover:bg-white/10"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => setConfirmDelete(project.id)}
                    className="rounded-xl px-3 py-1 text-xs text-red-400 transition hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <input
              placeholder="New project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-strong)] px-3 py-2 text-[var(--text-primary)]"
            />

            <button
              onClick={handleCreate}
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(59,130,246,0.35)]"
            >
              New Project
            </button>
          </div>

          <AnimatePresence>
            {renameId && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-[420px] rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-strong)] p-4 shadow-xl"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                >
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Rename Project</h3>
                  <input
                    className="mt-3 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--panel-elevated)] px-3 py-2 text-[var(--text-primary)]"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                  />
                  <div className="mt-4 flex justify-end gap-2 text-sm">
                    <button
                      onClick={() => {
                        setRenameId(null);
                        setRenameValue("");
                      }}
                      className="rounded-xl px-3 py-2 text-[var(--text-secondary)] hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRename}
                      className="rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 px-4 py-2 font-semibold text-white"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {confirmDelete && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-[380px] rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-strong)] p-4 shadow-xl"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                >
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Delete project?</h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">This cannot be undone.</p>
                  <div className="mt-4 flex justify-end gap-2 text-sm">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="rounded-xl px-3 py-2 text-[var(--text-secondary)] hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(confirmDelete)}
                      className="rounded-xl bg-red-500/90 px-4 py-2 font-semibold text-white"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

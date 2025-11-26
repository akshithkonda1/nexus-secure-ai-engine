import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo, useState } from "react";

import { useToronStore } from "@/state/toron/toronStore";

import type { ToronProject } from "./toronTypes";

type ToronProjectsModalProps = {
  onClose: () => void;
};

export default function ToronProjectsModal({ onClose }: ToronProjectsModalProps) {
  const { projects, activeProjectId, createProject, renameProject, deleteProject, setProject } =
    useToronStore();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const orderedProjects = useMemo(
    () => [...projects].sort((a, b) => a.name.localeCompare(b.name)),
    [projects],
  );

  const handleCreate = () => {
    if (!newName.trim()) return;
    createProject(newName.trim());
    setNewName("");
  };

  const handleSelect = (project: ToronProject) => {
    setProject(project.id);
    onClose();
  };

  const handleRename = (project: ToronProject) => {
    if (!renameValue.trim()) return;
    renameProject(project.id, renameValue.trim());
    setEditing(null);
    setRenameValue("");
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdrop}
      >
        <motion.div
          className="w-[460px] max-w-full rounded-3xl border border-white/20 bg-[var(--panel-elevated)] p-6 shadow-2xl backdrop-blur-xl dark:border-white/10"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: "spring", stiffness: 210, damping: 22 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Toron Projects</h2>
            <button
              onClick={onClose}
              className="rounded-full px-3 py-1 text-sm text-[var(--text-secondary)] transition hover:bg-white/10"
            >
              Close
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 p-3 shadow-inner dark:border-white/10">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New project name"
              className="flex-1 rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--toron-cosmic-primary)] focus:outline-none"
            />
            <button
              onClick={handleCreate}
              className="rounded-xl bg-gradient-to-r from-[var(--toron-cosmic-primary)] to-[var(--toron-cosmic-secondary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,225,255,0.25)] transition hover:-translate-y-[1px]"
            >
              + New Project
            </button>
          </div>

          <div className="mt-5 max-h-[300px] space-y-2 overflow-y-auto pr-1">
            {orderedProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md ${
                  activeProjectId === project.id
                    ? "border-[var(--toron-cosmic-primary)]/40 bg-[var(--toron-glass-light)] dark:bg-[var(--toron-glass-dark)]"
                    : "border-white/15 bg-white/5 dark:border-white/10"
                }`}
                style={{ backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
              >
                <div className="flex-1">
                  {editing === project.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="flex-1 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--toron-cosmic-primary)] focus:outline-none"
                      />
                      <button
                        onClick={() => handleRename(project)}
                        className="rounded-lg bg-[var(--toron-cosmic-primary)] px-3 py-2 text-xs font-semibold text-black shadow-sm"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelect(project)}
                      className="text-left text-[var(--text-primary)] transition-colors hover:text-[color-mix(in_srgb,var(--toron-cosmic-secondary),transparent_10%)]"
                    >
                      {project.name}
                    </button>
                  )}
                </div>

                {editing === project.id ? (
                  <button
                    onClick={() => {
                      setEditing(null);
                      setRenameValue("");
                    }}
                    className="text-xs text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                  >
                    Cancel
                  </button>
                ) : (
                  <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setEditing(project.id);
                        setRenameValue(project.name);
                      }}
                      className="text-xs text-[var(--text-secondary)] transition hover:text-[var(--toron-cosmic-primary)]"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="text-xs text-red-400 transition hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

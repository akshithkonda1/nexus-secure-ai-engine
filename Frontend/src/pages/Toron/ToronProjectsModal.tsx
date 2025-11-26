import { motion } from "framer-motion";
import { useState } from "react";

import { useToronStore } from "@/state/toron/toronStore";
import type { ToronProject } from "./toronTypes";

type ToronProjectsModalProps = {
  onClose: () => void;
  onSelectProject?: (project: ToronProject) => void;
};

export default function ToronProjectsModal({ onClose, onSelectProject }: ToronProjectsModalProps) {
  const { projects, createProject, deleteProject, setActiveProjectId } = useToronStore();
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    createProject(newName.trim());
    setNewName("");
  };

  const handleSelect = (project: ToronProject) => {
    if (onSelectProject) {
      onSelectProject(project);
    } else {
      setActiveProjectId(project.id);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-[420px] rounded-3xl border border-[var(--border-soft)] bg-[var(--panel-elevated)] p-6 shadow-xl"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Toron Projects
        </h2>

        <div className="mt-4 max-h-[260px] space-y-2 overflow-y-auto pr-1">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-[var(--border-soft)] bg-[var(--panel-strong)] p-3 transition hover:-translate-y-[1px] hover:border-[color-mix(in_srgb,var(--accent-primary),transparent_30%)] hover:shadow-lg"
            >
              <button
                onClick={() => {
                  handleSelect(p);
                  onClose();
                }}
                className="text-[var(--text-primary)] font-medium transition-colors hover:text-[color-mix(in_srgb,var(--accent-primary),transparent_20%)]"
              >
                {p.name}
              </button>

              <button
                onClick={() => deleteProject(p.id)}
                className="text-sm text-red-400 transition hover:text-red-300"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2">
          <input
            placeholder="New project name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-xl border border-[var(--border-soft)] bg-[var(--panel-strong)] px-3 py-2 text-[var(--text-primary)] transition focus:border-[color-mix(in_srgb,var(--accent-primary),transparent_25%)] focus:outline-none"
          />

          <button
            onClick={handleCreate}
            className="rounded-xl bg-[var(--accent-primary)] px-4 py-2 text-black shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
          >
            Add
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--panel-strong)] py-2 text-[var(--text-secondary)] transition hover:-translate-y-[1px] hover:shadow-md"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

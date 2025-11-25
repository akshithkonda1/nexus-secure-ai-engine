import { motion } from "framer-motion";
import { useState } from "react";

import { useToronStore } from "@/state/toron/toronStore";

type ToronProjectsModalProps = {
  onClose: () => void;
};

export default function ToronProjectsModal({ onClose }: ToronProjectsModalProps) {
  const { projects, setProject, createProject, deleteProject } = useToronStore();
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    createProject(newName.trim());
    setNewName("");
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-[420px] bg-[var(--panel-elevated)] rounded-3xl p-6 border border-[var(--border-soft)] shadow-xl"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Toron Projects
        </h2>

        <div className="mt-4 space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 rounded-xl
                         bg-[var(--panel-strong)] border border-[var(--border-soft)]"
            >
              <button
                onClick={() => {
                  setProject(p.id);
                  onClose();
                }}
                className="text-[var(--text-primary)] font-medium"
              >
                {p.name}
              </button>

              <button
                onClick={() => deleteProject(p.id)}
                className="text-red-400 text-sm"
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
            className="flex-1 px-3 py-2 rounded-xl bg-[var(--panel-strong)] 
                       border border-[var(--border-soft)] text-[var(--text-primary)]"
          />

          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] 
                       text-black font-semibold"
          >
            Add
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 rounded-xl bg-[var(--panel-strong)] 
                     border border-[var(--border-soft)] text-[var(--text-secondary)]"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

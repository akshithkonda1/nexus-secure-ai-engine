import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, ShieldCheck } from "lucide-react";

import { useProjects } from "@/features/projects/useProjects";
import { ProjectList } from "./ProjectList";

export function NewProjectModal({ onClose }: { onClose: () => void }) {
  const { projects, activeProject, createProject, selectProject } = useProjects();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const project = await createProject(name || "New Project");
      await selectProject(project.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal
        aria-label="New project"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.38)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-secondary)]">Projects</p>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Open or create a container</h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Context stays sanitized. Toron only keeps the structured signals stored here.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_80%,transparent)] px-3 py-1 text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-[1px]"
            >
              Close
            </button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr,1fr]">
            <section className="space-y-3">
              <ProjectList
                projects={projects}
                activeId={activeProject?.id}
                onSelect={(id) => {
                  void selectProject(id);
                  onClose();
                }}
              />
            </section>
            <section className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_82%,transparent)] p-4 shadow-inner shadow-black/10">
              <header className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <ShieldCheck className="h-4 w-4 text-[color-mix(in_srgb,var(--accent-secondary)_90%,var(--text-primary))]" />
                Create sanitized project
              </header>
              <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block text-xs font-semibold text-[var(--text-secondary)]" htmlFor="project-name">
                  Project name
                </label>
                <input
                  id="project-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Context channel (sanitized)"
                  className="w-full rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_90%,transparent)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent-primary)_65%,transparent)]"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_85%,var(--accent-secondary))] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(124,93,255,0.32)] transition hover:-translate-y-[1px] disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  {saving ? "Encrypting…" : "Create project"}
                </button>
              </form>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

import { useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";

import type { Project, ProjectItem, ProjectItemType } from "@/state/projects/projectStore";

interface ProjectEditorProps {
  project?: Project | null;
  prefillContent?: string;
  onAddItem?: (item: ProjectItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onUpdateItem?: (itemId: string, content: string) => void;
}

const itemTypeLabels: Record<ProjectItemType, string> = {
  note: "Note",
  "toron-output": "Toron Output",
  task: "Task",
};

export function ProjectEditor({ project, prefillContent, onAddItem, onDeleteItem, onUpdateItem }: ProjectEditorProps) {
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<ProjectItemType>("note");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (prefillContent) {
      setNewContent(prefillContent);
    }
  }, [prefillContent]);

  useEffect(() => {
    if (!project) return;
    setDrafts(project.items.reduce<Record<string, string>>((acc, item) => ({ ...acc, [item.id]: item.content }), {}));
  }, [project]);

  const sortedItems = useMemo(
    () => [...(project?.items ?? [])].sort((a, b) => b.createdAt - a.createdAt),
    [project?.items],
  );

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[var(--border-soft)] bg-[var(--panel-soft)] p-6 text-sm text-[var(--text-secondary)]">
        Select a project to start storing Toron output.
      </div>
    );
  }

  const handleAddItem = () => {
    const content = newContent.trim();
    if (!content) return;
    const item: ProjectItem = {
      id: nanoid(),
      type: newType,
      content,
      createdAt: Date.now(),
    };
    onAddItem?.(item);
    setNewContent("");
  };

  const handleUpdateItem = (itemId: string) => {
    const content = drafts[itemId]?.trim();
    if (!content) return;
    onUpdateItem?.(itemId, content);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--panel-soft)] p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Add to {project.name}</h3>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as ProjectItemType)}
            className="rounded border border-[var(--border-soft)] bg-[var(--panel-elevated)] px-2 py-1 text-xs text-[var(--text-primary)]"
          >
            {Object.entries(itemTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Store a note, Toron output, or task"
          className="h-24 w-full resize-none rounded border border-[var(--border-soft)] bg-[var(--panel-elevated)] p-2 text-sm text-[var(--text-primary)] focus:outline-none"
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={handleAddItem}
            className="rounded border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] px-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:shadow"
          >
            Save to Project
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto rounded-lg border border-[var(--border-soft)] bg-[var(--panel-soft)] p-3">
        {sortedItems.length === 0 && (
          <div className="rounded border border-dashed border-[var(--border-soft)] bg-[var(--panel-elevated)] p-3 text-xs text-[var(--text-secondary)]">
            No items stored yet. Capture Toron outputs or notes to build this project.
          </div>
        )}
        {sortedItems.map((item) => (
          <div key={item.id} className="space-y-2 rounded border border-[var(--border-soft)] bg-[var(--panel-elevated)] p-3">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span className="uppercase tracking-wide">{itemTypeLabels[item.type]}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleUpdateItem(item.id)}
                  className="rounded px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--panel-soft)]"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteItem?.(item.id)}
                  className="rounded px-2 py-1 text-[var(--text-secondary)] hover:bg-[var(--panel-soft)]"
                >
                  Delete
                </button>
              </div>
            </div>
            <textarea
              value={drafts[item.id] ?? item.content}
              onChange={(e) => setDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
              className="min-h-[80px] w-full resize-none rounded border border-[var(--border-soft)] bg-[var(--panel-main)] p-2 text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectEditor;

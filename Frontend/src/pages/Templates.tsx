import { useEffect, useMemo, useRef, useState } from "react";
import { TemplateCard, EmptyTemplates } from "@/components/TemplateCard";
import { useLocalStore } from "@/hooks/useLocalStore";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Upload, Save, RefreshCcw } from "lucide-react";

type Template = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  content: string;
};

const suggestedTemplates: Template[] = [
  {
    id: "s1",
    title: "Incident Postmortem",
    description: "Request timeline, root cause, mitigation, and prevention in one go.",
    tags: ["Ops", "Security"],
    content: "Generate an incident postmortem with sections: Summary, Impact, Timeline, Root Cause, Mitigation, Prevention."
  },
  {
    id: "s2",
    title: "Executive Brief",
    description: "Turns documents + chat context into a clean C-suite summary.",
    tags: ["Leadership"],
    content: "Summarise the latest conversation and uploaded docs for executives. Include top decisions, blockers, and asks."
  },
  {
    id: "s3",
    title: "QA Test Plan",
    description: "Translate feature specs into test cases with owners and risk weight.",
    tags: ["QA", "Engineering"],
    content: "Create a QA plan with test cases, inputs, expected output, owner, risk."
  },
  {
    id: "s4",
    title: "Sales Narrative",
    description: "Condenses research into an objection-ready narrative.",
    tags: ["Sales"],
    content: "Craft a sales narrative including hook, value prop, objections, proof." 
  },
  {
    id: "s5",
    title: "Policy Draft",
    description: "Bootstrap an internal policy from bullet notes and regulations.",
    tags: ["Compliance"],
    content: "Draft a policy with sections: Purpose, Scope, Responsibilities, Procedures, References."
  }
];

const defaultTemplates: Template[] = [
  {
    id: crypto.randomUUID(),
    title: "Daily Standup Synth",
    description: "Condense Slack chatter into a ready-to-send standup.",
    tags: ["Daily", "Team"],
    content: "Summarise today's updates into Yesterday/Today/Blocked sections."
  },
  {
    id: crypto.randomUUID(),
    title: "Security Brief",
    description: "Analyse new CVEs and suggest impact for our stack.",
    tags: ["Security"],
    content: "For each CVE, rate severity, affected services, mitigation, owner." 
  },
  {
    id: crypto.randomUUID(),
    title: "Research Digest",
    description: "Summarise PDFs into bullet digest with citations.",
    tags: ["Research"],
    content: "Generate digest with TL;DR, key insights, supporting quotes."
  },
  {
    id: crypto.randomUUID(),
    title: "Persona Builder",
    description: "Transform interviews into buyer personas.",
    tags: ["Product", "Marketing"],
    content: "Create personas with goals, pain points, triggers, objections."
  },
  {
    id: crypto.randomUUID(),
    title: "PR FAQ",
    description: "Write a press release + FAQ using Amazon style.",
    tags: ["Launch"],
    content: "Generate press release + FAQ with narrative, benefits, concerns."
  }
];

const templateKey = "nexus.templates";

type TemplateFormState = {
  id?: string;
  title: string;
  description: string;
  tags: string;
  content: string;
};

const emptyForm: TemplateFormState = {
  title: "",
  description: "",
  tags: "",
  content: ""
};

export function Templates() {
  const [templates, setTemplates] = useLocalStore<Template[]>(templateKey, () => defaultTemplates);
  const [form, setForm] = useState<TemplateFormState>(emptyForm);
  const [toast, setToast] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const sortedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => a.title.localeCompare(b.title));
  }, [templates]);

  function resetForm() {
    setForm(emptyForm);
  }

  function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return;
    if (form.id) {
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === form.id
            ? {
                ...template,
                title: form.title.trim(),
                description: form.description.trim(),
                content: form.content.trim(),
                tags: form.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              }
            : template
        )
      );
    } else {
      const newTemplate: Template = {
        id: crypto.randomUUID(),
        title: form.title.trim(),
        description: form.description.trim(),
        content: form.content.trim(),
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      };
      setTemplates((prev) => [newTemplate, ...prev]);
    }
    resetForm();
    setToast("Template saved");
  }

  function handleEdit(template: Template) {
    setForm({
      id: template.id,
      title: template.title,
      description: template.description,
      content: template.content,
      tags: template.tags.join(", ")
    });
  }

  function handleDuplicate(template: Template) {
    const clone: Template = {
      ...template,
      id: crypto.randomUUID(),
      title: `${template.title} (copy)`
    };
    setTemplates((prev) => [clone, ...prev]);
    setToast("Template duplicated");
  }

  function handleDelete(id: string) {
    setTemplates((prev) => prev.filter((template) => template.id !== id));
    setToast("Template removed");
  }

  function handleExport() {
    const payload = JSON.stringify(templates, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nexus-templates.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    const text = await file.text();
    try {
      const next = JSON.parse(text) as Template[];
      if (!Array.isArray(next)) throw new Error("Invalid payload");
      setTemplates(next.map((template) => ({ ...template, id: template.id || crypto.randomUUID() })));
      setToast("Templates imported");
    } catch (error) {
      console.error(error);
      setToast("Import failed");
    }
  }

  return (
    <div className="space-y-10 pt-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border)/0.55)] bg-[rgb(var(--surface)/0.86)] px-4 py-2 text-sm text-[rgb(var(--text))] shadow-soft"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[rgb(var(--text))]">Custom Templates</h2>
            <p className="text-sm text-[rgb(var(--text)/0.6)]">Personalised flows stored locally.</p>
          </div>
        </div>

        {sortedTemplates.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {sortedTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                title={template.title}
                description={template.description || "No description"}
                tags={template.tags.length ? template.tags : ["Untagged"]}
                onEdit={() => handleEdit(template)}
                onDuplicate={() => handleDuplicate(template)}
                onDelete={() => handleDelete(template.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyTemplates label="No templates yet. Create one below." />
        )}
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-[rgb(var(--text))]">Suggested Templates</h2>
          <p className="text-sm text-[rgb(var(--text)/0.6)]">Curated starting points based on documents and history.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {suggestedTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              title={template.title}
              description={template.description}
              tags={template.tags}
              onDuplicate={() => handleDuplicate(template)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-[rgb(var(--text))]">Create New Template</h2>
          <p className="text-sm text-[rgb(var(--text)/0.6)]">Capture prompts, knowledge retrieval chains, or formatting macros.</p>
        </div>
        <div className="rounded-3xl border border-[rgb(var(--border)/0.55)] bg-[rgb(var(--surface)/0.88)] p-6 shadow-soft backdrop-blur dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.6)]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--text)/0.55)]">Title</span>
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="h-11 w-full rounded-2xl border border-[color-mix(in_srgb,var(--brand)_18%,transparent)] bg-white/70 px-4 text-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_24%,transparent)] dark:bg-white/10"
                placeholder="Summarise sprint board"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--text)/0.55)]">Tags</span>
              <input
                value={form.tags}
                onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                className="h-11 w-full rounded-2xl border border-[color-mix(in_srgb,var(--brand)_18%,transparent)] bg-white/70 px-4 text-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_24%,transparent)] dark:bg-white/10"
                placeholder="ops, daily"
              />
            </label>
          </div>
          <label className="mt-4 block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--text)/0.55)]">Description</span>
            <input
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="h-11 w-full rounded-2xl border border-[color-mix(in_srgb,var(--brand)_18%,transparent)] bg-white/70 px-4 text-sm outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_24%,transparent)] dark:bg-white/10"
              placeholder="Quick summary of what this template does"
            />
          </label>
          <label className="mt-4 block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--text)/0.55)]">Content</span>
            <textarea
              value={form.content}
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              rows={6}
              className="w-full rounded-2xl border border-[color-mix(in_srgb,var(--brand)_18%,transparent)] bg-white/70 px-4 py-3 text-sm leading-relaxed outline-none focus:border-[color:var(--brand)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_24%,transparent)] dark:bg-white/10"
              placeholder="Full prompt body…"
            />
          </label>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[rgb(var(--text)/0.5)]">Stored locally — export before clearing cache.</div>
            <div className="flex items-center gap-2">
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                className={cn("btn", (!form.title.trim() || !form.content.trim()) && "opacity-60 cursor-not-allowed")}
                disabled={!form.title.trim() || !form.content.trim()}
              >
                <Save className="h-4 w-4" />
                {form.id ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[rgb(var(--text))]">Global Template Actions</h2>
            <p className="text-sm text-[rgb(var(--text)/0.6)]">Backup or migrate flows between workspaces.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleExport} className="btn-secondary">
              <Download className="h-4 w-4" />
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => importRef.current?.click()}
              className="btn-secondary"
            >
              <Upload className="h-4 w-4" />
              Import JSON
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const [file] = Array.from(event.target.files ?? []);
                if (file) {
                  handleImport(file);
                }
                event.target.value = "";
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

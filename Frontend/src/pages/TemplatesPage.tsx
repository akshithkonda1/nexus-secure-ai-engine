import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, Search, Sparkles, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { useTemplateLaunch, useTemplates } from "@/queries/templates";
import type { Template } from "@/types/models";

const EMPTY_TEMPLATES: Template[] = [];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useTemplates();
  const launchTemplate = useTemplateLaunch();

  const templates = data?.templates ?? EMPTY_TEMPLATES;
  const categories = useMemo(() => ["all", ...new Set(templates.map((t) => t.category))], [templates]);

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return templates.filter((template) => {
      const matchCategory = category === "all" || template.category === category;
      const matchSearch =
        !normalized ||
        template.name.toLowerCase().includes(normalized) ||
        template.description.toLowerCase().includes(normalized);
      return matchCategory && matchSearch;
    });
  }, [templates, category, search]);

  const handleLaunch = async (templateId: string) => {
    const result = await launchTemplate.mutateAsync({ templateId }).catch(() => undefined);
    if (result?.session.id) {
      navigate(`/chat/${result.session.id}`);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Templates"
        description="Kick-start trusted workflows built for compliance, audits, and research."
      />

      <section className="rounded-3xl border border-app bg-panel panel panel--glassy panel--hover p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Browse templates</h2>
            <p className="text-sm text-muted">Search curated prompts and launch a debate in seconds.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search templates"
                className="h-10 w-full min-w-[220px] rounded-full border border-app bg-app px-9 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
              />
            </div>
            <div className="flex items-center gap-2 rounded-full border border-app bg-app px-3 py-2 text-xs text-muted">
              <Filter className="h-4 w-4" aria-hidden="true" />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="bg-transparent text-sm text-ink focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-panel panel panel--glassy panel--hover text-ink">
                    {cat === "all" ? "All categories" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-48" />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((template) => (
              <motion.article
                key={template.id}
                whileHover={{ y: -6 }}
                className="flex h-full flex-col justify-between rounded-3xl border border-app bg-panel panel panel--glassy panel--hover p-5 shadow-lg"
              >
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-trustBlue/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-trustBlue">
                    <Sparkles className="h-4 w-4" aria-hidden="true" /> {template.category}
                  </span>
                  <h3 className="text-lg font-semibold text-ink">{template.name}</h3>
                  <p className="text-sm text-muted">{template.description}</p>
                  <p className="text-xs text-muted">Updated {new Date(template.updatedAt).toLocaleDateString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleLaunch(template.id)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-trustBlue px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={launchTemplate.isPending}
                >
                  {launchTemplate.isPending ? <Wand2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Wand2 className="h-4 w-4" aria-hidden="true" />}
                  Use template
                </button>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No templates found"
              description="Try a different category or clear your search."
            />
          </div>
        )}
      </section>
    </div>
  );
}

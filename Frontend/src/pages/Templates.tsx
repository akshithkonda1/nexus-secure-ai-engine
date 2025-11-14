import React, { useMemo, useState } from "react";
import { Loader2, RefreshCcw, Search, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { useTemplates, useTemplateLaunch } from "@/queries/templates";
import type { Template } from "@/types/models";
import { formatRelativeTime } from "@/lib/formatters";
import SkeletonBlock from "@/components/SkeletonBlock";

const CATEGORY_ACCENTS: Record<string, string> = {
  governance:
    "bg-[rgba(var(--accent-rose),0.16)] text-[rgb(var(--accent-rose-ink))]",
  security: "bg-[rgba(var(--brand),0.16)] text-brand",
  research: "bg-[rgba(var(--accent-lilac),0.28)] text-[rgb(var(--text))]",
  operations:
    "bg-[rgba(var(--accent-emerald),0.18)] text-[rgb(var(--accent-emerald-ink))]",
  default:
    "bg-[rgba(var(--accent-amber),0.18)] text-[rgb(var(--accent-amber-ink))]",
};

function getAccent(category: string) {
  const key = category.trim().toLowerCase();
  if (key.includes("govern") || key.includes("policy"))
    return CATEGORY_ACCENTS.governance;
  if (key.includes("secure") || key.includes("trust"))
    return CATEGORY_ACCENTS.security;
  if (key.includes("research") || key.includes("knowledge"))
    return CATEGORY_ACCENTS.research;
  if (key.includes("ops") || key.includes("operation"))
    return CATEGORY_ACCENTS.operations;
  return CATEGORY_ACCENTS.default;
}

function sortTemplates(templates: Template[]) {
  return [...templates].sort((a, b) => {
    const left = new Date(a.updatedAt).getTime();
    const right = new Date(b.updatedAt).getTime();
    return Number.isFinite(right - left) ? right - left : 0;
  });
}

export function Templates() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { data, isLoading, isError, refetch, isRefetching } = useTemplates();
  const launchTemplate = useTemplateLaunch();

  const templates = useMemo(
    () => sortTemplates(data?.templates ?? []),
    [data?.templates],
  );
  const categories = useMemo(() => {
    const unique = new Set<string>();
    templates.forEach((template) => {
      if (template.category) {
        unique.add(template.category);
      }
    });
    return ["all", ...Array.from(unique)];
  }, [templates]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return templates.filter((template) => {
      const matchesCategory =
        category === "all" || template.category === category;
      if (!query) return matchesCategory;
      return (
        matchesCategory &&
        (template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query))
      );
    });
  }, [templates, search, category]);

  const handleLaunch = async (template: Template) => {
    try {
      await launchTemplate.mutateAsync({ templateId: template.id });
      toast.success(`Launching “${template.name}”`);
    } catch (error) {
      console.error(error);
      toast.error("Unable to start a session from this template right now.");
    }
  };

  return (
    <div className="px-[var(--page-padding)] py-6">
      <div className="panel panel--glassy panel--hover panel--immersive panel--edge panel--alive card card-hover p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="accent-ink text-lg font-semibold text-[rgb(var(--text))]">
              Templates
            </h2>
            <p className="text-sm text-[rgba(var(--subtle),0.82)]">
              Standardize launches with pre-approved prompts, inputs, and
              guardrails.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[rgba(var(--subtle),0.7)]" />
              <input
                type="search"
                className="input w-64 pl-10 pr-4"
                placeholder="Search templates"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-zora-aurora px-4 py-2 text-sm font-semibold text-zora-night shadow-zora-glow transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-zora-glow hover:scale-[1.01] active:translate-y-[0px] active:scale-[0.99]"
              onClick={() =>
                toast.info(
                  "Template builder connects to the backend in the next sprint.",
                )
              }
            >
              <Sparkles className="size-4" /> New template
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className={`chip border ${
                category === option
                  ? "border-[rgba(var(--brand),0.4)] bg-[rgba(var(--brand),0.14)] text-brand"
                  : "border-[rgba(var(--border),0.25)] bg-[rgba(var(--panel),0.5)] text-[rgba(var(--subtle),0.8)] hover:border-[rgba(var(--brand),0.25)]"
              }`}
            >
              {option === "all" ? "All templates" : option}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="panel panel--glassy panel--hover panel--immersive h-32 rounded-2xl border border-[rgba(var(--border),0.2)] bg-[rgba(var(--panel),0.6)] animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="panel panel--glassy panel--hover panel--immersive panel--alive mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.45)] p-6 text-center text-sm text-[rgb(var(--subtle))]">
            <p>We couldn&apos;t load templates from the workspace API.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="btn btn-ghost btn-quiet inline-flex items-center gap-2 rounded-full border border-[rgba(var(--brand),0.4)] px-4 py-2 text-sm font-semibold text-brand"
            >
              <RefreshCcw
                className={`size-4 ${isRefetching ? "animate-spin" : ""}`}
              />{" "}
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel panel--glassy panel--hover panel--immersive panel--alive mt-6">
            <SkeletonBlock />
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((template) => (
              <li
                key={template.id}
                className="panel panel--glassy panel--hover panel--immersive panel--alive flex h-full flex-col justify-between rounded-2xl border border-[rgba(var(--border),0.3)] bg-[rgba(var(--panel),0.55)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
              >
                <div className="space-y-3 text-sm">
                  <span className={`badge ${getAccent(template.category)}`}>
                    {template.category}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-[rgb(var(--text))]">
                      {template.name}
                    </h3>
                    <p className="mt-2 text-[rgba(var(--subtle),0.85)]">
                      {template.description}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs text-[rgba(var(--subtle),0.75)]">
                  <span>Updated {formatRelativeTime(template.updatedAt)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-zora-lg border border-zora-border bg-zora-space/80 px-3 py-1.5 text-xs font-semibold text-zora-white shadow-zora-soft/40 transition hover:bg-zora-deep hover:border-white/15 hover:scale-[1.01] active:scale-[0.99]"
                      onClick={() =>
                        toast.info(`Previewing ${template.name} coming soon`)
                      }
                    >
                      <Search className="size-3.5" /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLaunch(template)}
                      disabled={launchTemplate.isPending}
                      className="inline-flex items-center justify-center rounded-zora-lg bg-zora-aurora px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-zora-night shadow-zora-glow transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-zora-glow hover:scale-[1.01] active:translate-y-[0px] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {launchTemplate.isPending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Wand2 className="size-3.5" />
                      )}{" "}
                      Start
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Templates;

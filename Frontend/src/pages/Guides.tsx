import React from "react";
import { BookOpenCheck, Compass, PlayCircle, ShieldCheck } from "lucide-react";

import { useProfile } from "@/features/profile/ProfileProvider";
import { getFirstName } from "@/lib/userName";

const steps = [
  {
    title: "Map your workflows",
    description:
      "Document the agents, guardrails, and approval paths that matter most.",
    icon: Compass,
  },
  {
    title: "Harden your deployment",
    description:
      "Review escalation playbooks, fallback prompts, and audit policies before launch.",
    icon: ShieldCheck,
  },
  {
    title: "Share best practices",
    description:
      "Publish recording-ready playbacks so every team adopts the same patterns.",
    icon: BookOpenCheck,
  },
];

export function Guides() {
  const { profile } = useProfile();
  const userName = getFirstName(profile);
  const who = profile?.fullName || profile?.handle || userName || "there";

  return (
    <div className="flex flex-col gap-8">
      <section className="panel panel--glassy panel--hover halo panel--hover rounded-[26px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.9)] p-6 shadow-[var(--shadow-soft)] dark:bg-[rgba(var(--panel),0.75)]">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(var(--subtle),0.75)]">
            Guides
          </p>
          <h1 className="text-2xl font-semibold text-[rgb(var(--text))]">
            {who}, chart the secure way to ship AI.
          </h1>
          <p className="max-w-3xl text-sm text-[rgba(var(--subtle),0.8)]">
            Follow the recommended playbooks from Nexus so launches feel
            predictable. Browse setup recipes, governance checklists, and
            troubleshooting primers built for regulated teams.
          </p>
          <button
            type="button"
            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#0085FF] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:bg-[#009EFF] hover:shadow-[var(--shadow-lift)]"
          >
            <PlayCircle className="size-4" /> Start walkthrough
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {steps.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="panel panel--glassy panel--hover flex h-full flex-col gap-4 rounded-[24px] border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.92)] p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] dark:bg-[rgba(var(--panel),0.7)]"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-[rgba(var(--brand),0.12)] text-brand">
              <Icon className="size-5" />
            </span>
            <div className="space-y-2 text-sm">
              <h2 className="text-lg font-semibold text-[rgb(var(--text))]">
                {title}
              </h2>
              <p className="text-[rgba(var(--subtle),0.82)]">{description}</p>
            </div>
            <button
              type="button"
              className="mt-auto w-fit text-sm font-semibold text-brand transition hover:text-[rgba(var(--brand-ink),1)]"
            >
              View guide →
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Guides;

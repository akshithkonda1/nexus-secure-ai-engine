/* ============================================================================
   ZORA GUIDES (HANDBOOK)
   Production-ready page with opt-in telemetry FAQ entries + Settings references.

   Sections:
   1. Ryuzen Overview
   2. Workspace Overview
   3. Command Center Overview
============================================================================ */

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Brain,
  LayoutDashboard,
  FolderKanban,
} from "lucide-react";

import { useProfile } from "@/features/profile/ProfileProvider";
import { getFirstName } from "@/lib/userName";

/* ============================================================================
   FAQ DATA  
   — Updated with opt-in telemetry entries referencing Settings
============================================================================ */

const faqSections = [
  {
    id: "zora",
    title: "What is Ryuzen?",
    icon: Brain,
    items: [
      {
        q: "What is Ryuzen, in plain English?",
        a: "Ryuzen is your personal AI command center. It debates AI models, ranks their answers, filters hallucinations, and helps you work faster with more accuracy and safety.",
      },
      {
        q: "Why does Ryuzen debate AI models?",
        a: "Even the best AI models hallucinate. Ryuzen forces multiple models to disagree, compare their reasoning, and justify their answers. You see the strongest, most reliable output—not random guesswork.",
      },
      {
        q: "How does Ryuzen protect my data?",
        a: "Everything is encrypted at rest and in transit. Your Workspace, Command Center, and chat content are never used for training by default. Your work stays yours unless you explicitly opt in to share anonymized telemetry in Settings.",
      },

      /* ===========================
         OPT-IN TELEMETRY FAQ ENTRIES
      ============================ */

      {
        q: "What is telemetry?",
        a: "Telemetry is anonymous system behavior data — like model latency, error signals, debate outcomes, and safety filter triggers. It helps Ryuzen stay fast, stable, and secure. Telemetry never includes your personal content, and you control additional sharing from Settings.",
      },
      {
        q: "What is opt-in telemetry?",
        a: "Opt-in telemetry is an optional setting in Settings → Privacy & Telemetry that lets you choose to share anonymized performance signals with Ryuzen. These signals include hallucination patterns, disagreement markers, and model failure points — never your actual text or documents.",
      },
      {
        q: "Why would I turn on opt-in telemetry?",
        a: "Turning it on helps improve Ryuzen's accuracy, Workspace intelligence, Command Center recommendations, and the overall debate engine. It makes the entire Ryuzen ecosystem smarter for you while protecting your privacy. You can enable or disable this anytime in Settings → Privacy & Telemetry.",
      },
      {
        q: "Does Ryuzen train on my actual data?",
        a: "No. Ryuzen never trains on your chats, files, documents, Workspace content, or Command Center data. If opt-in telemetry is enabled in Settings → Privacy & Telemetry, only anonymized performance patterns are shared — never your content.",
      },
      {
        q: "Does Ryuzen sell data?",
        a: "Ryuzen never sells user data. If you enable opt-in telemetry, Ryuzen may share anonymized model failure analytics with model providers to help improve their reliability. This never includes your personal data, and you can control participation from Settings → Privacy & Telemetry.",
      },
      {
        q: "Can I turn telemetry off?",
        a: "Yes. You can disable opt-in telemetry at any time in Settings → Privacy & Telemetry. It is always your choice, and Ryuzen functions normally whether you enable it or not.",
      },

      /* ======================== */

      {
        q: "What does Ryuzen do behind the scenes?",
        a: "Ryuzen detects risky prompts, verifies outputs, filters harmful content, cleans context, reduces hallucinations, and keeps your AI predictable and safe. Most of this happens instantly in the background.",
      },
      {
        q: "What should I NOT use Toron for?",
        a: "Do not use Toron for licensed medical, legal, or financial decisions. Toron is a reasoning assistant—not a doctor, lawyer, or adviser.",
      },
    ],
  },

  {
    id: "workspace",
    title: "What is Workspace?",
    icon: FolderKanban,
    items: [
      {
        q: "What is Workspace?",
        a: "Workspace is your digital desk inside Ryuzen. It stores documents, notes, flashcards, research, and everything your AI needs to help you without repeating uploads.",
      },
      {
        q: "What does Workspace do for me?",
        a: "Workspace organizes documents, creates verified flashcards, manages tasks, summarizes content, and handles the mundane parts of thinking so you can focus on big decisions.",
      },
      {
        q: "Does Workspace replace other note apps?",
        a: "If you want it to. Workspace can store everything you learn, read, or build. It’s optimized for students, analysts, researchers, and creators.",
      },
      {
        q: "How does Workspace help Ryuzen?",
        a: "Everything in Workspace becomes structured context that Ryuzen can draw from. This makes your AI dramatically more accurate without needing manual uploads every session.",
      },
    ],
  },

  {
    id: "command-center",
    title: "What is the Command Center?",
    icon: LayoutDashboard,
    items: [
      {
        q: "What is the Command Center?",
        a: "The Command Center is your cockpit — the place that shows projects, tasks, connectors, research signals, and system insights. It lives in a glowing, animated drawer in the header.",
      },
      {
        q: "Why does Ryuzen need a Command Center?",
        a: "AI needs structure to be reliable. The Command Center gives Ryuzen that structure: your goals, your projects, your files, and your workflow map.",
      },
      {
        q: "What can I control from the Command Center?",
        a: "Projects, incoming tasks, connectors, integrations, signals, and the entire Ryuzen agent ecosystem.",
      },
      {
        q: "Does the Command Center make Ryuzen more accurate?",
        a: "Yes. The more Ryuzen understands your work and your context, the more accurate your AI becomes. The Command Center organizes this context automatically.",
      },
    ],
  },
];

/* ============================================================================
   COLLAPSIBLE GROUP COMPONENT
============================================================================ */

function FAQGroup({ title, icon: Icon, items }: any) {
  const [open, setOpen] = useState(true);

  return (
    <section
      className="
        panel panel--glassy panel--hover panel--alive panel--gradient-border
        rounded-[26px] border border-[rgba(var(--border),0.65)]
        bg-[rgba(var(--surface),0.9)] shadow-[var(--shadow-soft)]
        p-6 space-y-4 transition
      "
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span
            className="
              inline-flex size-10 items-center justify-center 
              rounded-2xl bg-[rgba(var(--brand),0.12)] text-brand
            "
          >
            <Icon className="size-5" />
          </span>
          <h2 className="text-lg font-semibold text-[rgb(var(--text))]">
            {title}
          </h2>
        </div>

        <span className="text-brand">
          {open ? <ChevronUp /> : <ChevronDown />}
        </span>
      </button>

      {open && (
        <ul className="space-y-3 animate-in fade-in duration-200">
          {items.map((faq: any, idx: number) => (
            <li
              key={idx}
              className="
                rounded-2xl border border-[rgba(var(--border),0.45)]
                bg-[rgba(var(--panel),0.6)] p-4
                transition hover:bg-[rgba(var(--panel),0.7)]
              "
            >
              <p className="text-sm font-semibold text-[rgb(var(--text))]">
                {faq.q}
              </p>
              <p className="mt-1 text-xs text-[rgba(var(--subtle),0.82)]">
                {faq.a}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ============================================================================
   MAIN PAGE
============================================================================ */

export default function Guides() {
  const { profile } = useProfile();
  const userName = getFirstName(profile);
  const who = profile?.fullName || profile?.handle || userName || "there";

  return (
    <div className="flex flex-col gap-10 px-[var(--page-padding)] py-8">
      {/* ============================== HERO ============================== */}
      <section
        className="
          panel panel--glassy panel--immersive panel--alive panel--halo
          rounded-[28px] border border-[rgba(var(--border),0.7)]
          bg-[rgba(var(--surface),0.92)]
          p-6 shadow-[var(--shadow-soft)]
        "
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(var(--subtle),0.75)]">
          Welcome
        </p>
        <h1 className="text-2xl font-semibold text-[rgb(var(--text))] sm:text-3xl">
          {who}, meet the Ryuzen Handbook.
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-[rgba(var(--subtle),0.8)]">
          This is your simple, user-friendly guide to understanding Ryuzen,
          Workspace, and the Command Center. Everything is organized into
          collapsible sections so you can explore without friction or overwhelm.
        </p>
        <p className="mt-2 text-[11px] text-[rgba(var(--subtle),0.78)]">
          When you&apos;re ready to fine-tune privacy and telemetry, you&apos;ll
          be able to manage it all from <span className="font-semibold">
          Settings → Privacy &amp; Telemetry
          </span>.
        </p>
      </section>

      {/* ============================== FAQ GROUPS ============================== */}
      <div className="flex flex-col gap-8">
        {faqSections.map((section) => (
          <FAQGroup key={section.id} {...section} />
        ))}
      </div>
    </div>
  );
}

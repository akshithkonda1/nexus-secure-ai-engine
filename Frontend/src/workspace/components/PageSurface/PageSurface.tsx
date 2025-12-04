import React, { useEffect, useMemo, useState } from "react";
import { AutoSave } from "./AutoSave";
import { PageEditor } from "./PageEditor";
import { TriggerHints } from "../Onboarding/TriggerHints";
import { usePagesStore } from "../../state/pagesStore";
import { useListsStore } from "../../state/listsStore";
import { useCalendarStore } from "../../state/calendarStore";
import { useEventsStore } from "../../state/eventsStore";
import { detectDate } from "../../utils/detectDate";
import { detectTask } from "../../utils/detectTask";
import { semanticCluster } from "../../utils/semanticCluster";

export type PageSurfaceProps = {
  onFirstKeystroke: () => void;
  showCorners: boolean;
  onAnalyze: () => void;
};

export const PageSurface: React.FC<PageSurfaceProps> = ({ onFirstKeystroke, showCorners, onAnalyze }) => {
  const { getCurrentPage, upsertPage } = usePagesStore();
  const currentPage = getCurrentPage();
  const { captureDetectedTasks } = useListsStore();
  const { captureDetectedDates } = useCalendarStore();
  const { addEvent } = useEventsStore();
  const [draft, setDraft] = useState(currentPage?.content ?? "");
  const [hasTyped, setHasTyped] = useState(false);

  useEffect(() => {
    setDraft(currentPage?.content ?? "");
  }, [currentPage?.id]);

  const detectedTasks = useMemo(() => detectTask(draft), [draft]);
  const detectedDates = useMemo(() => detectDate(draft), [draft]);
  const clusters = useMemo(() => semanticCluster(draft), [draft]);

  const persist = (content: string) => {
    const payload = { content, title: currentPage?.title ?? "Untitled" };
    upsertPage(payload);
    if (detectedTasks.length) {
      captureDetectedTasks(detectedTasks);
    }
    if (detectedDates.length) {
      captureDetectedDates(detectedDates);
    }
    addEvent({
      id: crypto.randomUUID(),
      description: "Page auto-saved",
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <section
      className="relative z-[10] overflow-hidden rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-white/10 dark:border-neutral-700/20 p-6 md:p-8 text-neutral-800 dark:text-neutral-200 leading-relaxed shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-[1.01]"
    >
      <div className="absolute inset-0 pointer-events-none rounded-3xl backdrop-blur-xl" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-300">Pages</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Root interaction surface</h1>
        </div>
        <button
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-neutral-50 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-[1.01] hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
          onClick={onAnalyze}
        >
          Analyze with Toron
        </button>
      </div>
      <div className="mt-4">
        <PageEditor
          value={draft}
          onChange={(value) => {
            if (!hasTyped) {
              setHasTyped(true);
              onFirstKeystroke();
            }
            setDraft(value);
          }}
          onBlur={() => persist(draft)}
        />
        <AutoSave content={draft} onSave={({ content }) => persist(content)} />
      </div>
      <TriggerHints
        tasksDetected={detectedTasks.length > 0}
        datesDetected={detectedDates.length > 0}
        questionsDetected={draft.trim().endsWith("?")}
        clusters={clusters}
        showCorners={showCorners}
      />
    </section>
  );
};

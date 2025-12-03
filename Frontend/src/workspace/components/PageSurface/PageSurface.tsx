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
    <section className="relative overflow-hidden rounded-3xl bg-tile bg-tileGradient border border-tileBorder px-6 py-5 shadow-tile before:absolute before:inset-0 before:rounded-3xl before:bg-tileInner before:content-[''] before:pointer-events-none transition-all duration-300 hover:shadow-tileStrong hover:border-tileBorderStrong">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-textMuted">Pages</p>
          <h1 className="mt-1 text-2xl font-semibold text-textMuted">Root interaction surface</h1>
        </div>
        <button
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-textPrimary shadow-tile transition hover:scale-[1.02] hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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

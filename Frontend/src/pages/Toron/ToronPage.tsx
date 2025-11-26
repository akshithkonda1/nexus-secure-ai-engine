import { useEffect, useMemo, useState } from "react";

import ToronHeader from "@/components/toron/ToronHeader";
import { useToronStore } from "@/state/toron/toronStore";

import ToronInputBar from "./ToronInputBar";
import ToronMessageList from "./ToronMessageList";
import ToronProjectsModal from "./ToronProjectsModal";
import MicroAgentRunner from "./components/MicroAgentRunner";
import ToronPlanPreview from "./modals/ToronPlanPreview";
import type { DecisionBlock, MicroAgentResult } from "./toronTypes";

export default function ToronPage() {
  const { activeProjectId, projects, setProject, clearChat, appendToMessage, setLoading, setStreaming } =
    useToronStore();
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [plan, setPlan] = useState<DecisionBlock | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planContext, setPlanContext] = useState<{ toronMessageId: string; projectId: string } | null>(null);
  const [planResults, setPlanResults] = useState<MicroAgentResult[]>([]);
  const [reflection, setReflection] = useState<string | null>(null);
  const [preparingPlan, setPreparingPlan] = useState(false);
  const [executingPlan, setExecutingPlan] = useState(false);

  useEffect(() => {
    if (!activeProjectId && projects.length) {
      setProject(projects[0].id);
    }
  }, [activeProjectId, projects, setProject]);

  const statusText = useMemo(() => {
    if (executingPlan) return "Toron is executing micro-agents…";
    if (preparingPlan) return "Toron is preparing plan…";
    return "";
  }, [executingPlan, preparingPlan]);

  const handlePlanReady = (decisionBlock: DecisionBlock, context: { toronMessageId: string; projectId: string }) => {
    setPlan(decisionBlock);
    setPlanModalOpen(true);
    setPlanContext(context);
    setPlanResults([]);
    setReflection(null);
    setPreparingPlan(false);
    setLoading(false);
    setStreaming(false);
    appendToMessage(context.projectId, context.toronMessageId, "Toron prepared a plan. Awaiting approval…\n");
  };

  const handlePlanError = (context: { toronMessageId: string; projectId: string }, message: string) => {
    setPreparingPlan(false);
    setLoading(false);
    setStreaming(false);
    appendToMessage(context.projectId, context.toronMessageId, message);
  };

  const approvePlan = async () => {
    if (!plan || !planContext) return;
    setExecutingPlan(true);
    setPlanModalOpen(false);
    try {
      const res = await fetch("/api/v1/toron/plan/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision_block_id: plan.id }),
      });
      const data = await res.json();
      const results = (data?.results ?? []) as MicroAgentResult[];
      setPlanResults(results);
      setReflection(data?.reflection ?? null);
      if (planContext) {
        appendToMessage(planContext.projectId, planContext.toronMessageId, `\n${data?.reflection ?? "Plan executed."}`);
      }
    } catch (error) {
      appendToMessage(planContext.projectId, planContext.toronMessageId, "Execution failed. Please retry.");
    } finally {
      setExecutingPlan(false);
      setStreaming(false);
      setLoading(false);
    }
  };

  const rejectPlan = async () => {
    if (!plan || !planContext) return;
    try {
      await fetch("/api/v1/toron/plan/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision_block_id: plan.id }),
      });
    } catch (error) {
      // silent fallback
    }
    appendToMessage(planContext.projectId, planContext.toronMessageId, "Plan rejected by user.");
    setPlan(null);
    setPlanModalOpen(false);
    setPlanContext(null);
    setPreparingPlan(false);
    setStreaming(false);
    setLoading(false);
  };

  return (
    <main className="relative flex h-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.14),transparent_50%),radial-gradient(circle_at_60%_70%,rgba(16,185,129,0.12),transparent_50%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_45%),linear-gradient(200deg,rgba(255,255,255,0.05),transparent_50%)]" />
      <ToronHeader onOpenProjects={() => setProjectsOpen(true)} onNewChat={() => clearChat()} />
      <ToronMessageList />
      {statusText && (
        <div className="pointer-events-none absolute left-1/2 top-20 z-30 -translate-x-1/2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur">
          {statusText}
        </div>
      )}
      <div className="px-4">
        <MicroAgentRunner results={planResults} running={executingPlan} />
        {reflection && (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/10 p-4 text-sm text-white shadow-lg">
            <div className="mb-1 text-xs uppercase tracking-wide text-cyan-100">Toron Reflection</div>
            <pre className="whitespace-pre-wrap text-white">{reflection}</pre>
          </div>
        )}
      </div>
      <ToronInputBar
        onPlanReady={handlePlanReady}
        onPlanError={handlePlanError}
        onPlanPreparing={() => setPreparingPlan(true)}
      />
      {projectsOpen && <ToronProjectsModal onClose={() => setProjectsOpen(false)} />}
      <ToronPlanPreview
        open={planModalOpen}
        plan={plan}
        onApprove={approvePlan}
        onReject={rejectPlan}
        onClose={() => setPlanModalOpen(false)}
      />
    </main>
  );
}

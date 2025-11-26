import { useCallback, useEffect, useState } from "react";

import ToronHeader from "@/components/toron/ToronHeader";
import WebConsentModal from "@/components/web/WebConsentModal";
import WebExtractionPanel from "@/components/web/WebExtractionPanel";
import { useToronStore } from "@/state/toron/toronStore";

import ToronInputBar from "./ToronInputBar";
import ToronMessageList from "./ToronMessageList";
import ToronProjectsModal from "./ToronProjectsModal";

export default function ToronPage() {
  const { activeProjectId, projects, setProject, clearChat, messages } = useToronStore();
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [consentData, setConsentData] = useState<any>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [decisionBlock, setDecisionBlock] = useState<any>(null);
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const [lastApprovedUrl, setLastApprovedUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [consentReason, setConsentReason] = useState<string>("");
  const [webLoading, setWebLoading] = useState(false);

  useEffect(() => {
    if (!activeProjectId && projects.length) {
      setProject(projects[0].id);
    }
  }, [activeProjectId, projects, setProject]);

  const prepareWebAccess = useCallback(
    async (url: string, reason: string) => {
      try {
        const res = await fetch("/api/v1/web/prepare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, reason }),
        });

        const data = await res.json();
        setConsentData(data);
        setConsentReason(reason);
        setShowConsent(true);
      } catch (err) {
        console.error("Failed to prepare web access", err);
      }
    },
    [],
  );

  useEffect(() => {
    if (!messages.length) return;

    const latestUser = [...messages].reverse().find((msg) => msg.sender === "user");
    if (!latestUser) return;

    const match = latestUser.text.match(/https?:\/\/[^\s>]+/);
    if (!match) return;

    const candidateUrl = match[0].replace(/[),.;]+$/, "");

    if (candidateUrl !== detectedUrl && candidateUrl !== lastApprovedUrl) {
      setDetectedUrl(candidateUrl);
      prepareWebAccess(candidateUrl, `User requested web context for ${candidateUrl}`);
    }
  }, [messages, detectedUrl, lastApprovedUrl, prepareWebAccess]);

  const handleApproval = useCallback(
    async (allowOnce: boolean) => {
      if (!consentData) return;
      setWebLoading(true);
      try {
        const res = await fetch("/api/v1/web/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: consentData.url,
            session_id: consentData.session_id,
            allow_once: allowOnce,
          }),
        });

        const data = await res.json();
        setExtractedData(data.extracted);
        setSessionId(data.session_id);
        setShowConsent(false);
        setLastApprovedUrl(consentData.url);
        const headings = data.extracted?.headings?.length ?? 0;
        const paragraphs = data.extracted?.paragraphs?.length ?? 0;
        const tables = data.extracted?.tables?.length ?? 0;
        const links = data.extracted?.links?.length ?? 0;
        setDecisionBlock({
          planName: "Extract Web Data",
          steps: [
            { action: "web_fetch", params: { url: consentData.url } },
            { action: "web_extract", params: {} },
          ],
          reversible: true,
          risk: "Low",
          reflection: `Captured ${headings} headings, ${paragraphs} paragraphs, ${tables} tables, and ${links} links to enrich reasoning.`,
          reason: consentReason,
        });
      } catch (err) {
        console.error("Web approval failed", err);
      } finally {
        setWebLoading(false);
      }
    },
    [consentData, consentReason],
  );

  const clearExtraction = useCallback(() => {
    setExtractedData(null);
    setDecisionBlock(null);
    setSessionId(null);
  }, []);

  return (
    <main className="relative flex h-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.14),transparent_50%),radial-gradient(circle_at_60%_70%,rgba(16,185,129,0.12),transparent_50%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_45%),linear-gradient(200deg,rgba(255,255,255,0.05),transparent_50%)]" />
      <ToronHeader onOpenProjects={() => setProjectsOpen(true)} onNewChat={() => clearChat()} />
      <ToronMessageList />
      <ToronInputBar />
      {extractedData && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-40 flex justify-center px-6">
          <div className="pointer-events-auto w-full max-w-5xl space-y-3">
            <WebExtractionPanel data={extractedData} onClear={clearExtraction} sourceUrl={consentData?.url ?? detectedUrl ?? ""} />
            {decisionBlock && (
              <div className="rounded-2xl border border-white/10 bg-[var(--panel-bg)] p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">Decision Block</div>
                    <div className="text-xs text-[var(--text-secondary)]">{decisionBlock.planName}</div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">Risk: {decisionBlock.risk}</span>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {decisionBlock.steps?.map((step: any, idx: number) => (
                    <div key={`step-${idx}`} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--text-primary)] dark:bg-white/5">
                      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{step.action}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{JSON.stringify(step.params)}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-[var(--text-secondary)]">{decisionBlock.reflection}</div>
                {sessionId && <div className="mt-2 text-[10px] text-[var(--text-secondary)]">Session: {sessionId}</div>}
              </div>
            )}
          </div>
        </div>
      )}
      {projectsOpen && <ToronProjectsModal onClose={() => setProjectsOpen(false)} />}
      {consentData && (
        <WebConsentModal
          open={showConsent}
          pageTitle={consentData.page_title ?? "Web page"}
          url={consentData.url}
          purpose={consentReason || consentData.justification}
          risk={consentData.risk ?? "low"}
          loading={webLoading}
          onAllowOnce={() => handleApproval(true)}
          onAllowSession={() => handleApproval(false)}
          onDeny={() => {
            setShowConsent(false);
            setConsentData(null);
            setExtractedData(null);
          }}
        />
      )}
    </main>
  );
}

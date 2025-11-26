import { useEffect } from "react";
import { ToronHeader } from "@/components/toron/ToronHeader";
import { ToronMessageList } from "@/pages/Toron/ToronMessageList";
import { ToronInputBar } from "@/pages/Toron/ToronInputBar";
import { useToronSessionStore } from "@/state/toron/toronSessionStore";
import { ToronSessionSidebar } from "@/pages/Toron/ToronSessionSidebar";

export default function ToronPage() {
  const {
    sessions,
    activeSessionId,
    hydrateSessions,
    createSession,
  } = useToronSessionStore();

  useEffect(() => {
    // initial load
    hydrateSessions().then(async () => {
      // if no sessions exist, create the first one
      const hasAny = Object.keys(useToronSessionStore.getState().sessions).length > 0;
      if (!hasAny) {
        await createSession("New Toron Session");
      }
    });
  }, [hydrateSessions, createSession]);

  const activeSession = activeSessionId
    ? sessions[activeSessionId]
    : null;

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
    <main className="relative flex h-full min-h-screen flex-row">
      <section className="flex min-h-screen flex-1 flex-col">
        <ToronHeader />
        <ToronMessageList
          session={activeSession}
        />
        <ToronInputBar
          sessionId={activeSession?.sessionId ?? null}
        />
      </section>

      {/* Right-hand session list, ChatGPT-style */}
      <aside className="hidden w-72 border-l border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_90%,transparent)] lg:block">
        <ToronSessionSidebar />
      </aside>
    </main>
  );
}

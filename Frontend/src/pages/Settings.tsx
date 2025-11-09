import { useEffect, useMemo, useState } from "react";
import { SettingsSection } from "@/components/SettingsSection";
import { useLocalStore } from "@/hooks/useLocalStore";
import { cn } from "@/lib/utils";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import { Check, GripVertical, Plus, Send, Sparkle, AlertCircle } from "lucide-react";
import { useModal } from "@/state/useModal";

const modelPool = [
  "gpt-4.1-secure",
  "sonnet-3.5",
  "nexus-guard",
  "claude-3-opus",
  "mistral-large",
  "command-r+",
  "deepseek-r1",
  "phi-4",
  "haiku-light",
  "open-mixtral"
];

export function Settings() {
  const [redaction, setRedaction] = useLocalStore("nexus.settings.redaction", () => true);
  const [telemetry, setTelemetry] = useLocalStore("nexus.settings.telemetry", () => false);
  const [modelOrder, setModelOrder] = useLocalStore<string[]>("nexus.settings.models", () => modelPool.slice(0, 6));
  const [storedInstructions, setStoredInstructions] = useLocalStore<string>("nexus.settings.instructions", () => "");
  const [draft, setDraft] = useState(storedInstructions);
  const [lastSaved, setLastSaved] = useState<Date | null>(storedInstructions ? new Date() : null);
  const [toast, setToast] = useState<string | null>(null);
  const { open: openModal } = useModal();

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setStoredInstructions(draft);
      if (draft.trim()) {
        setLastSaved(new Date());
      }
    }, 600);
    return () => window.clearTimeout(handler);
  }, [draft, setStoredInstructions]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const additionalModels = useMemo(() => modelPool.filter((model) => !modelOrder.includes(model)), [modelOrder]);

  function handleSubmitInstructions() {
    setToast("Instructions sent to engine");
  }

  return (
    <div className="space-y-10 pb-16">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="inline-flex items-center gap-2 rounded-full border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] px-5 py-2.5 text-sm text-[rgb(var(--text))] shadow-[var(--elev-1)]"
          >
            <Sparkle className="h-4 w-4 text-[color:var(--brand)]" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsSection
        title="PII Redaction"
        description="Automatically strip names, SSNs, IDs, and location hints before requests leave your enclave."
        action={
          <Switch checked={redaction} onChange={setRedaction} label={redaction ? "Enabled" : "Disabled"} />
        }
      >
        <p className="text-sm text-[color:rgba(var(--text)/0.65)]">
          Documents are pre-processed in memory using streaming redaction. Entities are swapped for deterministic hashes so downstream models never see the original values.
        </p>
      </SettingsSection>

      <SettingsSection
        title="Preferred Models"
        description="Drag to rank your top large-language models. Highest priority is attempted first."
      >
        <div className="card p-5">
          <Reorder.Group axis="y" values={modelOrder} onReorder={setModelOrder} className="space-y-3">
            {modelOrder.map((model, index) => (
              <Reorder.Item key={model} value={model} className="list-none">
                <motion.div layout className="flex items-center justify-between gap-4 rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-4 py-3 text-sm font-medium text-[rgb(var(--text))] transition-all duration-300 hover:-translate-y-[1px]">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-[color:rgba(var(--text)/0.4)]" />
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--brand)]/15 text-xs font-semibold text-[color:var(--brand)]">{index + 1}</span>
                    {model}
                  </div>
                  <button
                    type="button"
                    onClick={() => setModelOrder((prev) => prev.filter((entry) => entry !== model))}
                    className="text-xs text-[color:rgba(var(--text)/0.5)] transition hover:text-red-500"
                  >
                    Remove
                  </button>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          {additionalModels.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {additionalModels.map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => setModelOrder((prev) => [...prev, model])}
                  className="inline-flex items-center gap-2 rounded-full border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-3 py-1 text-xs font-semibold text-[color:var(--brand)] transition-all duration-300 hover:-translate-y-[1px]"
                >
                  <Plus className="h-3 w-3" />
                  {model}
                </button>
              ))}
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Telemetry Opt-In"
        description="Share anonymous product metrics to help improve Nexus.ai. No prompts or responses are ever logged."
        action={<Switch checked={telemetry} onChange={setTelemetry} label={telemetry ? "On" : "Off"} />}
      >
        <div className="flex items-center gap-3 text-sm text-[color:rgba(var(--text)/0.65)]">
          <AlertCircle className="h-4 w-4 text-[color:var(--brand)]" />
          Metrics flow through our privacy-preserving analytics pipeline. Toggle off to disable immediately.
        </div>
      </SettingsSection>

      <SettingsSection
        title="Custom Instructions"
        description="Set persistent guidance for the assistant. Autosaves locally; submit to sync across environments."
        action={
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--elev-1)]"
            onClick={handleSubmitInstructions}
          >
            <Send className="h-4 w-4" />
            Submit
          </button>
        }
      >
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={6}
          className="w-full rounded-[calc(var(--radius-xl)*1.2)] border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-5 py-4 text-sm leading-relaxed text-[rgb(var(--text))] outline-none focus:ring-2 focus:ring-[color:rgba(var(--ring)/.35)]"
          placeholder="Share tone, compliance rules, or escalation logic..."
        />
        <div className="text-xs text-[color:rgba(var(--text)/0.55)]">
          {lastSaved ? `Autosaved ${lastSaved.toLocaleTimeString()}` : "Start typing to autosave."}
        </div>
      </SettingsSection>

      <SettingsSection
        title="User Feedback"
        description="Tell us what feels magical or rough. Responses go straight to the Nexus.ai team."
        action={
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--elev-1)]"
            onClick={() => openModal("feedback")}
          >
            <Sparkle className="h-4 w-4" />
            Share
          </button>
        }
      >
        <p className="text-sm text-[color:rgba(var(--text)/0.65)]">
          We cap feedback at 20,000 characters and respond within 48 hours. Include screenshots or reproduction steps if relevant.
        </p>
      </SettingsSection>
    </div>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 text-xs font-semibold text-[color:rgba(var(--text)/0.65)]"
    >
      <span
        className={cn(
          "flex h-10 w-20 items-center rounded-full border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-1 transition-all duration-300",
          checked && "justify-end"
        )}
      >
        <motion.span
          layout
          className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--brand)]/15 text-[color:var(--brand)]"
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {checked ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-[color:var(--brand)]" />}
        </motion.span>
      </span>
      <span>{label}</span>
    </button>
  );
}

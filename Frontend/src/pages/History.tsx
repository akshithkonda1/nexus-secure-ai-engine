import { useEffect, useMemo, useState } from "react";
import { HistorySection } from "@/components/HistorySection";
import { formatBytes } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import { Shield, Download } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type AuditRecord = {
  id: string;
  query: string;
  at: string;
  tokens: number;
};

const auditTrail: AuditRecord[] = Array.from({ length: 6 }).map((_, idx) => ({
  id: crypto.randomUUID(),
  query: `User ${idx + 1} · "${["Summarise contract", "Translate email", "Draft meeting notes", "Extract PII", "Generate changelog", "Highlight anomalies"][idx]}"`,
  at: new Date(Date.now() - idx * 1000 * 60 * 42).toLocaleString(),
  tokens: 200 + idx * 45
}));

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
  const numeric = parseInt(normalized, 16);
  if (Number.isNaN(numeric)) return `rgba(78, 123, 255, ${alpha})`;
  const r = (numeric >> 16) & 255;
  const g = (numeric >> 8) & 255;
  const b = numeric & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function parseTuple(variable: string, fallback: [number, number, number]): [number, number, number] {
  const values = variable
    .trim()
    .split(/\s+/)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  if (values.length >= 3) {
    return [values[0], values[1], values[2]];
  }
  return fallback;
}

const encryptedLogs = Array.from({ length: 4 }).map((_, idx) => ({
  device: `Device-${idx + 1024}`,
  access: new Date(Date.now() - idx * 1000 * 60 * 23).toLocaleString(),
  fingerprint: `sha256:${crypto.randomUUID().slice(0, 12)}`,
  size: 1024 * 8 * (idx + 1)
}));

const translations = [
  {
    source: JSON.stringify({ prompt: "[REDACTED] needs onboarding steps", lang: "en" }),
    output: "User requested onboarding flow; PII removed."
  },
  {
    source: JSON.stringify({ prompt: "[REDACTED] contract summary", lang: "es" }),
    output: "Summary produced without names or orgs."
  }
];

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function History() {
  const [themeName, setThemeName] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateTheme = () => {
      setThemeName(document.documentElement.classList.contains("dark") ? "dark" : "light");
    };
    const handleThemeEvent = (event: Event) => {
      const detail = (event as CustomEvent<string | undefined>).detail;
      if (detail === "light" || detail === "dark") {
        setThemeName(detail);
      } else {
        updateTheme();
      }
    };
    updateTheme();
    window.addEventListener("nexus-theme-change", handleThemeEvent);
    return () => window.removeEventListener("nexus-theme-change", handleThemeEvent);
  }, []);

  const palette = useMemo(() => {
    if (typeof window === "undefined") {
      const fallbackTuple: [number, number, number] = themeName === "dark" ? [255, 255, 255] : [0, 0, 0];
      const [r, g, b] = fallbackTuple;
      const brand = "#4e7bff";
      return {
        brand,
        brandFill: hexToRgba(brand, 0.18),
        brandPoint: brand,
        tick: `rgba(${r}, ${g}, ${b}, 0.55)`,
        grid: `rgba(${r}, ${g}, ${b}, 0.12)`
      };
    }
    const style = getComputedStyle(document.documentElement);
    const brand = style.getPropertyValue("--brand").trim() || "#4e7bff";
    const textTuple = parseTuple(
      style.getPropertyValue("--text"),
      themeName === "dark" ? [255, 255, 255] : [0, 0, 0]
    );
    const [r, g, b] = textTuple;
    return {
      brand,
      brandFill: hexToRgba(brand, 0.18),
      brandPoint: brand,
      tick: `rgba(${r}, ${g}, ${b}, 0.55)`,
      grid: `rgba(${r}, ${g}, ${b}, 0.12)`
    };
  }, [themeName]);

  const analyticsData = useMemo(
    () => ({
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Secure sessions",
          data: [8, 15, 12, 18, 22, 9, 14],
          fill: true,
          tension: 0.35,
          borderColor: palette.brand,
          backgroundColor: palette.brandFill,
          pointRadius: 3,
          pointBackgroundColor: palette.brandPoint
        }
      ]
    }),
    [palette]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { intersect: false, mode: "index" as const }
      },
      scales: {
        x: {
          ticks: { color: palette.tick },
          grid: { display: false }
        },
        y: {
          ticks: { color: palette.tick, padding: 8 },
          grid: { color: palette.grid }
        }
      }
    }),
    [palette]
  );

  const totalTokens = useMemo(() => auditTrail.reduce((sum, item) => sum + item.tokens, 0), []);

  return (
    <div className="space-y-8 pt-6">
      <HistorySection
        title="Audit Trail"
        description="Immutable snapshot of anonymised user interactions."
        actions={
          <div className="flex items-center gap-2">
            <ExportButton label="JSON" onClick={() => downloadBlob("audit-trail.json", JSON.stringify(auditTrail, null, 2), "application/json")} />
            <ExportButton label="Excel" onClick={() => downloadBlob("audit-trail.xlsx", "Mock Excel export — connect real pipeline.", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")} />
            <ExportButton label="DOCX" onClick={() => downloadBlob("audit-trail.docx", "Mock DOCX export", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")} />
          </div>
        }
      >
        <div className="overflow-hidden rounded-3xl border border-[rgb(var(--border)/0.55)] bg-[rgb(var(--surface)/0.86)] shadow-soft dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.6)]">
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 border-b border-[rgb(var(--border)/0.45)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(var(--text)/0.55)] dark:border-[rgb(var(--border)/0.5)]">
            <span>Query</span>
            <span>Timestamp</span>
            <span>Tokens</span>
          </div>
          <div className="divide-y divide-[rgb(var(--border)/0.35)] text-sm dark:divide-[rgb(var(--border)/0.5)]">
            {auditTrail.map((record) => (
              <div key={record.id} className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-6 py-3">
                <span className="truncate">{record.query}</span>
                <span className="text-[rgb(var(--text)/0.6)]">{record.at}</span>
                <span className="font-medium text-[color:var(--brand)]">{record.tokens}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-6 py-3 text-xs text-[rgb(var(--text)/0.6)]">
            <span>Total tokens processed</span>
            <span className="font-semibold text-[rgb(var(--text))]">{totalTokens.toLocaleString()}</span>
          </div>
        </div>
      </HistorySection>

      <HistorySection
        title="Visual Analytics"
        description="Behavioural insights derived from secure usage."
      >
        <div className="rounded-3xl border border-[rgb(var(--border)/0.55)] bg-[rgb(var(--surface)/0.86)] p-6 shadow-soft dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.62)]">
          <Line data={analyticsData} options={chartOptions} />
        </div>
      </HistorySection>

      <HistorySection
        title="Encrypted Logs"
        description="Device metadata and cryptographic fingerprints for compliance."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {encryptedLogs.map((log) => (
            <div key={log.fingerprint} className="rounded-3xl border border-[rgb(var(--border)/0.55)] bg-[rgb(var(--surface)/0.86)] p-4 shadow-soft dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.6)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--text))]">
                <Shield className="h-4 w-4 text-[color:var(--brand)]" />
                {log.device}
              </div>
              <div className="mt-2 text-xs text-[rgb(var(--text)/0.6)]">Accessed {log.access}</div>
              <div className="mt-2 text-xs font-mono text-[rgb(var(--text))]">{log.fingerprint}</div>
              <div className="mt-3 text-xs text-[rgb(var(--text)/0.6)]">Payload: {formatBytes(log.size)}</div>
            </div>
          ))}
        </div>
      </HistorySection>

      <HistorySection
        title="Anonymized Translations"
        description="Language pivots scrubbed of personal data."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {translations.map((item, idx) => (
            <div key={idx} className="rounded-3xl border border-[rgb(var(--border)/0.55)] bg-[rgb(var(--surface)/0.86)] p-4 shadow-soft dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.6)]">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[rgb(var(--text)/0.5)]">Source</div>
              <p className="mt-1 text-sm text-[rgb(var(--text))]">{item.source}</p>
              <div className="mt-4 text-[11px] uppercase tracking-[0.18em] text-[rgb(var(--text)/0.5)]">Output</div>
              <p className="mt-1 text-sm font-medium text-[color:var(--brand)]">{item.output}</p>
            </div>
          ))}
        </div>
      </HistorySection>
    </div>
  );
}

function ExportButton({ label, onClick }: { label: string; onClick: ButtonHTMLAttributes<HTMLButtonElement>["onClick"] }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-[rgb(var(--border)/0.55)] bg-[rgb(var(--surface)/0.86)] px-3 py-1 text-xs font-semibold text-[rgb(var(--text))] shadow-soft transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.6)]"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

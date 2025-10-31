import { useEffect, useState } from "react";
import { fetchCapabilities } from "@/services/api/client";

export function SystemPage() {
  const [caps, setCaps] = useState<any>(null);
  useEffect(() => {
    fetchCapabilities().then(setCaps);
  }, []);
  const exportJson = (name: string, data: unknown) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">System</h2>
      <section id="library">
        <h3 className="font-medium mb-2">Library</h3>
        <div className="text-sm text-muted-foreground">Coming soon.</div>
      </section>
      <section id="projects">
        <h3 className="font-medium mb-2">Projects</h3>
        <div className="text-sm text-muted-foreground">Recent projects render in right rail.</div>
      </section>
      <section id="audit">
        <h3 className="font-medium mb-2">Audit Trail</h3>
        <button
          className="px-3 py-2 rounded-md border"
          disabled={!caps?.exportAudit}
          onClick={() => exportJson("audit-trail", { ok: true })}
        >
          Export JSON
        </button>
      </section>
      <section id="encryption">
        <h3 className="font-medium mb-2">Encryption</h3>
        <button
          className="px-3 py-2 rounded-md border"
          disabled={!caps?.exportEncryption}
          onClick={() => exportJson("encryption-config", { cipher: "AES-256-GCM" })}
        >
          Export JSON
        </button>
      </section>
      <section id="settings">
        <h3 className="font-medium mb-2">Settings</h3>
        <div className="text-sm text-muted-foreground">Workspace controls and compliance options coming soon.</div>
      </section>
    </div>
  );
}

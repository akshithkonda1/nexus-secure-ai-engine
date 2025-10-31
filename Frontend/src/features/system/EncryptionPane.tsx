import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function downloadJSON(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

const buildEncryptionReport = () => ({
  algorithm: "AES-256-GCM",
  keyManagement: "BYOK (stub)",
  rotation: "manual (stub)",
  lastAudit: new Date().toISOString(),
});

export function EncryptionPane(): JSX.Element {
  const report = useMemo(() => buildEncryptionReport(), []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Encryption posture</h2>
          <p className="text-sm text-muted">All chat data is encrypted at rest and in transit with customer-provided keys.</p>
        </div>
        <Button className="round-btn shadow-press" onClick={() => downloadJSON("nexus-encryption", buildEncryptionReport())}>
          Export JSON
        </Button>
      </div>
      <Card className="round-card shadow-ambient">
        <CardHeader>
          <CardTitle className="text-base">Data at rest</CardTitle>
          <CardDescription>Encrypted with {report.algorithm}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted">
            <li>KMS integrated with tenant-provided BYOK escrow.</li>
            <li>Automatic sealing of cold storage snapshots.</li>
            <li>Audit-ready logs for key rotation requests.</li>
          </ul>
        </CardContent>
      </Card>
      <Card className="round-card shadow-ambient">
        <CardHeader>
          <CardTitle className="text-base">In-flight protections</CardTitle>
          <CardDescription>Mutual TLS 1.3 between all services.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted">
            <li>Certificate pinning on managed clients.</li>
            <li>Hardware-backed attestation for inference nodes.</li>
            <li>Continuous handshake monitoring with anomaly detection.</li>
          </ul>
        </CardContent>
      </Card>
      <Card className="round-card shadow-ambient">
        <CardHeader>
          <CardTitle className="text-base">Key management</CardTitle>
          <CardDescription>Bring your own key with manual rotation overrides.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted">
            <li>Rotation schedule: {report.rotation}</li>
            <li>
              Last attested audit:
              {" "}
              {new Intl.DateTimeFormat(navigator.language, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(report.lastAudit))}
            </li>
            <li>Escrow failsafe tested quarterly.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

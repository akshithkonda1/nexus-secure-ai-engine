import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/components/card";

const posture = {
  algorithm: "AES-256-GCM",
  transport: "TLS 1.2+",
  byok: true,
  rotation: "manual",
  lastAudit: new Date().toISOString()
};

function exportPosture() {
  const blob = new Blob([JSON.stringify(posture, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "encryption-posture.json";
  link.click();
  URL.revokeObjectURL(url);
}

export default function EncryptionPane() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Encryption posture</CardTitle>
        <CardDescription>Your encryption summary is client-side generated for quick exports.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="rounded-card bg-surface p-4 text-sm text-muted">{JSON.stringify(posture, null, 2)}</pre>
        <Button onClick={exportPosture}>Export JSON</Button>
      </CardContent>
    </Card>
  );
}

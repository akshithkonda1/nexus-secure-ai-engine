import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { getAuditEvents } from "@/shared/lib/audit";

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function AuditTrailPane() {
  const events = getAuditEvents();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => downloadJson("audit-trail.json", events)}>Export JSON</Button>
      </div>
      <div className="space-y-3">
        {events.length === 0 && <p className="text-sm text-muted">Audit log will populate as you interact with Nexus.ai.</p>}
        {events.map((event) => (
          <Card key={event.ts}>
            <CardHeader>
              <CardTitle className="text-base font-medium">{event.type}</CardTitle>
              <CardDescription>{new Date(event.ts).toLocaleString()}</CardDescription>
            </CardHeader>
            {event.meta && (
              <CardContent>
                <pre className="rounded-card bg-surface p-3 text-xs text-muted">{JSON.stringify(event.meta, null, 2)}</pre>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

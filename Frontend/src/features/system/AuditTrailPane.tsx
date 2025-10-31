import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listEvents, type AuditEvent } from "@/shared/lib/audit";

function downloadJSON(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function AuditTrailPane(): JSX.Element {
  const [events, setEvents] = useState<AuditEvent[]>(() => listEvents());

  useEffect(() => {
    const refresh = () => setEvents(listEvents());
    window.addEventListener("storage", refresh);
    window.addEventListener("nexus-audit-log", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("nexus-audit-log", refresh);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Audit activity</h2>
          <p className="text-sm text-muted">Recent workspace actions captured for compliance.</p>
        </div>
        <Button className="round-btn shadow-press" onClick={() => downloadJSON("nexus-audit", events)}>
          Export JSON
        </Button>
      </div>
      {events.length === 0 ? (
        <Card className="round-card shadow-ambient">
          <CardHeader>
            <CardTitle className="text-base">No audit events yet</CardTitle>
            <CardDescription>Actions like chat archiving, profile updates, or theme changes appear here.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        events.map((event) => (
          <Card key={`${event.type}-${event.ts}`} className="round-card shadow-ambient">
            <CardHeader>
              <CardTitle className="text-base">{event.type}</CardTitle>
              <CardDescription>
                {new Intl.DateTimeFormat(navigator.language, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(event.ts))}
              </CardDescription>
            </CardHeader>
            {event.meta ? (
              <CardContent>
                <pre className="round-card bg-[var(--app-muted)] px-3 py-2 text-xs text-muted">
                  {JSON.stringify(event.meta, null, 2)}
                </pre>
              </CardContent>
            ) : null}
          </Card>
        ))
      )}
    </div>
  );
}

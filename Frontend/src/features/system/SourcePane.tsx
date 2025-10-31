import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DataSource {
  id: string;
  name: string;
  status: "synced" | "syncing" | "error";
  lastSyncedAt: string;
  description: string;
}

const catalog: DataSource[] = [
  {
    id: "slack-archive",
    name: "Slack archive",
    status: "synced",
    lastSyncedAt: new Date().toISOString(),
    description: "Daily ingest of workspace channels with personally identifiable information filtered.",
  },
  {
    id: "confluence",
    name: "Confluence space",
    status: "syncing",
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    description: "Living documentation for governance policies and escalation playbooks.",
  },
  {
    id: "drive",
    name: "Encrypted drive",
    status: "synced",
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    description: "Evidence packs and SOC 2 reports stored in customer-managed storage.",
  },
];

function formatStatus(source: DataSource): { label: string; tone: string } {
  switch (source.status) {
    case "synced":
      return { label: "Healthy", tone: "text-emerald-500" };
    case "syncing":
      return { label: "Syncing", tone: "text-amber-500" };
    case "error":
      return { label: "Attention", tone: "text-red-500" };
    default:
      return { label: "Unknown", tone: "text-muted" };
  }
}

export function SourcePane(): JSX.Element {
  const sources = useMemo(() => catalog, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Source integrations</h2>
          <p className="text-sm text-muted">Connect evidence repositories that power agent responses.</p>
        </div>
        <Button className="round-btn shadow-press" variant="outline">
          Manage sources
        </Button>
      </div>
      {sources.map((source) => {
        const status = formatStatus(source);
        return (
          <Card key={source.id} className="round-card shadow-ambient">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{source.name}</CardTitle>
                <CardDescription>{source.description}</CardDescription>
              </div>
              <span className={`text-xs font-semibold uppercase ${status.tone}`}>{status.label}</span>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted">
                Last synced
                {" "}
                {new Intl.DateTimeFormat(navigator.language, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(source.lastSyncedAt))}
                {" · Scoped to tenant boundary"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditTrailPane } from "@/features/system/AuditTrailPane";
import { EncryptionPane } from "@/features/system/EncryptionPane";
import { SourcePane } from "@/features/system/SourcePane";
import { useUIStore } from "@/shared/state/ui";

const tabs = ["source", "audit", "encryption"] as const;
type TabValue = (typeof tabs)[number];

export default function SystemPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const setSystemPane = useUIStore((state) => state.setSystemPane);

  const queryTab = useMemo(() => {
    const requested = searchParams.get("tab");
    return tabs.includes(requested as TabValue) ? (requested as TabValue) : ("source" as TabValue);
  }, [searchParams]);

  const [tab, setTab] = useState<TabValue>(queryTab);

  useEffect(() => {
    setTab(queryTab);
    setSystemPane(queryTab);
  }, [queryTab, setSystemPane]);

  const handleTabChange = (value: string) => {
    const next = (value as TabValue) ?? "source";
    setTab(next);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", next);
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight">System</h1>
      <p className="text-sm text-muted-foreground">
        Tools, assets, and controls that power your workspace.
      </p>

      <Tabs value={tab} onValueChange={handleTabChange} className="mt-6">
        <TabsList className="round-card border border-subtle bg-[var(--app-surface)] shadow-ambient">
          <TabsTrigger value="source">Source</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
        </TabsList>

        <TabsContent value="source" className="mt-6">
          <SourcePane />
        </TabsContent>
        <TabsContent value="audit" className="mt-6">
          <AuditTrailPane />
        </TabsContent>
        <TabsContent value="encryption" className="mt-6">
          <EncryptionPane />
        </TabsContent>
      </Tabs>
    </div>
  );
}

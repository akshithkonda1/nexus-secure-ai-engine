import { useMemo } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { AuditTrailPane } from "@/features/system/AuditTrailPane";
import { EncryptionPane } from "@/features/system/EncryptionPane";
import { SourcePane } from "@/features/system/SourcePane";
import { useUIStore, type SystemPane } from "@/shared/state/ui";

const systemPaneLabels: Record<SystemPane, string> = {
  source: "Source",
  audit: "Audit Trail",
  encryption: "Encryption",
};

interface DrawerTabsProps {
  systemPane: SystemPane;
  setSystemPane: (pane: SystemPane) => void;
}

function DrawerTabs({ systemPane, setSystemPane }: DrawerTabsProps) {
  return (
    <Tabs
      value={systemPane}
      onValueChange={(value) => setSystemPane(value as SystemPane)}
      className="flex h-full flex-col"
    >
      <TabsList className="mx-4 mt-4 round-card border border-subtle bg-[var(--app-surface)] shadow-ambient">
        <TabsTrigger value="source">Source</TabsTrigger>
        <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        <TabsTrigger value="encryption">Encryption</TabsTrigger>
      </TabsList>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <TabsContent value="source" className="border-none bg-transparent p-0">
          <SourcePane />
        </TabsContent>
        <TabsContent value="audit" className="border-none bg-transparent p-0">
          <AuditTrailPane />
        </TabsContent>
        <TabsContent value="encryption" className="border-none bg-transparent p-0">
          <EncryptionPane />
        </TabsContent>
      </div>
    </Tabs>
  );
}

export function SystemDrawer(): JSX.Element {
  const isSystemDrawerOpen = useUIStore((state) => state.isSystemDrawerOpen);
  const closeSystemDrawer = useUIStore((state) => state.closeSystemDrawer);
  const systemPane = useUIStore((state) => state.systemPane);
  const setSystemPane = useUIStore((state) => state.setSystemPane);

  const heading = useMemo(() => systemPaneLabels[systemPane] ?? "Workspace", [systemPane]);

  if (!isSystemDrawerOpen) {
    return null;
  }

  return (
    <Sheet
      open={isSystemDrawerOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeSystemDrawer();
        }
      }}
    >
      <SheetContent side="right" className="w-full max-w-lg p-0">
        <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">System drawer</p>
            <p className="text-lg font-semibold">{heading}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => closeSystemDrawer()} aria-label="Close drawer">
            ✕
          </Button>
        </div>
        <div className="h-full overflow-y-auto">
          <DrawerTabs systemPane={systemPane} setSystemPane={setSystemPane} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

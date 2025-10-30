import { useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { AuditTrailPane } from "@/features/system/AuditTrailPane";
import { EncryptionPane } from "@/features/system/EncryptionPane";
import { LibraryPane } from "@/features/system/LibraryPane";
import { ProjectsPane } from "@/features/system/ProjectsPane";
import { ModelsPane } from "@/features/system/ModelsPane";
import { useSessionStore } from "@/shared/state/session";
import { useUIStore, type SystemPane } from "@/shared/state/ui";

const defaultSidebarPaneByMode = {
  student: "library",
  business: "projects",
  nexusos: "models",
} as const;

type SidebarPane = (typeof defaultSidebarPaneByMode)[keyof typeof defaultSidebarPaneByMode];
type DrawerTab = "source" | "audit" | "encryption";

export function SystemDrawer(): JSX.Element {
  const mode = useSessionStore((state) => state.mode);
  const isSystemDrawerOpen = useUIStore((state) => state.isSystemDrawerOpen);
  const closeSystemDrawer = useUIStore((state) => state.closeSystemDrawer);
  const systemPane = useUIStore((state) => state.systemPane);
  const setSystemPane = useUIStore((state) => state.setSystemPane);
  const openSystemDrawer = useUIStore((state) => state.openSystemDrawer);

  const defaultSidebarPane = defaultSidebarPaneByMode[mode];
  const sidebarPaneMemoryRef = useRef<SidebarPane>(defaultSidebarPane);

  useEffect(() => {
    sidebarPaneMemoryRef.current = defaultSidebarPane;
    setSystemPane(defaultSidebarPane);
  }, [defaultSidebarPane, setSystemPane]);

  useEffect(() => {
    if (isSidebarPane(systemPane)) {
      sidebarPaneMemoryRef.current = systemPane;
    }
  }, [systemPane]);

  const sidebarPane = isSidebarPane(systemPane)
    ? systemPane
    : sidebarPaneMemoryRef.current;

  const activeDrawerTab: DrawerTab = (() => {
    switch (systemPane) {
      case "audit":
        return "audit";
      case "encryption":
        return "encryption";
      default:
        return "source";
    }
  })();

  return (
    <>
      <aside className="hidden w-[320px] flex-shrink-0 border-l border-subtle bg-[var(--app-surface)] xl:flex">
        <div className="flex w-full items-center justify-between border-b border-subtle px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">System drawer</p>
            <p className="text-lg font-semibold">{sidebarPaneLabel(sidebarPane)}</p>
          </div>
        </div>
        <SidebarTabs systemPane={sidebarPane} setSystemPane={setSystemPane} />
      </aside>
      <Sheet open={isSystemDrawerOpen} onOpenChange={(open) => (open ? openSystemDrawer() : closeSystemDrawer())}>
        <SheetContent side="right" className="w-full max-w-md p-0">
          <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">System drawer</p>
              <p className="text-lg font-semibold">{drawerTabLabel(activeDrawerTab)}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => closeSystemDrawer()} aria-label="Close drawer">
              ✕
            </Button>
          </div>
          <div className="h-full overflow-y-auto">
            <DrawerTabs
              activeTab={activeDrawerTab}
              onTabChange={(value) =>
                setSystemPane(value === "source" ? "library" : (value as SystemPane))
              }
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function SidebarTabs({
  systemPane,
  setSystemPane,
}: {
  systemPane: SidebarPane;
  setSystemPane: (pane: SystemPane) => void;
}) {
  return (
    <Tabs
      value={systemPane}
      onValueChange={(value) => setSystemPane(value as SystemPane)}
      className="flex h-full flex-col"
    >
      <TabsList className="mx-4 mt-4 round-card border border-subtle bg-[var(--app-surface)] shadow-ambient">
        <TabsTrigger value="library">Library</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="models">Models</TabsTrigger>
      </TabsList>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <TabsContent value="library" className="border-none bg-transparent p-0">
          <LibraryPane />
        </TabsContent>
        <TabsContent value="projects" className="border-none bg-transparent p-0">
          <ProjectsPane />
        </TabsContent>
        <TabsContent value="models" className="border-none bg-transparent p-0">
          <ModelsPane />
        </TabsContent>
      </div>
    </Tabs>
  );
}

function DrawerTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: DrawerTab;
  onTabChange: (pane: DrawerTab) => void;
}) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as DrawerTab)}
      className="flex h-full flex-col"
    >
      <TabsList className="mx-4 mt-4 round-card border border-subtle bg-[var(--app-surface)] shadow-ambient">
        <TabsTrigger value="source">Sources</TabsTrigger>
        <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        <TabsTrigger value="encryption">Encryption</TabsTrigger>
      </TabsList>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <TabsContent value="source" className="border-none bg-transparent p-0">
          <LibraryPane
            title="Sources"
            description="Reference datasets, starter packs, and resources powering your agents."
          />
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

function isSidebarPane(pane: SystemPane): pane is SidebarPane {
  return pane === "library" || pane === "projects" || pane === "models";
}

function sidebarPaneLabel(pane: SidebarPane) {
  switch (pane) {
    case "library":
      return "Library";
    case "projects":
      return "Projects";
    case "models":
      return "Models";
    default:
      return "Workspace";
  }
}

function drawerTabLabel(tab: DrawerTab) {
  switch (tab) {
    case "source":
      return "Sources";
    case "audit":
      return "Audit Trail";
    case "encryption":
      return "Encryption";
    default:
      return "Workspace";
  }
}

import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { LibraryPane } from "@/features/system/LibraryPane";
import { ProjectsPane } from "@/features/system/ProjectsPane";
import { ModelsPane } from "@/features/system/ModelsPane";
import { useSessionStore } from "@/shared/state/session";
import { useUIStore, type SystemPane } from "@/shared/state/ui";

const defaultPaneByMode = {
  student: "library",
  business: "projects",
  nexusos: "models",
} as const;

export function SystemDrawer(): JSX.Element {
  const mode = useSessionStore((state) => state.mode);
  const isSystemDrawerOpen = useUIStore((state) => state.isSystemDrawerOpen);
  const closeSystemDrawer = useUIStore((state) => state.closeSystemDrawer);
  const systemPane = useUIStore((state) => state.systemPane);
  const setSystemPane = useUIStore((state) => state.setSystemPane);
  const openSystemDrawer = useUIStore((state) => state.openSystemDrawer);

  const drawerPane: "library" | "projects" | "models" =
    systemPane === "audit" || systemPane === "encryption" ? "library" : systemPane;

  useEffect(() => {
    const target = defaultPaneByMode[mode];
    setSystemPane(target);
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      openSystemDrawer(target);
    }
  }, [mode, openSystemDrawer, setSystemPane]);

  return (
    <>
      <aside className="hidden w-[320px] flex-shrink-0 border-l border-subtle bg-[var(--app-surface)] xl:flex">
        <div className="flex w-full items-center justify-between border-b border-subtle px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">System drawer</p>
            <p className="text-lg font-semibold">{systemPaneLabel(drawerPane)}</p>
          </div>
        </div>
        <DrawerTabs systemPane={drawerPane} setSystemPane={setSystemPane} />
      </aside>
      <Sheet open={isSystemDrawerOpen} onOpenChange={(open) => (open ? openSystemDrawer() : closeSystemDrawer())}>
        <SheetContent side="right" className="w-full max-w-md p-0">
          <div className="flex items-center justify-between border-b border-subtle px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">System drawer</p>
              <p className="text-lg font-semibold">{systemPaneLabel(drawerPane)}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => closeSystemDrawer()} aria-label="Close drawer">
              ✕
            </Button>
          </div>
          <div className="h-full overflow-y-auto">
            <DrawerTabs systemPane={drawerPane} setSystemPane={setSystemPane} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function DrawerTabs({
  systemPane,
  setSystemPane,
}: {
  systemPane: "library" | "projects" | "models";
  setSystemPane: (pane: SystemPane) => void;
}) {
  return (
    <Tabs value={systemPane} onValueChange={(value) => setSystemPane(value as SystemPane)} className="flex h-full flex-col">
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

function systemPaneLabel(pane: string) {
  switch (pane) {
    case "library":
      return "Library";
    case "projects":
      return "Projects";
    case "models":
      return "Models";
    case "audit":
      return "Audit Trail";
    case "encryption":
      return "Encryption";
    default:
      return "Workspace";
  }
}

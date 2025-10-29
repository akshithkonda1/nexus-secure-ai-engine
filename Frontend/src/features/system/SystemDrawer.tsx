import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/ui/tabs";
import { useUIStore } from "../../shared/state/ui";
import { useSessionStore } from "../../shared/state/session";
import { LibraryPane } from "./LibraryPane";
import { ProjectsPane } from "./ProjectsPane";
import { ModelsPane } from "./ModelsPane";

export function SystemDrawer() {
  const open = useUIStore((state) => state.systemDrawerOpen);
  const setOpen = useUIStore((state) => state.setSystemDrawerOpen);
  const activePane = useUIStore((state) => state.activeSystemPane);
  const setActivePane = useUIStore((state) => state.setActiveSystemPane);
  const mode = useSessionStore((state) => state.mode);

  useEffect(() => {
    if (mode === "student") setActivePane("library");
    if (mode === "business") setActivePane("projects");
    if (mode === "nexusos") setActivePane("models");
    setOpen(true);
  }, [mode, setActivePane, setOpen]);

  if (!open) {
    return null;
  }

  return (
    <aside className="hidden w-[320px] shrink-0 border-l border-subtle bg-surface/70 px-5 py-6 shadow-inner lg:flex">
      <Tabs value={activePane} onValueChange={(value) => setActivePane(value as typeof activePane)} className="w-full">
        <TabsList className="mb-4 w-full justify-start gap-2 bg-slate-900/10 p-1">
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>
        <div className="space-y-4 text-xs text-muted">
          <p className="text-sm font-medium text-white">System context</p>
          <TabsContent value="library">
            <LibraryPane />
          </TabsContent>
          <TabsContent value="projects">
            <ProjectsPane />
          </TabsContent>
          <TabsContent value="models">
            <ModelsPane />
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}

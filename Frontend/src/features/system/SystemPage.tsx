import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/components/tabs";
import { useUIStore } from "@/shared/state/ui";
import LibraryPane from "@/features/system/LibraryPane";
import ProjectsPane from "@/features/system/ProjectsPane";
import AuditTrailPane from "@/features/system/AuditTrailPane";
import EncryptionPane from "@/features/system/EncryptionPane";

export default function SystemPage() {
  const tab = useUIStore((state) => state.systemTab);
  const setTab = useUIStore((state) => state.setSystemTab);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">System</h1>
        <p className="text-muted">Tools and controls that power your workspace.</p>
      </header>
      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList className="flex gap-2">
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
        </TabsList>
        <TabsContent value="library">
          <LibraryPane />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectsPane />
        </TabsContent>
        <TabsContent value="audit">
          <AuditTrailPane />
        </TabsContent>
        <TabsContent value="encryption">
          <EncryptionPane />
        </TabsContent>
      </Tabs>
    </section>
  );
}

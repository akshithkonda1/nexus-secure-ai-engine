import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/components/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/components/alert";
import { useUIStore } from "@/shared/state/ui";
import LibraryPane from "@/features/system/LibraryPane";
import ProjectsPane from "@/features/system/ProjectsPane";
import AuditTrailPane from "@/features/system/AuditTrailPane";
import EncryptionPane from "@/features/system/EncryptionPane";
import { useCapabilities } from "@/services/api/client";

export default function SystemPage() {
  const tab = useUIStore((state) => state.systemTab);
  const setTab = useUIStore((state) => state.setSystemTab);
  const { data: capabilities } = useCapabilities();

  const auditEnabled = capabilities?.auditTrail ?? true;
  const encryptionEnabled = capabilities?.encryptionExport ?? false;

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">System</h1>
        <p className="text-muted">Tools and controls that power your workspace.</p>
      </header>
      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList className="flex flex-wrap gap-2 rounded-full bg-app/40 p-1">
          <TabsTrigger value="library" className="rounded-full px-4">Library</TabsTrigger>
          <TabsTrigger value="projects" className="rounded-full px-4">Projects</TabsTrigger>
          <TabsTrigger value="audit" className="rounded-full px-4">Audit Trail</TabsTrigger>
          <TabsTrigger value="encryption" className="rounded-full px-4">Encryption</TabsTrigger>
        </TabsList>
        <TabsContent value="library">
          <LibraryPane />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectsPane />
        </TabsContent>
        <TabsContent value="audit" className="space-y-4">
          {!auditEnabled && (
            <Alert variant="warning">
              <AlertTitle>Audit exports disabled</AlertTitle>
              <AlertDescription>
                Your current capabilities disable audit log exports. Upgrade when the pricing lock expires to enable this feature.
              </AlertDescription>
            </Alert>
          )}
          <AuditTrailPane canExport={auditEnabled} />
        </TabsContent>
        <TabsContent value="encryption" className="space-y-4">
          {!encryptionEnabled && (
            <Alert variant="warning">
              <AlertTitle>Encryption exports disabled</AlertTitle>
              <AlertDescription>
                Encryption export capabilities are currently off. They will enable automatically once your workspace unlocks.
              </AlertDescription>
            </Alert>
          )}
          <EncryptionPane canExport={encryptionEnabled} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent } from "@/shared/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/components/tabs";
import { useCapabilities } from "@/services/api/client";

const chips = [
  {
    id: "chat",
    title: "Start a guided chat",
    description: "Use the proof-first assistant to clarify any topic.",
    action: "/chat"
  },
  {
    id: "projects",
    title: "Review recent projects",
    description: "Jump back into your automated builds and briefs.",
    action: "/projects"
  },
  {
    id: "library",
    title: "Browse the library",
    description: "Curated debate transcripts and verified briefs.",
    action: "/library"
  },
  {
    id: "system",
    title: "Check system health",
    description: "Run audits, encryption exports, and compliance.",
    action: "/system"
  }
] as const;

export function WelcomeHub() {
  const navigate = useNavigate();
  const { data: capabilities } = useCapabilities();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl space-y-4"
      >
        <p className="text-sm uppercase tracking-[0.3em] text-muted">Welcome to Nexus</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Proof-first intelligence for every mode.</h1>
        <p className="text-lg text-muted">
          Nexus orchestrates multiple reasoning engines, debates their answers, and surfaces the consensus with citations. Switch
          modes any time to tune the experience.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" className="rounded-full px-8" onClick={() => navigate("/chat")}>Start chatting</Button>
          <Button size="lg" variant="outline" className="rounded-full px-8" onClick={() => navigate("/pricing")}>
            View pricing
          </Button>
        </div>
      </motion.div>

      <motion.div
        className="grid w-full max-w-4xl gap-4 md:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } }
        }}
      >
        {chips.map((chip) => (
          <motion.button
            key={chip.id}
            type="button"
            onClick={() => navigate(chip.action)}
            className="group"
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          >
            <Card className="h-full rounded-3xl border border-app/40 bg-app/60 text-left shadow-ambient transition group-hover:shadow-lg">
              <CardContent className="space-y-2 p-6">
                <p className="text-sm font-medium uppercase tracking-wider text-muted">{chip.title}</p>
                <p className="text-base text-app/90">{chip.description}</p>
              </CardContent>
            </Card>
          </motion.button>
        ))}
      </motion.div>

      <Tabs defaultValue="capabilities" className="w-full max-w-3xl">
        <TabsList className="mx-auto w-full justify-center rounded-full bg-app/40 p-1">
          <TabsTrigger value="capabilities" className="rounded-full">Capabilities</TabsTrigger>
          <TabsTrigger value="modes" className="rounded-full">Modes</TabsTrigger>
        </TabsList>
        <TabsContent
          value="capabilities"
          className="rounded-3xl border border-app/40 bg-app/60 p-6 text-left shadow-ambient"
        >
          <h2 className="text-lg font-semibold">System capabilities</h2>
          <ul className="mt-3 grid gap-3 text-sm text-muted sm:grid-cols-2">
            <li>Audit trail: {capabilities?.auditTrail ? "Enabled" : "Disabled"}</li>
            <li>Encryption export: {capabilities?.encryptionExport ? "Enabled" : "Disabled"}</li>
            <li>Quick projects synced: {(capabilities?.projects ?? []).length}</li>
            <li>Pricing lock: Enforced for 30 days post-install</li>
          </ul>
        </TabsContent>
        <TabsContent
          value="modes"
          className="rounded-3xl border border-app/40 bg-app/60 p-6 text-left shadow-ambient"
        >
          <h2 className="text-lg font-semibold">Workspace modes</h2>
          <ul className="mt-3 grid gap-3 text-sm text-muted sm:grid-cols-3">
            <li>
              <strong className="text-app">Student</strong>
              <p>Structured learning rituals with spaced repetition.</p>
            </li>
            <li>
              <strong className="text-app">Business</strong>
              <p>Operational analysis and reporting dashboards.</p>
            </li>
            <li>
              <strong className="text-app">NexusOS</strong>
              <p>Automation-first canvases with audit-grade exports.</p>
            </li>
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}

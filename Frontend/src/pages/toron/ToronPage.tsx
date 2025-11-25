import { AnimatePresence, motion } from "framer-motion";
import { ToronHeader } from "@/components/toron/ToronHeader";
import { ToronTabs } from "@/components/toron/ToronTabs";
import { ToronChats } from "@/components/toron/ToronChats";
import { ToronProjects } from "@/components/toron/ToronProjects";
import { ToronWorkspace } from "@/components/toron/ToronWorkspace";
import { useToron } from "@/state/toron/useToron";
import { useTheme } from "@/hooks/useTheme";
import "@/styles/toron.css";

export function ToronPage() {
  const { resolvedTheme } = useTheme();
  const { tab, setTab, chats, projects, addChat, removeChat, addProject, removeProject } = useToron();

  const renderContent = () => {
    switch (tab) {
      case "chats":
        return <ToronChats chats={chats} onCreate={addChat} onRemove={removeChat} />;
      case "projects":
        return <ToronProjects projects={projects} onCreate={addProject} onRemove={removeProject} />;
      case "workspace":
        return <ToronWorkspace />;
      default:
        return null;
    }
  };

  return (
    <div
      className="flex flex-col gap-6"
      style={{
        ["--toron-accent" as string]: "var(--toron-accent-base)",
        ["--toron-surface" as string]: resolvedTheme === "dark" ? "rgba(8,10,20,0.75)" : "rgba(255,255,255,0.9)",
      }}
    >
      <ToronHeader />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 28 }}
        className="space-y-4"
      >
        <ToronTabs activeTab={tab} onChange={setTab} />
        <div className="relative">
          <div className="toron-pane" />
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 230, damping: 28 }}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-elevated)]/70 p-4 sm:p-6 shadow-lg shadow-black/10"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ToronPage;

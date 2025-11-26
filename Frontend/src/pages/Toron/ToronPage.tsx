import ToronHeader from "@/components/toron/ToronHeader";
import { useToronStore } from "@/state/toron/toronStore";

import ToronInputBar from "./ToronInputBar";
import ToronMessageList from "./ToronMessageList";
import ToronSessionsSidebar from "./ToronSessionsSidebar";

export default function ToronPage() {
  const { createSession } = useToronStore();

  return (
    <main className="relative flex h-full">
      <div className="flex-1 flex flex-col">
        <ToronHeader onOpenProjects={() => {}} onNewChat={() => createSession()} />
        <ToronMessageList />
        <ToronInputBar />
      </div>

      <ToronSessionsSidebar />
    </main>
  );
}

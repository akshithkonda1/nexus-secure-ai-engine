import { useState } from "react";
import AppShell from "../layouts/AppShell";
import WorkspaceSurface from "../components/workspace/WorkspaceSurface";
import { CanvasMode } from "../components/workspace/types";

export default function WorkspacePage() {
  const [mode, setMode] = useState<CanvasMode>("pages");

  return (
    <AppShell contentClassName="h-full min-h-full w-full max-w-none px-4 py-4 sm:px-6 lg:px-10">
      <div className="relative flex h-full min-h-[calc(100vh-5rem)] w-full items-stretch justify-center">
        <WorkspaceSurface mode={mode} onModeChange={setMode} />
      </div>
    </AppShell>
  );
}

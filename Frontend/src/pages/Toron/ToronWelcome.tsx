import { memo } from "react";

import { safeRender } from "@/shared/lib/safeRender";

const Welcome = () =>
  safeRender(() => (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-[var(--panel-main)] p-6 text-center text-[var(--text-secondary)]">
      <div className="text-lg font-semibold text-[var(--text-primary)]">Welcome to Toron</div>
      <p className="max-w-md text-sm">Start by creating a session or sending a message. All actions are guarded so the workspace stays stable.</p>
    </div>
  ));

export const ToronWelcome = memo(Welcome);

export default ToronWelcome;

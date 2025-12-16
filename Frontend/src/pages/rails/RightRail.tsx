import { PropsWithChildren } from "react";

export default function RightRail({ children }: PropsWithChildren) {
  return (
    <aside className="glass-panel w-64 shrink-0 rounded-2xl px-4 py-6">
      {children}
    </aside>
  );
}

import { PropsWithChildren } from "react";

export default function RightRail({ children }: PropsWithChildren) {
  return (
    <aside className="w-64 shrink-0 border-l border-[var(--line-subtle)] bg-[var(--layer-surface)] px-4 py-6">
      {children}
    </aside>
  );
}

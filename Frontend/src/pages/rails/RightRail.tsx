import { PropsWithChildren } from "react";

export default function RightRail({ children }: PropsWithChildren) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-5 rounded-3xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-6 xl:flex">
      {children}
    </aside>
  );
}

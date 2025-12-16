import { PropsWithChildren } from "react";

export default function RightRail({ children }: PropsWithChildren) {
  return (
    <aside className="h-full w-full overflow-y-auto">
      {children}
    </aside>
  );
}

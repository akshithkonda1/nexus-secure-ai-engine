import type { PropsWithChildren } from "react";

interface ToronContentColumnProps {
  className?: string;
}

export function ToronContentColumn({ children, className }: PropsWithChildren<ToronContentColumnProps>) {
  return (
    <div className={`mx-auto w-full max-w-5xl px-3 sm:px-4 lg:px-6 ${className ?? ""}`}>
      {children}
    </div>
  );
}

export default ToronContentColumn;

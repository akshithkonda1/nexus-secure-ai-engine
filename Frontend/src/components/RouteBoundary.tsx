import { useEffect } from "react";

function RouteBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => () => undefined, []);
  return <>{children}</>;
}

export default RouteBoundary;

import { useEffect } from "react";

function RouteBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    return () => undefined;
  }, []);

  return <>{children}</>;
}

export default RouteBoundary;

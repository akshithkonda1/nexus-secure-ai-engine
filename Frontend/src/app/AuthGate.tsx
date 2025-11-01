import { useEffect, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, bootstrapAuth } from "@/shared/state/auth";
export function AuthGate({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();
  const loc = useLocation();
  useEffect(() => {
    if (!user) {
      void bootstrapAuth();
    }
  }, [user]);
  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!user && loc.pathname !== "/auth" && !loc.pathname.startsWith("/auth/")) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

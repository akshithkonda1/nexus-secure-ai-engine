import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bootstrapAuth } from "@/shared/state/auth";
export default function AuthCallback() {
  const nav = useNavigate();
  useEffect(() => { (async () => { await bootstrapAuth(); nav("/", { replace: true }); })(); }, [nav]);
  return <div className="p-8">Signing you in…</div>;
}

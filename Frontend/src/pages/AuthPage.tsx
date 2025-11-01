import { useState } from "react";
export default function AuthPage() {
  const [email, setEmail] = useState("");
  const base = "/api/auth";
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Sign in to Nexus</h1>
        <button className="btn w-full" onClick={() => (window.location.href = `${base}/login/google`)}>Continue with Google</button>
        <button className="btn w-full" onClick={() => (window.location.href = `${base}/login/facebook`)}>Continue with Facebook</button>
        <button className="btn w-full" onClick={() => (window.location.href = `${base}/login/x`)}>Continue with X</button>
        <div className="h-px bg-border my-2" />
        <form onSubmit={async (e) => {
          e.preventDefault();
          await fetch(`${base}/login/local`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            credentials: "include", body: JSON.stringify({ email }),
          });
          window.location.href = "/auth/callback?ok=1";
        }} className="space-y-2">
          <input className="input w-full" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <button className="btn w-full" type="submit">Continue with email</button>
        </form>
        <p className="text-xs text-muted-foreground">By continuing you agree to our Terms & Privacy.</p>
      </div>
    </div>
  );
}

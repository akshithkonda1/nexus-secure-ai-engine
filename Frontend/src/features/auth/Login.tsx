import { useSession } from "@/shared/state/session";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function LoginPage() {
  const { setUser } = useSession();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  function completeLogin(name: string) {
    setUser({ id: crypto.randomUUID(), name, email: email || `${name}@example.com` });
    nav("/");
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-full max-w-sm p-6 rounded-2xl border bg-card">
        <h1 className="text-2xl font-semibold mb-1">Sign in to Nexus</h1>
        <p className="text-sm text-muted-foreground mb-4">Continue with email or social.</p>

        <input
          className="w-full px-3 py-2 rounded-md border mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 rounded-md border mb-4"
          type="password"
          placeholder="Password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <button className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground mb-3" onClick={() => completeLogin("Local User")}>
          Continue
        </button>

        <div className="text-xs text-muted-foreground my-2 text-center">or</div>

        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => completeLogin("Google User")} className="px-3 py-2 rounded-md border">
            Google
          </button>
          <button onClick={() => completeLogin("Facebook User")} className="px-3 py-2 rounded-md border">
            Facebook
          </button>
          <button onClick={() => completeLogin("X User")} className="px-3 py-2 rounded-md border">
            X
          </button>
        </div>
      </div>
    </div>
  );
}

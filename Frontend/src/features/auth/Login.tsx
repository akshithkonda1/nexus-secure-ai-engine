import { SignInLayout } from "@/features/auth/SignInLayout";
import { Divider, SocialButton, type SignInProvider } from "@/features/auth/SignInPrimitives";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { useSession } from "@/shared/state/session";
import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/shared/state/auth";

export function LoginPage() {
  const { setUser } = useSession();
  const { setUser: setAuthUser, setLoading: setAuthLoading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function completeLogin(name: string, address?: string) {
    const resolvedEmail = address ?? email || `${name.replace(/\s+/g, "").toLowerCase()}@example.com`;
    const user = { id: crypto.randomUUID(), name, email: resolvedEmail };
    setAuthUser(user);
    setAuthLoading(false);
    setUser(user);
    nav("/");
  }

  const providers: SignInProvider[] = [
    {
      key: "google",
      label: "Continue with Google",
      helper: "Use your Google identity",
      accent: "bg-[#4285F4]",
      onSelect: () => completeLogin("Google User", "google-user@example.com"),
    },
    {
      key: "facebook",
      label: "Continue with Facebook",
      helper: "Stay synced with your team",
      accent: "bg-[#0866FF]",
      onSelect: () => completeLogin("Facebook User", "facebook-user@example.com"),
    },
    {
      key: "x",
      label: "Continue with X",
      helper: "Post-ready collaboration",
      accent: "bg-black",
      onSelect: () => completeLogin("X User", "x-user@example.com"),
    },
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password || loading) {
      return;
    }
    setLoading(true);
    completeLogin("Local User", email);
  }

  return (
    <SignInLayout
      heroTitle="Welcome back, creator"
      heroSubtitle="Jump straight into your chats, projects, and automations with a sign-in flow designed for modern product teams."
      highlights={[
        { title: "Persistent context", description: "All of your memory, projects, and prompt history instantly available." },
        { title: "Seamless hand-off", description: "Switch devices without losing state or collaborative context." },
        { title: "Account safeguards", description: "Adaptive multi-factor and anomaly detection keep sessions safe." },
        { title: "24/7 assistance", description: "Priority access to our success engineers whenever you need support." },
      ]}
    >
      <div className="rounded-[28px] border border-black/10 bg-card p-10 shadow-2xl shadow-black/20 backdrop-blur-xl dark:border-white/10">
        <header className="space-y-2 text-left">
          <h2 className="text-2xl font-semibold">Sign in to Nexus</h2>
          <p className="text-sm text-muted-foreground">Authenticate with your preferred method or use your workspace credentials.</p>
        </header>

        <div className="mt-6 space-y-3">
          {providers.map((provider) => (
            <SocialButton key={provider.key} provider={provider} />
          ))}
        </div>

        <Divider label="continue with credentials" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 text-left">
            <label htmlFor="login-email" className="text-sm font-medium text-muted-foreground">
              Email address
            </label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2 text-left">
            <label htmlFor="login-password" className="text-sm font-medium text-muted-foreground">
              Password
            </label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Forgot password?{' '}
              <a className="font-medium hover:underline" href="/reset">
                Reset it
              </a>
            </span>
            <a className="font-medium hover:underline" href="/signup">
              Create account
            </a>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading || !email || !password}>
            {loading ? "Signing in…" : "Continue"}
          </Button>
        </form>

        <p className="mt-6 text-xs text-muted-foreground">
          This secure demo login creates a local session for preview purposes only.
        </p>
      </div>
    </SignInLayout>
  );
}

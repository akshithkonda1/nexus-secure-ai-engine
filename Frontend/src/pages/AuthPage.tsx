import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { SignInLayout } from "@/features/auth/SignInLayout";
import { Divider, SocialButton, type SignInProvider } from "@/features/auth/SignInPrimitives";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const base = "/api/auth";

  const providers: SignInProvider[] = [
    {
      key: "google",
      label: "Continue with Google",
      helper: "Personal Gmail or Workspace",
      accent: "bg-[#4285F4]",
      onSelect: () => (window.location.href = `${base}/login/google`),
    },
    {
      key: "facebook",
      label: "Continue with Facebook",
      helper: "Connect with your community",
      accent: "bg-[#0866FF]",
      onSelect: () => (window.location.href = `${base}/login/facebook`),
    },
    {
      key: "x",
      label: "Continue with X",
      helper: "Accelerate announcements",
      accent: "bg-black",
      onSelect: () => (window.location.href = `${base}/login/x`),
    },
  ];

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${base}/login/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        setSubmitting(false);
        return;
      }

      window.location.href = "/auth/callback?ok=1";
    } catch (error) {
      console.error("Sign-in failed", error);
      setSubmitting(false);
    }
  }

  return (
    <SignInLayout
      heroTitle="Unlock your Nexus workspace"
      heroSubtitle="Secure, unified access for teams shipping ambitious AI products. Sign in to pick up exactly where you left off."
      highlights={[
        { title: "Enterprise-grade", description: "SOC 2 compliant single sign-on and audit trails ready for review." },
        { title: "Global by default", description: "Latency-aware regions keep your team in flow wherever they collaborate." },
        { title: "Privacy-first", description: "Data residency controls and granular permissions keep IP secure." },
        { title: "Onboarding concierge", description: "Dedicated specialists to help migrate prompts, knowledge, and workflows." },
      ]}
    >
      <div className="rounded-[28px] border border-black/10 bg-card p-10 shadow-2xl shadow-black/20 backdrop-blur-xl dark:border-white/10">
        <header className="space-y-2 text-left">
          <h2 className="text-2xl font-semibold">Sign in to Nexus</h2>
          <p className="text-sm text-muted-foreground">Choose a secure sign-in method to continue your session.</p>
        </header>

        <div className="mt-6 space-y-3">
          {providers.map((provider) => (
            <SocialButton key={provider.key} provider={provider} />
          ))}
        </div>

        <Divider label="or continue with email" />

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2 text-left">
            <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
              Work email
            </label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={!email || submitting}>
            {submitting ? "Connecting…" : "Continue with email"}
          </Button>
        </form>

        <div className="mt-6 rounded-2xl border border-black/10 bg-background/40 p-4 text-xs text-muted-foreground backdrop-blur dark:border-white/10">
          By continuing you agree to our
          <a className="mx-1 font-medium hover:underline" href="/legal/terms">
            Terms
          </a>
          &
          <a className="ml-1 font-medium hover:underline" href="/legal/privacy">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </SignInLayout>
  );
}

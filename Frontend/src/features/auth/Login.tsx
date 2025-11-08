import { BrandMark } from "@/shared/ui/BrandMark";
import { SocialButtons } from "@/shared/ui/social/SocialButtons";
import { LocalAccountForm } from "@/features/auth/components/LocalAccountForm";

export default function Login() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background/95 to-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.12),_transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.18),_transparent_60%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl space-y-8 rounded-[32px] border border-border/60 bg-card/80 p-10 shadow-[0_50px_140px_-60px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <header className="space-y-4 text-center">
            <BrandMark className="mx-auto h-10" />
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.35em] text-muted-foreground">WELCOME BACK</p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Sign in to Nexus</h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Choose a social provider or continue with your email credentials to access your workspace.
              </p>
            </div>
          </header>

          <SocialButtons className="mt-6" />

          <div className="relative text-center text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
            <span className="relative z-10 inline-block bg-card px-4">or continue with your email</span>
            <div className="absolute inset-x-8 top-1/2 -z-10 h-px bg-border" aria-hidden />
          </div>

          <LocalAccountForm className="pt-2" />

          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to Nexus security policies and acknowledge that multi-factor safeguards may apply.
          </p>
        </div>
      </div>
    </div>
  );
}

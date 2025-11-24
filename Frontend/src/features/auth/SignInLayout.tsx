import { BrandMark } from "@/shared/ui/BrandMark";
import type { ReactNode } from "react";

interface HighlightItem {
  title: string;
  description: string;
}

interface SignInLayoutProps {
  children: ReactNode;
  eyebrow?: string;
  heroTitle: string;
  heroSubtitle: string;
  highlights: HighlightItem[];
  footerLogos?: string[];
}

export function SignInLayout({
  children,
  eyebrow = "SECURE ACCESS",
  heroTitle,
  heroSubtitle,
  highlights,
  footerLogos = ["Airwave", "Sphere", "Daydream", "Cosmo"],
}: SignInLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <DecorativeBackdrop />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-16 px-6 py-16 lg:flex-row lg:items-center lg:px-8">
        <div className="w-full max-w-xl space-y-8">
          <BrandMark className="h-6" />
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">{eyebrow}</p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">{heroTitle}</h1>
            <p className="text-base text-muted-foreground md:text-lg">{heroSubtitle}</p>
          </div>

          <dl className="grid gap-5 sm:grid-cols-2">
            {highlights.map(({ title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-app bg-card/60 p-4 shadow-ambient backdrop-blur"
              >
                <dt className="text-sm font-semibold">{title}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>

          <div className="pt-4 text-xs text-muted-foreground">
            <p className="font-medium uppercase tracking-[0.3em] text-muted-foreground/70">Trusted by creative teams</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-muted-foreground/80">
              {footerLogos.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-app bg-card/70 px-3 py-1 text-[11px] font-medium uppercase tracking-wide backdrop-blur"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg lg:max-w-md">{children}</div>
      </div>
    </div>
  );
}

function DecorativeBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -left-32 top-[-10%] h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,_var(--accent-ryuzen)/18,_transparent_70%)] blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,_var(--accent-business)/16,_transparent_60%)] blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-app-text/40 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-app-text/20 via-transparent" />
    </div>
  );
}

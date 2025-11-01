import { cn } from "@/shared/lib/cn";

export interface SignInProvider {
  key: string;
  label: string;
  helper: string;
  accent: string;
  onSelect: () => void;
}

export function SocialButton({ provider }: { provider: SignInProvider }) {
  return (
    <button
      type="button"
      onClick={provider.onSelect}
      className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-black/10 bg-background/40 p-4 text-left transition hover:border-black/20 hover:bg-background/60 backdrop-blur dark:border-white/10 dark:hover:border-white/20"
    >
      <span className="flex items-center gap-3">
        <span className={cn("grid size-10 place-items-center rounded-full font-semibold text-white", provider.accent)}>
          {provider.label[0]}
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-medium">{provider.label}</span>
          <span className="text-xs text-muted-foreground">{provider.helper}</span>
        </span>
      </span>
      <span className="text-sm text-muted-foreground transition group-hover:text-foreground">↗</span>
    </button>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="relative my-8 flex items-center justify-center">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
      <span className="absolute rounded-full bg-card px-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

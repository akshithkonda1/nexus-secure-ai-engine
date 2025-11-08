import { ReactNode } from "react";

type SettingsSectionProps = {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

export function SettingsSection({ title, description, action, children }: SettingsSectionProps) {
  return (
    <section className="rounded-3xl border border-[rgba(255,255,255,0.5)] bg-white/80 p-6 shadow-soft backdrop-blur transition dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-[rgb(var(--text))]">{title}</h3>
          <p className="mt-1 max-w-2xl text-sm text-[rgb(var(--text)/0.6)]">{description}</p>
        </div>
        {action && <div className="flex items-center gap-3">{action}</div>}
      </div>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

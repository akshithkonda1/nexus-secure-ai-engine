import { ReactNode } from "react";

type SettingsSectionProps = {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
};

export function SettingsSection({ title, description, action, children }: SettingsSectionProps) {
  return (
    <section className="rounded-[calc(var(--radius-xl)*1.4)] border border-white/30 bg-white/70 p-8 shadow-[0_40px_110px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-[#0d111a]/70">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-[rgb(var(--text))]">{title}</h3>
          <p className="mt-1 max-w-2xl text-sm text-[rgb(var(--text)/0.6)]">{description}</p>
        </div>
        {action && <div className="flex items-center gap-3">{action}</div>}
      </div>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

import { MessageCircle, ArrowUpFromLine, Sparkles, Settings } from "lucide-react";

function QuickAction({
  icon: Icon,
  title,
  desc,
  onClick
}: {
  icon: any;
  title: string;
  desc: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card w-full text-left p-5 flex items-start gap-4 hover:translate-y-[-2px]"
    >
      <div className="p-3 rounded-lg bg-[color:var(--nexus-accent)]/15">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-400">{desc}</div>
      </div>
    </button>
  );
}

export function Home() {
  return (
    <div className="pt-20 pl-64 pr-6 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <QuickAction icon={MessageCircle} title="New session" desc="Launch a fresh multi-model debate." />
        <QuickAction icon={ArrowUpFromLine} title="Import transcript" desc="Audit past debates instantly." />
        <QuickAction icon={Sparkles} title="Templates" desc="Start trust-first workflows in seconds." />
        <QuickAction icon={Settings} title="Settings" desc="Tune guardrails, quotas, providers." />
      </div>

      <div className="card p-6">
        <h2 className="section-title">Recent sessions</h2>
        <div className="space-y-3">
          <div className="panel p-4 flex justify-between items-start">
            <div>
              <div className="font-medium">Market Intelligence thread 6</div>
              <div className="text-sm text-gray-400">Spurs-inspired UI refinements for Nexus debates.</div>
            </div>
            <button className="text-[color:var(--nexus-accent)] hover:underline text-sm">Resume</button>
          </div>
          <div className="panel p-4 flex justify-between items-start">
            <div>
              <div className="font-medium">Partner Enablement thread 12</div>
              <div className="text-sm text-gray-400">Guardrail tuning & provider mix experiments.</div>
            </div>
            <button className="text-[color:var(--nexus-accent)] hover:underline text-sm">Resume</button>
          </div>
        </div>
      </div>
    </div>
  );
}

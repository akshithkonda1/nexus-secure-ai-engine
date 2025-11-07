import QuickAction from './QuickAction';
import SessionItem from './SessionItem';
import SettingsPanel from './SettingsPanel';
import { ChatBubbleLeftRightIcon, ArrowUpTrayIcon, SwatchIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Welcome to Nexus.ai</h2>
      <p className="text-muted mb-8">Orchestrate trusted AI Debate sessions, audit every decision, and keep tabs on telemetry in one place.</p>
      
      <h3 className="text-lg font-medium mb-4">Quick actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickAction icon={<ChatBubbleLeftRightIcon className="w-6 h-6 text-primary" />} title="New session" desc="Launch a fresh multi-model debate." />
        <QuickAction icon={<ArrowUpTrayIcon className="w-6 h-6 text-primary" />} title="Import transcript" desc="Upload past debates for instant auditing." />
        <QuickAction icon={<SwatchIcon className="w-6 h-6 text-primary" />} title="Kick off trust-first" desc="Workflows in seconds." />
        <QuickAction icon={<Cog6ToothIcon className="w-6 h-6 text-primary" />} title="Settings" desc="Tune guardrails, quotas, and providers." />
      </div>
      
      <h3 className="text-lg font-medium mb-4">Last 5 sessions</h3>
      <div className="space-y-3 mb-8">
        <SessionItem title="Market Intelligence thread 6" desc="Exploring Spurs-inspired UI refinements for Nexus debates." onResume={() => console.log('Resume')} />
        <SessionItem title="Partner Enablement thread 12" desc="Exploring Spurs-inspired UI refinements for Nexus debates." onResume={() => console.log('Resume')} />
      </div>
      
      <SettingsPanel />
    </div>
  );
}

export default Dashboard;

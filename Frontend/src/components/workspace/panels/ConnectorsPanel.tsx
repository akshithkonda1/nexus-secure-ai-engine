import React from 'react';

const connectors = [
  { name: 'Google OAuth', description: 'Sync Drive, Calendar, and Gmail data.' },
  { name: 'Microsoft OAuth', description: 'Connect Outlook, Teams, and OneDrive.' },
  { name: 'Apple Sign In', description: 'Bring iCloud calendars and notes.' },
  { name: 'Meta', description: 'Bridge Workplace and Messenger signals.' },
  { name: 'Notion OAuth', description: 'Sync databases, pages, and comments.' },
  { name: 'Canvas', description: 'Enter tokens or manual keys for Canvas.' },
];

const ConnectorsPanel: React.FC = () => {
  return (
    <div className="space-y-6 text-textPrimary">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Connectors</h3>
          <p className="text-textPrimary/70">Authenticate and link external tools.</p>
        </div>
        <button className="px-4 py-2 rounded-2xl bg-bgPrimary/10 border border-borderLight/20 hover:bg-bgPrimary/15">Manage Tokens</button>
      </div>

      <div className="space-y-3">
        {connectors.map((connector) => (
          <div
            key={connector.name}
            className="flex items-center justify-between rounded-2xl border border-borderLight/10 bg-bgPrimary/5 p-4 backdrop-blur-xl hover:bg-bgPrimary/10"
          >
            <div>
              <div className="font-semibold">{connector.name}</div>
              <div className="text-textPrimary/60 text-sm">{connector.description}</div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-bgPrimary/10 border border-borderLight/20 text-sm hover:bg-bgPrimary/15">Connect</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectorsPanel;

import React from 'react';
import WorkspaceSettingsContent from '../../settings/WorkspaceSettingsContent';

const SettingsTab: React.FC = () => (
  <div style={{ maxHeight:'60vh', overflowY:'auto', paddingRight:'0.25rem' }}>
    <WorkspaceSettingsContent compact />
  </div>
);

export default SettingsTab;

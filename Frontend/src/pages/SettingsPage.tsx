import React from 'react';
import Card from '../components/primitives/Card';
import { ThemeStyles } from '../components/ThemeStyles';
import WorkspaceSettingsContent from '../components/settings/WorkspaceSettingsContent';
const SettingsPage: React.FC<{ onBack: ()=>void }>=({onBack})=>{
  return (
    <div className="chatgpt-app">
      <ThemeStyles/>
      <div className="chatgpt-settings-shell">
        <Card>
          <WorkspaceSettingsContent showBackButton onBack={onBack} />
        </Card>
      </div>
    </div>
  );
};
export default SettingsPage;

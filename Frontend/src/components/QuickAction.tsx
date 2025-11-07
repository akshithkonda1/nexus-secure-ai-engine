import { ReactNode } from 'react';

interface QuickActionProps {
  icon: ReactNode;
  title: string;
  desc: string;
}

function QuickAction({ icon, title, desc }: QuickActionProps) {
  return (
    <div className="bg-elevated rounded-xl p-6 flex items-center space-x-4 hover:bg-gray-700 transition">
      <div className="bg-primary/10 p-3 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted">{desc}</p>
      </div>
    </div>
  );
}

export default QuickAction;

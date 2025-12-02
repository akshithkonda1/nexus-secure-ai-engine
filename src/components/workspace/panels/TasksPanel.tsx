import React from "react";

const TasksPanel: React.FC = () => {
  const tasks = [
    { title: "Draft workspace spec", status: "In Progress" },
    { title: "Wireframe OS bar", status: "Done" },
    { title: "Hook connectors", status: "Blocked" },
    { title: "QA animations", status: "Todo" },
  ];

  return (
    <div className="space-y-4 text-white">
      <div className="text-2xl font-semibold tracking-tight">Tasks</div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.title}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-lg"
          >
            <div className="font-medium">{task.title}</div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-white/70">
              {task.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPanel;

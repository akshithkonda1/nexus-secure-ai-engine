import React from 'react';

const tasks = [
  { title: 'Draft vision brief', status: 'Todo', list: 'Product Roadmap' },
  { title: 'Design canvas glass theme', status: 'In Progress', list: 'Creative Sprint' },
  { title: 'Sync connector keys', status: 'Done', list: 'Research Backlog' },
];

const statusColors: Record<string, string> = {
  Todo: 'bg-bgPrimary/10 border-borderLight/20 text-textPrimary',
  'In Progress': 'bg-amber-500/30 border-amber-300/30 text-amber-50',
  Done: 'bg-emerald-500/30 border-emerald-300/30 text-emerald-50',
};

const TasksPanel: React.FC = () => {
  return (
    <div className="space-y-6 text-textPrimary">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Tasks</h3>
          <p className="text-textPrimary/70">Track task status and linked lists.</p>
        </div>
        <button className="px-4 py-2 rounded-2xl bg-bgPrimary/10 border border-borderLight/20 hover:bg-bgPrimary/15">Add Task</button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.title}
            className="rounded-2xl border border-borderLight/10 bg-bgPrimary/5 backdrop-blur-xl p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-semibold">{task.title}</div>
              <div className="text-textPrimary/60 text-sm">Linked to {task.list}</div>
            </div>
            <span className={`px-3 py-1 rounded-xl border text-sm font-semibold ${statusColors[task.status]}`}>
              {task.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPanel;

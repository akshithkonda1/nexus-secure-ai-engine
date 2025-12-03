import React from 'react';

interface ListsPanelProps {
  onSelectTasks?: () => void;
}

const sampleLists = [
  { name: 'Product Roadmap', items: 18 },
  { name: 'Creative Sprint', items: 9 },
  { name: 'Research Backlog', items: 12 },
];

const ListsPanel: React.FC<ListsPanelProps> = ({ onSelectTasks }) => {
  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Lists</h3>
          <p className="text-white/70">Curate collections that power your tasks and workflows.</p>
        </div>
        <button className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15">＋ New List</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sampleLists.map((list) => (
          <div key={list.name} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl hover:bg-white/10">
            <div className="font-semibold">{list.name}</div>
            <div className="text-white/60 text-sm">{list.items} items</div>
            <button
              onClick={onSelectTasks}
              className="mt-3 text-sm text-white/80 underline underline-offset-4 hover:text-white"
            >
              Open linked tasks
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListsPanel;

import React from "react";

const BoardsPanel: React.FC = () => {
  const columns = [
    { title: "Incoming", items: ["Signal review", "User feedback"] },
    { title: "Active", items: ["Prototype", "Model eval"] },
    { title: "Done", items: ["Spec outline"] },
  ];

  return (
    <div className="space-y-4 text-white">
      <div className="text-2xl font-semibold tracking-tight">Boards</div>
      <div className="flex gap-3 overflow-x-auto">
        {columns.map((column) => (
          <div
            key={column.title}
            className="min-w-[180px] rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg"
          >
            <div className="text-sm uppercase tracking-[0.16em] text-white/60">{column.title}</div>
            <div className="mt-3 space-y-2">
              {column.items.map((item) => (
                <div key={item} className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardsPanel;

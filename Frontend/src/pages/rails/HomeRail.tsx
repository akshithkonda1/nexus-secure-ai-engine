import { Plus, MoreHorizontal } from "lucide-react";

const projects = [
  {
    title: "Learning From 100 Years o...",
    description: "For athletes, high altitude emot...",
    color: "from-orange-400 to-orange-500"
  },
  {
    title: "Research efficiente",
    description: "Maxwell's equations—the four four...",
    color: "from-blue-400 to-blue-500"
  },
  {
    title: "What does a senior lead de...",
    description: "Physiological respiration invols...",
    color: "from-purple-400 to-purple-500"
  },
  {
    title: "Write a sweet note to your...",
    description: "In the eighteenth century the G...",
    color: "from-green-400 to-green-500"
  },
  {
    title: "Meet with cake bakers",
    description: "Physical space is often conceiv...",
    color: "from-pink-400 to-pink-500"
  },
  {
    title: "Meet with cake bakers",
    description: "Physical space is often conceiv...",
    color: "from-indigo-400 to-indigo-500"
  },
];

export default function HomeRail() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--text-strong)]">Projects</span>
          <span className="text-xs text-[var(--text-muted)]">(7)</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-lg p-1 transition hover:bg-[var(--layer-muted)]">
            <MoreHorizontal className="h-4 w-4 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      <button className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--layer-muted)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:bg-[var(--layer-active)] hover:text-[var(--text-strong)]">
        <Plus className="h-4 w-4" />
        <span>New Project</span>
      </button>

      <div className="flex flex-col gap-3">
        {projects.map((project, index) => (
          <div
            key={index}
            className="group cursor-pointer rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] p-4 transition hover:border-[var(--line-strong)] hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-strong)]">{project.title}</h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">{project.description}</p>
            <div className={`mt-3 h-1 w-full rounded-full bg-gradient-to-r ${project.color} opacity-60`}></div>
          </div>
        ))}
      </div>
    </div>
  );
}

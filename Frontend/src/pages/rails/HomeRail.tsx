import { Plus, MoreHorizontal, Clock } from "lucide-react";

const projects = [
  {
    title: "AI Model Training Pipeline",
    description: "Building scalable infrastructure for model training...",
    color: "bg-blue-500",
    progress: 75,
    updated: "2 hours ago",
  },
  {
    title: "Research Database",
    description: "Comprehensive research papers and documentation...",
    color: "bg-purple-500",
    progress: 60,
    updated: "5 hours ago",
  },
  {
    title: "UI/UX Design System",
    description: "Modern component library with accessibility...",
    color: "bg-emerald-500",
    progress: 90,
    updated: "1 day ago",
  },
  {
    title: "Customer Analytics",
    description: "User behavior tracking and insights dashboard...",
    color: "bg-amber-500",
    progress: 45,
    updated: "3 days ago",
  },
  {
    title: "Mobile App Development",
    description: "Cross-platform mobile application with React Native...",
    color: "bg-pink-500",
    progress: 30,
    updated: "1 week ago",
  },
  {
    title: "API Documentation",
    description: "Comprehensive REST API documentation and examples...",
    color: "bg-indigo-500",
    progress: 85,
    updated: "2 days ago",
  },
];

export default function HomeRail() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Projects</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {projects.length}
          </span>
        </div>
        <button className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <button className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm font-medium text-gray-900 transition-all hover:border-gray-400 hover:bg-gray-100">
        <Plus className="h-4 w-4" />
        <span>New Project</span>
      </button>

      <div className="flex flex-col gap-3">
        {projects.map((project, index) => (
          <div
            key={index}
            className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{project.title}</h3>
              <span className="shrink-0 text-[10px] font-medium text-gray-500">{project.progress}%</span>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-gray-600 line-clamp-2">{project.description}</p>

            {/* Progress bar */}
            <div className="mb-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-1.5 rounded-full ${project.color} transition-all`}
                style={{ width: `${project.progress}%` }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Updated {project.updated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

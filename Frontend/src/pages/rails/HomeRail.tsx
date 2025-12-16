import { Plus, MoreHorizontal, Clock } from "lucide-react";
import { motion } from "framer-motion";

const projects = [
  {
    title: "AI Model Training Pipeline",
    description: "Building scalable infrastructure for model training...",
    color: "from-orange-400 to-orange-500",
    progress: 75,
    updated: "2 hours ago",
  },
  {
    title: "Research Database",
    description: "Comprehensive research papers and documentation...",
    color: "from-blue-400 to-blue-500",
    progress: 60,
    updated: "5 hours ago",
  },
  {
    title: "UI/UX Design System",
    description: "Modern component library with accessibility...",
    color: "from-purple-400 to-purple-500",
    progress: 90,
    updated: "1 day ago",
  },
  {
    title: "Customer Analytics",
    description: "User behavior tracking and insights dashboard...",
    color: "from-green-400 to-green-500",
    progress: 45,
    updated: "3 days ago",
  },
  {
    title: "Mobile App Development",
    description: "Cross-platform mobile application with React Native...",
    color: "from-pink-400 to-pink-500",
    progress: 30,
    updated: "1 week ago",
  },
  {
    title: "API Documentation",
    description: "Comprehensive REST API documentation and examples...",
    color: "from-indigo-400 to-indigo-500",
    progress: 85,
    updated: "2 days ago",
  },
];

export default function HomeRail() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className="flex flex-col gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--text-strong)]">Projects</span>
          <span className="rounded-full bg-gradient-to-r from-[var(--ryuzen-dodger)]/20 to-[var(--ryuzen-purple)]/20 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
            {projects.length}
          </span>
        </div>
        <motion.button
          className="rounded-lg p-1 transition hover:bg-[var(--layer-muted)]"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <MoreHorizontal className="h-4 w-4 text-[var(--text-muted)]" />
        </motion.button>
      </motion.div>

      <motion.button
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--line-strong)] bg-[var(--layer-muted)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[var(--accent)] hover:bg-gradient-to-r hover:from-[var(--ryuzen-dodger)]/10 hover:to-[var(--ryuzen-purple)]/10 hover:text-[var(--text-strong)]"
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus className="h-4 w-4" />
        <span>New Project</span>
      </motion.button>

      <div className="flex flex-col gap-3">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            className="group cursor-pointer rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] p-3.5 transition-all hover:border-[var(--accent)] hover:shadow-md"
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-[var(--text-strong)] line-clamp-1">{project.title}</h3>
              <span className="shrink-0 text-[10px] text-[var(--text-muted)]">{project.progress}%</span>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-[var(--text-muted)] line-clamp-2">{project.description}</p>

            {/* Progress bar */}
            <div className="mb-2 overflow-hidden rounded-full bg-[var(--layer-surface)]">
              <motion.div
                className={`h-1.5 rounded-full bg-gradient-to-r ${project.color} shadow-sm`}
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
              <Clock className="h-3 w-3" />
              <span>Updated {project.updated}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

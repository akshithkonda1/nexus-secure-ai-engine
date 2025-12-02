export const eventTypeColors = {
  critical: "#ef4444",
  task: "#22c55e",
  social: "#eab308",
  group: "#3b82f6",
};

export const taskPriorityColors = {
  high: "#ef4444",
  medium: "#f97316",
  low: "#22c55e",
  none: "#94a3b8",
};

export function getEventColor(type) {
  return eventTypeColors[type] || eventTypeColors.group;
}

export function getPriorityColor(priority) {
  return taskPriorityColors[priority] || taskPriorityColors.none;
}

export default { eventTypeColors, taskPriorityColors, getEventColor, getPriorityColor };

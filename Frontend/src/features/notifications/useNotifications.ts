import { useMemo } from "react";

export type NotificationTone = "info" | "success" | "warning" | "critical";

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: NotificationTone;
  cta?: string;
};

const STATIC_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "security-audit",
    title: "Security policy updated",
    description: "Your SOC 2 controls were refreshed. Review the diff before rollout.",
    time: "2m ago",
    tone: "critical",
    cta: "View policy",
  },
  {
    id: "workflow-approved",
    title: "Workflow \"Roadmap brief\" shipped",
    description: "Avery Quinn enabled the new summarization workflow for the GTM workspace.",
    time: "35m ago",
    tone: "success",
    cta: "Open workflow",
  },
  {
    id: "new-signal",
    title: "New research signal",
    description: "Voice mode beta hit a 18% improvement in grounding time.",
    time: "1h ago",
    tone: "info",
    cta: "View insight",
  },
  {
    id: "usage-threshold",
    title: "Usage threshold",
    description: "Weekly document sync is at 82% of the limit. Increase allocation to avoid throttling.",
    time: "Today, 08:14",
    tone: "warning",
    cta: "Manage plan",
  },
];

export function useNotifications() {
  return useMemo(() => STATIC_NOTIFICATIONS, []);
}

export function useUnreadNotificationsCount() {
  const notifications = useNotifications();
  return notifications.length;
}


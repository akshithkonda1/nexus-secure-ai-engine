import { useMemo, useSyncExternalStore } from "react";

export type NotificationTone = "info" | "success" | "warning" | "critical";

export type NotificationKind = "system" | "workspace" | "other";

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: NotificationTone;
  cta?: string;
  /**
   * Optional structured metadata for globally sourced notifications.
   * These fields enable workspace surfaces (like Outbox) to tag alerts
   * without impacting existing presentation code.
   */
  kind?: NotificationKind;
  source?: string;
  read?: boolean;
  createdAt?: string;
  body?: string;
};

type NotificationsState = {
  items: NotificationItem[];
};

type Listener = () => void;

type GlobalNotificationsAPI = {
  add: (notification: NotificationItem) => void;
  replaceBySource: (source: string, notifications: NotificationItem[]) => void;
};

const listeners = new Set<Listener>();

const ensureReadFlag = (notification: NotificationItem): NotificationItem => ({
  ...notification,
  read: notification.read ?? false,
});

const formatTodayAt = (hour: number, minute: number) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const initialState: NotificationsState = {
  items: [
    {
      id: "security-audit",
      title: "Security policy updated",
      description: "Your SOC 2 controls were refreshed. Review the diff before rollout.",
      body: "Your SOC 2 controls were refreshed. Review the diff before rollout.",
      time: "2m ago",
      tone: "critical",
      cta: "View policy",
      kind: "system",
      source: "system",
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
      id: "workflow-approved",
      title: "Workflow \"Roadmap brief\" shipped",
      description: "Avery Quinn enabled the new summarization workflow for the GTM workspace.",
      body: "Avery Quinn enabled the new summarization workflow for the GTM workspace.",
      time: "35m ago",
      tone: "success",
      cta: "Open workflow",
      kind: "system",
      source: "system",
      read: false,
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
    {
      id: "new-signal",
      title: "New research signal",
      description: "Voice mode beta hit a 18% improvement in grounding time.",
      body: "Voice mode beta hit a 18% improvement in grounding time.",
      time: "1h ago",
      tone: "info",
      cta: "View insight",
      kind: "system",
      source: "system",
      read: false,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: "usage-threshold",
      title: "Usage threshold",
      description: "Weekly document sync is at 82% of the limit. Increase allocation to avoid throttling.",
      body: "Weekly document sync is at 82% of the limit. Increase allocation to avoid throttling.",
      time: "Today, 08:14",
      tone: "warning",
      cta: "Manage plan",
      kind: "system",
      source: "system",
      read: false,
      createdAt: formatTodayAt(8, 14),
    },
  ],
};

let state: NotificationsState = initialState;

const emit = () => {
  listeners.forEach((listener) => listener());
};

const setState = (updater: (prev: NotificationsState) => NotificationsState) => {
  state = updater(state);
  emit();
};

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state.items;

const addNotification = (notification: NotificationItem) => {
  setState((prev) => ({ items: [...prev.items, ensureReadFlag(notification)] }));
};

const replaceNotificationsBySource = (source: string, notifications: NotificationItem[]) => {
  setState((prev) => ({
    items: [
      ...prev.items.filter((item) => item.source !== source),
      ...notifications.map(ensureReadFlag),
    ],
  }));
};

export function useNotifications() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useGlobalNotifications(): GlobalNotificationsAPI {
  return useMemo(
    () => ({
      add: addNotification,
      replaceBySource: replaceNotificationsBySource,
    }),
    []
  );
}

export function useUnreadNotificationsCount() {
  const notifications = useNotifications();
  return notifications.filter((notification) => !notification.read).length;
}


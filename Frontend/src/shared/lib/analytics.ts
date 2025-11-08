export type AnalyticsPayload = Record<string, unknown>;

declare global {
  interface Window {
    analyticsQueue?: { event: string; props?: AnalyticsPayload }[];
  }
}

export function track(event: string, props?: AnalyticsPayload) {
  if (typeof window === "undefined") return;
  if (navigator.doNotTrack === "1") return;
  if (!import.meta.env.VITE_ANALYTICS) return;

  if (!window.analyticsQueue) {
    window.analyticsQueue = [];
  }

  window.analyticsQueue.push({ event, props });
}

export type AnalyticsProps = Record<string, unknown> | undefined;

export function track(event: string, props?: AnalyticsProps): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!import.meta.env.VITE_ANALYTICS || window.navigator.doNotTrack === "1") {
    return;
  }

  // Stubbed analytics pipeline — replace with real provider when wiring production analytics.
  console.log("[track]", event, props);
}

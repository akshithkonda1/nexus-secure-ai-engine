export function initSentry(): void {
  if (typeof window === "undefined") {
    return;
  }
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log("[sentry:init]", { dsn });
}

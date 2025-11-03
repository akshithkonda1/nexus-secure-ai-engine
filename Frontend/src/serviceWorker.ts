export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .catch((error) => {
          if (import.meta.env.DEV) {
            console.warn("Service worker registration failed", error);
          }
        });
    });
  }
}

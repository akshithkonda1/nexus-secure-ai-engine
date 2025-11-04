import { Toaster as SonnerToaster } from "sonner";

export const Toaster = () => (
  <SonnerToaster
    position="top-right"
    toastOptions={{
      style: {
        borderRadius: "16px",
        background: "rgb(var(--panel-bg))",
        color: "rgb(var(--ink))",
        boxShadow: "var(--shadow-ambient)"
      }
    }}
  />
);

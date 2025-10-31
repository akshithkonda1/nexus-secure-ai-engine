import { Toaster as SonnerToaster } from "sonner";

export const Toaster = () => (
  <SonnerToaster
    position="top-right"
    toastOptions={{
      style: {
        borderRadius: "16px",
        background: "var(--surface)",
        color: "var(--text)",
        boxShadow: "var(--shadow-ambient)"
      }
    }}
  />
);

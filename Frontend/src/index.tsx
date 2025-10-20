import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

function mount() {
  const el = document.querySelector("#root");
  if (!el) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
      return;
    }
    console.error("Nexus: #root not found. Add <div id='root'></div> to index.html");
    return;
  }

  ReactDOM.createRoot(el as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount, { once: true });
} else {
  mount();
}

if ((import.meta as any)?.env?.DEV) {
  try {
    console.assert(!!document.querySelector("#root"), "#root must exist");
  } catch {
    // ignore
  }
}

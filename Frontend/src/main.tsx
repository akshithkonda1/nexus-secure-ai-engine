import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import "./styles/globals.css";
import { ThemeProvider } from "./theme/useTheme";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found");

createRoot(container).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

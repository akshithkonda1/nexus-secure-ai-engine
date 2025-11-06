import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import { ThemeProvider } from "./theme/useTheme";
import "./styles/globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

createRoot(root).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

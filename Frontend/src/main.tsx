import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { App } from "./App";
import { RyuzenErrorBoundary } from "./components/errors/RyuzenErrorBoundary";
import { ThemeProvider } from "./theme/ThemeProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <RyuzenErrorBoundary>
          <App />
        </RyuzenErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);

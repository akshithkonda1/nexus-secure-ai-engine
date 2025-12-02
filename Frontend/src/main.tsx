import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { App } from "./App";
import { RyuzenErrorBoundary } from "./components/errors/RyuzenErrorBoundary";
import { Providers } from "./app/providers";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <BrowserRouter>
        <RyuzenErrorBoundary>
          <App />
        </RyuzenErrorBoundary>
      </BrowserRouter>
    </Providers>
  </React.StrictMode>,
);

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "./styles/globals.css";
import "./styles/theme-nexus.css";

// Persisted theme restore
const saved = localStorage.getItem("theme");
if (saved) document.documentElement.classList.toggle("dark", saved === "dark");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

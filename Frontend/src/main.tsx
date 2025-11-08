import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./App";

const el = document.getElementById("root");
if (!el) throw new Error("Root #root not found in index.html");

createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

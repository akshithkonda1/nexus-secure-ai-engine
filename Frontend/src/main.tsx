import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Router from "./router";
import { ConfigProvider } from "./context/ConfigContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider>
      <Router />
    </ConfigProvider>
  </React.StrictMode>
);

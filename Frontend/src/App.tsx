import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppShell from "./layouts/AppShell";
import { ThemeProvider } from "./state/theme";
import "./styles/globals.css";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

import { BrowserRouter } from "react-router-dom";
import AppRoutes from "../router";
import CosmicCanvas from "./CosmicCanvas";
import Header from "./Header";
import { ThemeProvider } from "../theme/ThemeProvider";

function AppShell() {
  return (
    <ThemeProvider>
      <div className="app-shell">
        <CosmicCanvas />
        <BrowserRouter>
          <div className="content-shell">
            <Header />
            <main>
              <AppRoutes />
            </main>
          </div>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default AppShell;

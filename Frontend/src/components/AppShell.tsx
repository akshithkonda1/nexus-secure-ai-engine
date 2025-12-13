import ShellWithRouter from "../router";
import { ThemeProvider } from "../theme/ThemeProvider";

function AppShell() {
  return (
    <div className="app-shell">
      <ThemeProvider>
        <ShellWithRouter />
      </ThemeProvider>
    </div>
  );
}

export default AppShell;

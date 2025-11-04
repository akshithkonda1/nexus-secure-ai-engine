import App from "@/App";
import { ThemeProvider } from "@/shared/ui/theme/ThemeProvider";
import { registerServiceWorker } from "@/serviceWorker";
import "@/index.css";



ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);

registerServiceWorker();

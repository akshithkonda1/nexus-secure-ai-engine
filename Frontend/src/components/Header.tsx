import { useEffect, useState } from "react";
import { Moon, Settings2, Sun } from "lucide-react";

const THEME_KEY = "theme";

type HeaderProps = {
  onOpenSettings: () => void;
};

function getInitialTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") {
    return stored;
  }
  const datasetTheme = document.documentElement.dataset.theme;
  if (datasetTheme === "dark" || datasetTheme === "light") {
    return datasetTheme;
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function Header({ onOpenSettings }: HeaderProps) {
  const [theme, setTheme] = useState<"dark" | "light">(() => getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <div className="chat-header" role="banner">
      <div className="chat-header__brand" aria-label="Nexus">
        Nexus
      </div>
      <div className="chat-header__actions">
        <button
          type="button"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="chat-header__icon"
          onClick={() => setTheme(prev => (prev === "dark" ? "light" : "dark"))}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button type="button" className="chat-header__settings" onClick={onOpenSettings}>
          <Settings2 size={16} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}

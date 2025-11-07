import {
  useEffect,
  useState,
  useContext,
  createContext,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

type ThemeContextValue = {
  theme: string;
  setTheme: Dispatch<SetStateAction<string>>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(
    localStorage.getItem("nexus-theme") || "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("nexus-theme", theme);

    // Enforce dark background on load
    root.style.backgroundColor =
      theme === "dark" ? "#0f1116" : "#f9fafb";

    // Prevent Windows forced colors
    if (window.matchMedia("(forced-colors: active)").matches) {
      root.style.setProperty("forced-color-adjust", "none");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

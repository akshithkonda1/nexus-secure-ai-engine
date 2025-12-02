import { createContext, useContext, useEffect, useMemo, useState } from "react";

const getSystemTheme = () => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const RyuzenThemeContext = createContext({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
});

export function RyuzenThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("ryuzen-theme") || "dark";
  });
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    theme === "system" ? getSystemTheme() : theme,
  );

  useEffect(() => {
    const root = document.documentElement;
    const targetTheme = theme === "system" ? getSystemTheme() : theme;

    setResolvedTheme(targetTheme);
    localStorage.setItem("ryuzen-theme", theme);

    root.dataset.theme = targetTheme;
    if (targetTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (event) => {
      if (theme === "system") {
        const next = event.matches ? "dark" : "light";
        setResolvedTheme(next);
        root.dataset.theme = next;
        root.classList.add(next);
        root.classList.remove(next === "dark" ? "light" : "dark");
      }
    };

    media.addEventListener("change", handleMediaChange);

    // Fix Vite stale render bug
    requestAnimationFrame(() => {
      root.style.display = "none";
      requestAnimationFrame(() => {
        root.style.display = "";
      });
    });

    return () => {
      media.removeEventListener("change", handleMediaChange);
    };
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, resolvedTheme],
  );

  return (
    <RyuzenThemeContext.Provider value={value}>
      {children}
    </RyuzenThemeContext.Provider>
  );
}

export const useRyuzenTheme = () => useContext(RyuzenThemeContext);

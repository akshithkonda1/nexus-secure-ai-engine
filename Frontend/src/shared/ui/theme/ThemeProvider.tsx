import * as React from "react";
import { applyTheme, resolveApplied, type ThemeChoice, type AppliedTheme } from "./domTheme";

type Ctx = {
  theme: ThemeChoice;
  applied: AppliedTheme;
  setTheme: (t: ThemeChoice) => void;
};

const ThemeContext = React.createContext<Ctx>({
  theme: "system",
  applied: "light",
  setTheme: () => {},
});

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [theme, setTheme] = React.useState<ThemeChoice>(
    () => (localStorage.getItem("theme") as ThemeChoice) || "system"
  );
  const [applied, setApplied] = React.useState<AppliedTheme>(() => resolveApplied(theme));

  // Apply to <html> immediately on mount & whenever theme changes
  React.useLayoutEffect(() => {
    setApplied(applyTheme(theme));
  }, [theme]);

  // If on "system", react to OS changes
  React.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setApplied(applyTheme("system"));
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [theme]);

  const value = React.useMemo(() => ({ theme, applied, setTheme }), [theme, applied]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => React.useContext(ThemeContext);

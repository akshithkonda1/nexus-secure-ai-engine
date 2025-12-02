import { ThemeProvider } from "@/theme/ThemeProvider";

export function Providers({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

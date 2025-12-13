import { Theme } from "../theme/ThemeProvider";

type Props = {
  theme: Theme;
  onToggle: () => void;
};

function ThemeToggle({ theme, onToggle }: Props) {
  return (
    <button
      type="button"
      className={`theme-toggle ${theme === "dark" ? "dark" : ""}`}
      onClick={onToggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      <span className="theme-aurora" aria-hidden="true" />
      <span className="thumb">{theme === "dark" ? "🌙" : "☀️"}</span>
    </button>
  );
}

export default ThemeToggle;

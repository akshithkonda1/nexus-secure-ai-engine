import React from 'react';
import { Moon, Sun } from 'lucide-react';

type ThemeToggleProps = {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
};

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle, className }) => {
  const title = `Switch to ${isDark ? 'light' : 'dark'} mode`;
  const buttonClass = ['chatgpt-header-button', className].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      title={title}
      onClick={onToggle}
      className={buttonClass}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;

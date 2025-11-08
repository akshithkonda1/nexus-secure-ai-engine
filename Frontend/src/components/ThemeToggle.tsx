import { useTheme } from '@/theme/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center justify-between gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200"
      style={{ borderColor: 'rgba(255,255,255,0.15)', background: isDark ? 'rgba(37,99,235,0.08)' : 'white' }}
    >
      <div className="flex items-center gap-2">
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      </div>
      <div
        className={`relative flex h-5 w-10 rounded-full transition-colors duration-300 ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-4 w-4 bg-white rounded-full transition-transform duration-300 ${
            isDark ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </button>
  );
}

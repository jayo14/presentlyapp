import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 bg-surface-container rounded-full border border-outline/20">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-full transition-all ${
          theme === 'light' 
            ? 'bg-sungold text-presently-black shadow-sm'
            : 'text-on-surface-variant hover:bg-surface-highest'
        }`}
        title="Light Mode"
        aria-label="Switch to light theme"
      >
        <Sun size={14} strokeWidth={theme === 'light' ? 2.5 : 2} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-full transition-all ${
          theme === 'dark' 
            ? 'bg-sungold text-presently-black shadow-sm'
            : 'text-on-surface-variant hover:bg-surface-highest'
        }`}
        title="Dark Mode"
        aria-label="Switch to dark theme"
      >
        <Moon size={14} strokeWidth={theme === 'dark' ? 2.5 : 2} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-full transition-all ${
          theme === 'system' 
            ? 'bg-sungold text-presently-black shadow-sm'
            : 'text-on-surface-variant hover:bg-surface-highest'
        }`}
        title="System Theme"
        aria-label="Switch to system theme"
      >
        <Monitor size={14} strokeWidth={theme === 'system' ? 2.5 : 2} />
      </button>
    </div>
  );
};

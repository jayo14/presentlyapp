import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 bg-surface-container rounded-full border border-outline/20">
      <button
        onClick={() => setTheme('light')}
        className={`p-1 rounded-full transition-all ${
          theme === 'light' 
            ? 'bg-primary text-on-primary-fixed shadow-sm' 
            : 'text-textMuted hover:bg-surface-variant'
        }`}
        title="Light Mode"
      >
        <Sun size={14} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1 rounded-full transition-all ${
          theme === 'dark' 
            ? 'bg-primary text-on-primary-fixed shadow-sm' 
            : 'text-textMuted hover:bg-surface-variant'
        }`}
        title="Dark Mode"
      >
        <Moon size={14} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`rounded-full transition-all ${
          theme === 'system' 
            ? 'bg-primary text-on-primary-fixed shadow-sm' 
            : 'text-textMuted hover:bg-surface-variant'
        }`}
        title="System Theme"
      >
        <Monitor size={14} />
      </button>
    </div>
  );
};

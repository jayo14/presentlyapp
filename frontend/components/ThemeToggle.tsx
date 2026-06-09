import React from 'react';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { useTheme } from './ThemeProvider';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 bg-neutral-50 rounded-full border border-black/5">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-full transition-all ${
          theme === 'light' 
            ? 'bg-sungold text-neutral-900 shadow-sm'
            : 'text-neutral-400 hover:bg-neutral-100'
        }`}
        title="Light mode"
      >
        <IconSun size={18} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-full transition-all ${
          theme === 'dark' 
            ? 'bg-sungold text-neutral-900 shadow-sm'
            : 'text-neutral-400 hover:bg-neutral-100'
        }`}
        title="Dark mode"
      >
        <IconMoon size={18} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-full transition-all ${
          theme === 'system' 
            ? 'bg-sungold text-neutral-900 shadow-sm'
            : 'text-neutral-400 hover:bg-neutral-100'
        }`}
        title="System theme"
      >
        <IconDeviceDesktop size={18} />
      </button>
    </div>
  );
};

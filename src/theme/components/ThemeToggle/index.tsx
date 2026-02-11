import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../../core/state/store';

export function ThemeToggle() {
  const { preference, setColorMode } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--simpli-bg-secondary)] border border-[var(--simpli-border)]">
      <button
        onClick={() => setColorMode('light')}
        className={`
          p-2 rounded-md transition-all
          ${preference === 'light' 
            ? 'bg-[var(--simpli-bg)] text-[var(--simpli-primary-600)] shadow-sm' 
            : 'text-[var(--simpli-text-tertiary)] hover:text-[var(--simpli-text)]'}
        `}
        aria-label="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => setColorMode('dark')}
        className={`
          p-2 rounded-md transition-all
          ${preference === 'dark' 
            ? 'bg-[var(--simpli-bg)] text-[var(--simpli-primary-600)] shadow-sm' 
            : 'text-[var(--simpli-text-tertiary)] hover:text-[var(--simpli-text)]'}
        `}
        aria-label="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => setColorMode('system')}
        className={`
          p-2 rounded-md transition-all
          ${preference === 'system' 
            ? 'bg-[var(--simpli-bg)] text-[var(--simpli-primary-600)] shadow-sm' 
            : 'text-[var(--simpli-text-tertiary)] hover:text-[var(--simpli-text)]'}
        `}
        aria-label="System preference"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}

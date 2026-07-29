import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export function ThemeToggle({ isDarkMode, setIsDarkMode }: ThemeToggleProps) {
  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 transition-colors duration-200 focus:outline-none"
      aria-label="Toggle theme"
    >
      <span
        className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white dark:bg-zinc-850 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
          isDarkMode ? "translate-x-5.5" : "translate-x-0"
        } flex items-center justify-center`}
      >
        {isDarkMode ? (
          <Moon className="h-3 w-3 text-violet-400 fill-violet-400/20" />
        ) : (
          <Sun className="h-3 w-3 text-amber-500 fill-amber-500/10" />
        )}
      </span>
    </button>
  );
}

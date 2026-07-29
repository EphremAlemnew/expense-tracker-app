import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export function ThemeToggle({ isDarkMode, setIsDarkMode }: ThemeToggleProps) {
  return (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="relative inline-flex h-6 w-11 items-center shrink-0 cursor-pointer rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 transition-colors duration-200 focus:outline-none"
      aria-label="Toggle theme"
    >
      <span
        className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 transform transition duration-200 ease-in-out ${
          isDarkMode ? "translate-x-5" : "translate-x-0.5"
        }`}
      >
        {isDarkMode ? (
          <Moon className="h-3 w-3 text-violet-400 fill-violet-400/20" />
        ) : (
          <Sun className="h-3 w-3 text-amber-500 fill-amber-500/15" />
        )}
      </span>
    </button>
  );
}

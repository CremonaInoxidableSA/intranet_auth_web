"use client";

import { useThemeToggle } from "./themeToggleLogic";
import { Moon, SunMedium } from "lucide-react";

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useThemeToggle();

  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="group relative flex items-center justify-center w-6 h-6 ease-in-out cursor-pointer"
    >
      {isLight ? (
        <div className="group relative flex items-center justify-center w-6 h-6 ease-in-out">
          <div className="absolute inset-0 rounded-sm bg-gray-400/0 group-hover:bg-gray-400/20 ease-in-out group-hover:scale-150 pointer-events-none" />
          <Moon className="w-6 h-6 transition-transform ease-in-out group-hover:scale-110" />
        </div>
      ) : (
        <div className="group relative flex items-center justify-center w-6 h-6 ease-in-out">
          <div className="absolute inset-0 rounded-sm bg-gray-400/0 group-hover:bg-gray-400/20 ease-in-out group-hover:scale-150 pointer-events-none" />
          <SunMedium className="w-6 h-6 transition-transform ease-in-out group-hover:scale-110" />
        </div>
      )}
    </button>
  );
};

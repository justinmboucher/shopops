// src/theme/useTheme.js
import { useEffect, useState } from "react";

const THEME_KEY = "shopops_theme";

function getInitialTheme() {
  // 1) localStorage
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // ignore storage errors
  }

  // 2) system preference
  if (typeof window !== "undefined" && window.matchMedia) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")
      .matches;
    return prefersDark ? "dark" : "light";
  }

  // 3) fallback
  return "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  // apply to <html> + persist whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
  };
}

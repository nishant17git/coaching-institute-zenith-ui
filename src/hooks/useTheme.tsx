
import { useState, useEffect } from "react";
import { getStoredData, storeData, STORAGE_KEYS } from "@/services/storageService";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    getStoredData(STORAGE_KEYS.THEME, "system")
  );

  const handleSetTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    
    // Remove existing class
    root.classList.remove("light", "dark");
    
    // Add new theme class
    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
    
    // Save to state and storage
    setTheme(newTheme);
    storeData(STORAGE_KEYS.THEME, newTheme);
  };

  // Initialize theme on mount and listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        handleSetTheme("system");
      }
    };
    
    // Initial setup
    handleSetTheme(theme);
    
    // Listen for changes
    mediaQuery.addEventListener("change", handleChange);
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  return { theme, setTheme: handleSetTheme };
}

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

import { themes } from "../themes";
import type { Theme, ThemeName } from "../themes";
interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("dark");

  return (
    <ThemeContext.Provider value={{
      theme: themes[themeName],
      themeName,
      setThemeName,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
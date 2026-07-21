import { createContext, useContext, useState, useCallback } from "react";

interface ThemeContextType {
  isDarkTheme: boolean;
  toggleTheme: (e?: React.MouseEvent<HTMLButtonElement>) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkTheme: true,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const toggleTheme = useCallback(() => {
    setIsDarkTheme(prev => !prev);
    document.body.style.backgroundColor = isDarkTheme ? "#FAFAF8" : "#0d0d0d";
    document.body.style.color = isDarkTheme ? "#202124" : "#ffffff";
  }, [isDarkTheme]);

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
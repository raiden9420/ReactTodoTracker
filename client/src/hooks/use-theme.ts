import { useTheme as useThemeContext } from "../providers/theme-provider";

export function useTheme() {
  const { theme, setTheme } = useThemeContext();

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDarkMode: theme === "dark",
  };
}

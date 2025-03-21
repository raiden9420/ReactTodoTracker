import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { toggleTheme, isDarkMode } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent transition-colors"
      onClick={toggleTheme}
    >
      {isDarkMode ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
      <span>Toggle theme</span>
    </Button>
  );
}

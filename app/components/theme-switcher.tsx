import { useTheme, type Theme } from "~/providers/theme-provider";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useTheme();

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="dark:hidden"
        onClick={() => setTheme("dark")}
      >
        <Sun />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="hidden dark:flex"
        onClick={() => setTheme("light")}
      >
        <Moon />
      </Button>
    </>
  );
}

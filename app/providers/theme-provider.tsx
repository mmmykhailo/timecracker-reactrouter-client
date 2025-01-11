import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export type Theme = "system" | "light" | "dark";

type ThemeContextType = [Theme, Dispatch<SetStateAction<Theme>>];

const ThemeContext = createContext<ThemeContextType>(["system", () => {}]);

const THEME_STORAGE_KEY = "theme-preference";

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    }
    return "system";
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    switch (theme) {
      case "system": {
        const syncTheme = (media: MediaQueryList | MediaQueryListEvent) => {
          document.documentElement.classList.toggle("dark", media.matches);
        };
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        syncTheme(media);
        media.addEventListener("change", syncTheme);
        return () => media.removeEventListener("change", syncTheme);
      }
      case "light": {
        document.documentElement.classList.remove("dark");
        break;
      }
      case "dark": {
        document.documentElement.classList.add("dark");
        break;
      }
      default: {
        console.error("Invalid theme:", theme);
      }
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={[theme, setTheme]}>
      {children}
    </ThemeContext.Provider>
  );
}

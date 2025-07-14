import { createContext, useContext, useEffect, useState } from "react"

// Tipo para la función global de tema
declare global {
  interface Window {
    __setTheme?: (theme: string) => void;
  }
}

type Theme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// Función para obtener el tema inicial SOLO si fue seleccionado explícitamente
function getInitialTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window === "undefined") return defaultTheme;
  
  try {
    const savedTheme = localStorage.getItem(storageKey);
    console.log('ThemeProvider - Theme from localStorage:', savedTheme);
    
    // Solo aplicar tema si existe y es válido (fue seleccionado por el usuario)
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme as Theme;
    }
    
    // Si no hay tema guardado, usar default (modo claro)
    return defaultTheme;
  } catch (error) {
    console.warn("ThemeProvider - localStorage error:", error);
    return defaultTheme;
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "sistema-votacion-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => 
    getInitialTheme(storageKey, defaultTheme)
  );

  // Only apply theme if DOM doesn't have it (no auto-forcing)
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Only apply if the DOM doesn't have the correct theme
    if (!root.classList.contains(theme)) {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      console.log('ThemeProvider - Applied theme to DOM:', theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      console.log('ThemeProvider - Setting theme to:', newTheme);
      
      // Use HTML script as single source of truth
      if (typeof window !== "undefined" && window.__setTheme) {
        window.__setTheme(newTheme);
      }
      
      // Update React state
      setThemeState(newTheme);
      console.log('ThemeProvider - Theme change completed:', newTheme);
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
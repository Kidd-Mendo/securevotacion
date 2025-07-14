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

// Función para obtener el tema inicial de forma sincronizada
function getInitialTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window === "undefined") return defaultTheme;
  
  try {
    const savedTheme = localStorage.getItem(storageKey);
    console.log('ThemeProvider - Theme from localStorage:', savedTheme);
    
    // Solo retornar temas válidos
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme as Theme;
    }
    
    // Si no hay tema válido, retornar el default sin escribir
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

  // Sync with HTML script - don't fight it, just update state
  useEffect(() => {
    const root = window.document.documentElement;
    const htmlTheme = root.classList.contains('dark') ? 'dark' : 'light';
    
    // If HTML script has different theme, update our state to match
    if (htmlTheme !== theme) {
      console.log('ThemeProvider - Syncing with HTML script theme:', htmlTheme);
      setThemeState(htmlTheme);
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
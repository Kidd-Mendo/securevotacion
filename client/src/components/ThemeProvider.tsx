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

  // Sincronizar con el DOM al montar (no sobrescribir el script HTML)
  useEffect(() => {
    // Solo sincronizar si el DOM no tiene la clase correcta
    const root = window.document.documentElement;
    const hasCorrectTheme = root.classList.contains(theme);
    
    if (!hasCorrectTheme) {
      console.log('ThemeProvider - Synchronizing theme:', theme);
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      console.log('ThemeProvider - Setting theme to:', newTheme);
      
      // Usar la función global si está disponible (sincronización con HTML script)
      if (typeof window !== "undefined" && window.__setTheme) {
        window.__setTheme(newTheme);
      } else {
        // Fallback: aplicar manualmente
        try {
          localStorage.setItem(storageKey, newTheme);
          const root = window.document.documentElement;
          root.classList.remove("light", "dark");
          root.classList.add(newTheme);
        } catch (error) {
          console.warn("ThemeProvider - Error setting theme:", error);
        }
      }
      
      // Actualizar estado React
      setThemeState(newTheme);
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
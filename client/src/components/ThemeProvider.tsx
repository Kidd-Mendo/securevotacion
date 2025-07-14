import { createContext, useContext, useEffect, useState } from "react"

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

// Función para obtener el tema inicial
function getInitialTheme(storageKey: string, defaultTheme: Theme): Theme {
  // Verificar si estamos en el navegador
  if (typeof window === "undefined") return defaultTheme;
  
  try {
    const savedTheme = localStorage.getItem(storageKey);
    
    // Si hay un tema guardado válido, usarlo
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme as Theme;
    }
    
    // Si no hay tema guardado, usar el tema por defecto (light) y guardarlo
    localStorage.setItem(storageKey, defaultTheme);
    return defaultTheme;
  } catch (error) {
    console.warn("Error accessing localStorage:", error);
    return defaultTheme;
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "sistema-votacion-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => 
    getInitialTheme(storageKey, defaultTheme)
  );

  // Aplicar el tema inicialmente
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      // Aplicar el tema inmediatamente al DOM
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newTheme);
      
      // Guardar en localStorage inmediatamente
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (error) {
        console.warn("Error saving theme:", error);
      }
      
      // Actualizar el estado React (esto no cambiará el DOM duplicadamente)
      setTheme(newTheme);
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
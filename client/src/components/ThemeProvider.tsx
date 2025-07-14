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
    // Intentar obtener el tema guardado
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }
    
    // Si no hay tema guardado, siempre usar el tema por defecto (light)
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

  // Aplicar el tema inmediatamente al cargar y cuando cambie
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remover todas las clases de tema
    root.classList.remove("light", "dark");
    
    // Agregar la clase del tema actual
    root.classList.add(theme);
    
    // Asegurar que el tema se mantenga en localStorage
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.warn("Error saving theme to localStorage:", error);
    }
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme);
        setTheme(newTheme);
      } catch (error) {
        console.warn("Error saving theme:", error);
        // Aún cambiar el tema aunque no se pueda guardar
        setTheme(newTheme);
      }
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
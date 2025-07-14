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

// Función para obtener el tema inicial sin modificar localStorage
function getInitialTheme(storageKey: string, defaultTheme: Theme): Theme {
  // Verificar si estamos en el navegador
  if (typeof window === "undefined") return defaultTheme;
  
  try {
    const savedTheme = localStorage.getItem(storageKey);
    console.log('ThemeProvider getInitialTheme - savedTheme:', savedTheme); // Debug
    
    // Si hay un tema guardado válido, usarlo
    if (savedTheme === "dark" || savedTheme === "light") {
      console.log('ThemeProvider returning saved theme:', savedTheme); // Debug
      return savedTheme as Theme;
    }
    
    // Si no hay tema guardado, NO escribir al localStorage aquí
    console.log('ThemeProvider using default theme (no write):', defaultTheme); // Debug
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
  const [theme, setThemeState] = useState<Theme>(() => 
    getInitialTheme(storageKey, defaultTheme)
  );

  // Aplicar el tema inicialmente
  useEffect(() => {
    const root = window.document.documentElement;
    console.log('ThemeProvider useEffect - applying theme:', theme); // Debug
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    console.log('ThemeProvider useEffect - classList after:', root.classList.toString()); // Debug
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      console.log('ThemeProvider setTheme called with:', newTheme); // Debug
      
      // Guardar PRIMERO en localStorage
      try {
        localStorage.setItem(storageKey, newTheme);
        console.log('ThemeProvider saved to localStorage:', newTheme); // Debug
      } catch (error) {
        console.warn("Error saving theme:", error);
      }
      
      // Aplicar el tema inmediatamente al DOM
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newTheme);
      console.log('ThemeProvider applied to DOM:', newTheme); // Debug
      
      // Actualizar el estado React
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
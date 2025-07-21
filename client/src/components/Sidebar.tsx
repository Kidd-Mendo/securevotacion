import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Vote, 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Shield, 
  LifeBuoy,
  User,
  Settings,
  LogOut,
  Crown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/useTranslation";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export default function Sidebar({ isMobileMenuOpen, onCloseMobileMenu }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { t } = useTranslation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getRoleName = (role: string) => {
    const roleNames = {
      student: t.roles.student,
      teacher: t.roles.teacher, 
      administrator: t.roles.administrator,
      authority: t.roles.authority
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  // MEJORA: Navegación mejorada con descripciones y mejor organización
  const navigationItems = [
    {
      href: "/",
      icon: LayoutDashboard,
      label: t.nav.dashboard,
      description: t.menuDescriptions.dashboard,
      isActive: location === "/",
      keyboardShortcut: "Alt+1",
    },
    {
      href: "/elections",
      icon: Vote,
      label: t.nav.elections,
      description: t.menuDescriptions.elections,
      isActive: location === "/elections",
      keyboardShortcut: "Alt+2",
    },
    {
      href: "/users",
      icon: Users,
      label: t.nav.users,
      description: t.menuDescriptions.users,
      isActive: location === "/users",
      visible: user?.role === "administrator" || user?.role === "authority",
      keyboardShortcut: "Alt+3",
    },
    {
      href: "/results",
      icon: BarChart3,
      label: t.nav.results,
      description: t.menuDescriptions.results,
      isActive: location === "/results",
      keyboardShortcut: "Alt+4",
    },
    {
      href: "/audit",
      icon: Shield,
      label: t.nav.audit,
      description: t.menuDescriptions.audit,
      isActive: location === "/audit",
      visible: user?.role === "administrator" || user?.role === "authority",
      keyboardShortcut: "Alt+5",
    },
    {
      href: "/support",
      icon: LifeBuoy,
      label: t.nav.support,
      description: t.menuDescriptions.support,
      isActive: location === "/support",
      keyboardShortcut: "Alt+6",
    },
  ];

  const visibleItems = navigationItems.filter(item => item.visible !== false);

  // Manejo de navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo manejar eventos cuando el foco está en elementos del sidebar
      const activeElement = document.activeElement;
      const isInSidebar = activeElement?.closest('aside[role="complementary"]') || 
                          activeElement?.closest('.mobile-sidebar');
      
      // Navegación con teclas del cursor solo cuando el foco está en el sidebar
      if (isInSidebar) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % visibleItems.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + visibleItems.length) % visibleItems.length);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          const item = visibleItems[selectedIndex];
          if (item) {
            window.location.href = item.href;
          }
        }
      }
      
      // Atajos de teclado para navegación directa (Alt + número) funcionan globalmente
      if (e.altKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= visibleItems.length) {
          const item = visibleItems[num - 1];
          if (item) {
            window.location.href = item.href;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleItems, selectedIndex]);

  // Actualizar índice cuando cambie la ubicación
  useEffect(() => {
    const currentIndex = visibleItems.findIndex(item => item.isActive);
    if (currentIndex >= 0) {
      setSelectedIndex(currentIndex);
    }
  }, [location, visibleItems]);

  return (
    <>
      {/* MEJORA: Desktop Sidebar con mejor accesibilidad */}
      <aside 
        className="w-64 bg-background shadow-lg flex-shrink-0 hidden lg:block border-r border-border"
        role="complementary"
        aria-label="Barra lateral de navegación"
      >
        <div className="h-full flex flex-col">
          {/* Logo and Institution */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center smooth-transition hover:bg-primary/90"
                role="img"
                aria-label="Logo del sistema"
              >
                <Vote className="text-primary-foreground text-xl" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Sistema de Votación</h1>
                <p className="text-sm text-muted-foreground">Unidad Educativa Simulada</p>
              </div>
            </div>
          </div>

          {/* MEJORA: User Info con mejor visibilidad */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 bg-primary rounded-full flex items-center justify-center smooth-transition hover:bg-primary/90"
                role="img"
                aria-label={`Avatar de ${user?.firstName || 'usuario'} ${user?.lastName || ''}`}
              >
                <span className="text-primary-foreground text-sm font-medium">
                  {getInitials(user?.firstName, user?.lastName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "Usuario"
                  }
                </p>
                <p className="text-xs text-muted-foreground">{getRoleName(user?.role || "")}</p>
              </div>
              <div 
                className="w-2 h-2 bg-secondary rounded-full" 
                title="En línea"
                role="status"
                aria-label="Usuario en línea"
              ></div>
            </div>
          </div>

          {/* MEJORA: Navigation Menu con mejor accesibilidad */}
          <nav className="flex-1 p-4 space-y-2" role="navigation" aria-label="Menú principal">
            {visibleItems.map((item, index) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "sidebar-nav-item focus-ring cursor-pointer",
                    item.isActive && "active",
                    selectedIndex === index && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={onCloseMobileMenu}
                  aria-current={item.isActive ? "page" : undefined}
                  aria-label={`${item.label} - ${item.description}`}
                  title={`${item.description} (${item.keyboardShortcut})`}
                  tabIndex={0}
                  role="menuitem"
                  onFocus={() => setSelectedIndex(index)}
                >
                  <item.icon 
                    className="text-lg flex-shrink-0" 
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block truncate">
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground block truncate">
                      {item.description}
                    </span>
                  </div>
                  {item.isActive && (
                    <div 
                      className="w-2 h-2 bg-primary-foreground rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </Link>
            ))}
          </nav>

          {/* MEJORA: Logout con mejor accesibilidad */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-foreground hover:bg-muted focus-ring"
              aria-label="Cerrar sesión del sistema"
            >
              <LogOut className="text-lg mr-3" aria-hidden="true" />
              <span className="font-medium">{t.nav.logout}</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* MEJORA: Mobile Sidebar con mejor accesibilidad */}
      <aside 
        className={cn(
          "mobile-sidebar",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="complementary"
        aria-label="Menú de navegación móvil"
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="h-full flex flex-col">
          {/* Header con botón de cierre */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center smooth-transition"
                role="img"
                aria-label="Logo del sistema"
              >
                <Vote className="text-primary-foreground text-xl" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Sistema de Votación</h1>
                <p className="text-sm text-muted-foreground">Unidad Educativa Simulada</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCloseMobileMenu}
              className="p-2 focus-ring"
              aria-label="Cerrar menú de navegación"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          {/* MEJORA: User Info móvil */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 bg-primary rounded-full flex items-center justify-center smooth-transition"
                role="img"
                aria-label={`Avatar de ${user?.firstName || 'usuario'} ${user?.lastName || ''}`}
              >
                <span className="text-primary-foreground text-sm font-medium">
                  {getInitials(user?.firstName, user?.lastName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "Usuario"
                  }
                </p>
                <p className="text-xs text-muted-foreground">{getRoleName(user?.role || "")}</p>
              </div>
              <div 
                className="w-2 h-2 bg-secondary rounded-full" 
                title="En línea"
                role="status"
                aria-label="Usuario en línea"
              ></div>
            </div>
          </div>

          {/* MEJORA: Navigation Menu móvil */}
          <nav className="flex-1 p-4 space-y-2" role="navigation" aria-label="Menú principal móvil">
            {visibleItems.map((item, index) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "sidebar-nav-item focus-ring cursor-pointer",
                    item.isActive && "active",
                    selectedIndex === index && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={onCloseMobileMenu}
                  aria-current={item.isActive ? "page" : undefined}
                  aria-label={`${item.label} - ${item.description}`}
                  title={`${item.description} (${item.keyboardShortcut})`}
                  tabIndex={0}
                  role="menuitem"
                  onFocus={() => setSelectedIndex(index)}
                >
                  <item.icon 
                    className="text-lg flex-shrink-0" 
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block truncate">
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground block truncate">
                      {item.description}
                    </span>
                  </div>
                  {item.isActive && (
                    <div 
                      className="w-2 h-2 bg-primary-foreground rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </Link>
            ))}
          </nav>

          {/* MEJORA: Logout móvil */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-foreground hover:bg-muted focus-ring"
              aria-label="Cerrar sesión del sistema"
            >
              <LogOut className="text-lg mr-3" aria-hidden="true" />
              <span className="font-medium">{t.nav.logout}</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
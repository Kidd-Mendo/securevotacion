import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Vote, 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Shield, 
  LifeBuoy, 
  LogOut,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export default function Sidebar({ isMobileMenuOpen, onCloseMobileMenu }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getRoleName = (role: string) => {
    const roleNames = {
      student: "Estudiante",
      teacher: "Docente", 
      administrator: "Administrador",
      authority: "Autoridad"
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const navigationItems = [
    {
      href: "/",
      icon: LayoutDashboard,
      label: "Panel Principal",
      isActive: location === "/",
    },
    {
      href: "/elections",
      icon: Vote,
      label: "Gestión de Elecciones",
      isActive: location === "/elections",
    },
    {
      href: "/users",
      icon: Users,
      label: "Gestión de Usuarios",
      isActive: location === "/users",
      visible: user?.role === "administrator" || user?.role === "authority",
    },
    {
      href: "/results",
      icon: BarChart3,
      label: "Resultados",
      isActive: location === "/results",
    },
    {
      href: "/audit",
      icon: Shield,
      label: "Auditoría",
      isActive: location === "/audit",
      visible: user?.role === "administrator" || user?.role === "authority",
    },
    {
      href: "/support",
      icon: LifeBuoy,
      label: "Soporte",
      isActive: location === "/support",
    },
  ];

  const visibleItems = navigationItems.filter(item => item.visible !== false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex-shrink-0 hidden lg:block">
        <div className="h-full flex flex-col">
          {/* Logo and Institution */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Vote className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Sistema de Votación</h1>
                <p className="text-sm text-gray-600">Unidad Educativa Simulada</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getInitials(user?.firstName, user?.lastName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "Usuario"
                  }
                </p>
                <p className="text-xs text-gray-500">{getRoleName(user?.role || "")}</p>
              </div>
              <div className="w-2 h-2 bg-secondary rounded-full" title="En línea"></div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {visibleItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "sidebar-nav-item",
                    item.isActive && "active"
                  )}
                  onClick={onCloseMobileMenu}
                >
                  <item.icon className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="text-lg mr-3" />
              <span className="font-medium">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={cn(
        "mobile-sidebar",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Logo and Institution */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Vote className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Sistema de Votación</h1>
                <p className="text-sm text-gray-600">Unidad Educativa Simulada</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getInitials(user?.firstName, user?.lastName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "Usuario"
                  }
                </p>
                <p className="text-xs text-gray-500">{getRoleName(user?.role || "")}</p>
              </div>
              <div className="w-2 h-2 bg-secondary rounded-full" title="En línea"></div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2">
            {visibleItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "sidebar-nav-item",
                    item.isActive && "active"
                  )}
                  onClick={onCloseMobileMenu}
                >
                  <item.icon className="text-lg" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="text-lg mr-3" />
              <span className="font-medium">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import {
  Menu,
  Bell,
  ChevronDown,
  Shield,
  Settings,
  User,
  LogOut,
  CheckCircle,
  AlertCircle,
  Info,
  Crown,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTranslation } from "@/lib/useTranslation";

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export default function Header({ onToggleMobileMenu }: HeaderProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  // Mock breadcrumbs - in real app this would be dynamic based on route
  const breadcrumbs = [
    { label: "Inicio", href: "/" },
    { label: "Panel Principal", href: "/dashboard" },
  ];

  return (
    <header className="bg-background shadow-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* MEJORA: Mobile menu button con mejor accesibilidad */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 focus-ring"
            onClick={onToggleMobileMenu}
            aria-label={t.nav.openMenu || "Abrir menú de navegación"}
            aria-expanded="false"
            tabIndex={0}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
            <span className="sr-only">{t.nav.menu || "Menú"}</span>
          </Button>

          {/* MEJORA: Breadcrumbs mejorados con mejor accesibilidad */}
          <nav className="hidden md:flex" aria-label="Navegación de páginas">
            <ol className="flex items-center space-x-2 text-sm" role="list">
              {breadcrumbs.map((crumb, index) => (
                <li key={`${crumb.href}-${index}`} className="flex items-center" role="listitem">
                  {index > 0 && (
                    <span 
                      className="breadcrumb-separator" 
                      aria-hidden="true"
                    >
                      →
                    </span>
                  )}
                  {index === breadcrumbs.length - 1 ? (
                    <span 
                      className="text-foreground font-medium"
                      aria-current="page"
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <a
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground smooth-transition focus-ring rounded px-1"
                      aria-label={`Ir a ${crumb.label}`}
                    >
                      {crumb.label}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* MEJORA: Notificaciones con mejor accesibilidad */}
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative p-2 focus-ring"
                aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
                aria-expanded={notificationsOpen}
                aria-haspopup="dialog"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span 
                    className="notification-badge" 
                    aria-label={`${unreadCount} notificaciones sin leer`}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                <span className="sr-only">
                  {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'Sin notificaciones'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Notificaciones</h4>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount} nuevas
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {!notifications || notifications.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm">{t.notifications?.noNotifications || "No hay notificaciones"}</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification: any) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border transition-colors hover:bg-muted ${
                          !notification.isRead
                            ? "bg-accent border-accent"
                            : ""
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(
                                new Date(notification.createdAt),
                                "d MMM, HH:mm",
                                { locale: es },
                              )}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications && notifications.length > 5 && (
                  <div className="pt-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full">
                      {t.notifications?.viewAll || "Ver todas las notificaciones"}
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Security Status */}
          <div className="security-badge hidden sm:flex">
            <Shield className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{t.header?.secureConnection || "Conexión Segura"}</span>
          </div>

          {/* MEJORA: Admin Badge con mejor visibilidad y accesibilidad */}
          {user?.role === "administrator" && (
            <div 
              className="hidden sm:flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full smooth-transition hover:bg-purple-200"
              role="status"
              aria-label="Usuario administrador"
            >
              <Crown className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">{t.roles.administrator}</span>
            </div>
          )}

          {/* MEJORA: User Menu con mejor accesibilidad */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 p-2 focus-ring"
                aria-label="Menú de usuario"
                aria-haspopup="menu"
              >
                <div 
                  className="w-8 h-8 bg-primary rounded-full flex items-center justify-center smooth-transition hover:bg-primary/90"
                  role="img"
                  aria-label={`Avatar de ${user?.firstName || 'usuario'} ${user?.lastName || ''}`}
                >
                  <span className="text-primary-foreground text-sm font-medium">
                    {getInitials(user?.firstName, user?.lastName)}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : "Usuario"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <a href="/profile" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t.nav.profile}</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="/settings" className="flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t.nav.settings}</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t.nav.logout}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

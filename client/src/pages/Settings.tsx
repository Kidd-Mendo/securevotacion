import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Bell, Globe, Shield } from "lucide-react";


export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    elections: true,
    results: true,
  });
  const [language, setLanguage] = useState("es");

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem("settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setNotifications(settings.notifications || notifications);
      setLanguage(settings.language || "es");
    }
  }, []);

  const handleNotificationChange = (
    key: keyof typeof notifications,
    value: boolean,
  ) => {
    const updatedNotifications = { ...notifications, [key]: value };
    setNotifications(updatedNotifications);

    const settings = {
      notifications: updatedNotifications,
      language,
    };
    localStorage.setItem("settings", JSON.stringify(settings));

    toast({
      title: "Configuración guardada",
      description: "Las preferencias de notificaciones han sido actualizadas",
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);

    const settings = {
      notifications,
      language: newLanguage,
    };
    localStorage.setItem("settings", JSON.stringify(settings));

    toast({
      title: "Idioma actualizado",
      description: "El idioma de la aplicación ha sido cambiado",
    });
  };

  const resetSettings = () => {
    localStorage.removeItem("settings");
    setNotifications({
      email: true,
      browser: true,
      elections: true,
      results: true,
    });
    setLanguage("es");

    toast({
      title: "Configuración restablecida",
      description:
        "Todas las configuraciones han sido restablecidas a los valores por defecto",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-gray-600">
          Personaliza tu experiencia en la plataforma de votación
        </p>
      </div>

      <div className="grid gap-6">
        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Controla cómo y cuándo recibir notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones por correo</Label>
                <p className="text-sm text-gray-500">
                  Recibir notificaciones importantes por email
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  handleNotificationChange("email", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones del navegador</Label>
                <p className="text-sm text-gray-500">
                  Mostrar notificaciones en el navegador
                </p>
              </div>
              <Switch
                checked={notifications.browser}
                onCheckedChange={(checked) =>
                  handleNotificationChange("browser", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Nuevas elecciones</Label>
                <p className="text-sm text-gray-500">
                  Avisar cuando se creen nuevas elecciones
                </p>
              </div>
              <Switch
                checked={notifications.elections}
                onCheckedChange={(checked) =>
                  handleNotificationChange("elections", checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Resultados de votación</Label>
                <p className="text-sm text-gray-500">
                  Notificar cuando estén disponibles los resultados
                </p>
              </div>
              <Switch
                checked={notifications.results}
                onCheckedChange={(checked) =>
                  handleNotificationChange("results", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Idioma y región */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Idioma y región
            </CardTitle>
            <CardDescription>
              Configurar idioma y formato regional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacidad y seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacidad y seguridad
            </CardTitle>
            <CardDescription>
              Configuración de privacidad y datos personales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-500">Autenticación</Label>
              <p className="text-sm">
                Tu cuenta está protegida con autenticación segura de Replit
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm text-gray-500">Datos de votación</Label>
              <p className="text-sm">
                Todos los votos son encriptados y anónimos
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm text-gray-500">Historial</Label>
              <p className="text-sm">
                Tu actividad se registra para auditoría y transparencia
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <Card>
          <CardHeader>
            <CardTitle>Restablecer configuración</CardTitle>
            <CardDescription>
              Restaurar todas las configuraciones a los valores por defecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={resetSettings}>
              Restablecer todo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
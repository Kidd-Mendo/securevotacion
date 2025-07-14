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
import { useTranslation } from "@/lib/i18n";
import { Bell, Globe, Shield } from "lucide-react";


export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language, setLanguage } = useTranslation();
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    elections: true,
    results: true,
  });

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem("settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setNotifications(settings.notifications || notifications);
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
      title: t.settings.saved,
      description: t.settings.notificationsSaved,
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as any);

    const settings = {
      notifications,
      language: newLanguage,
    };
    localStorage.setItem("settings", JSON.stringify(settings));

    toast({
      title: t.settings.saved,
      description: t.settings.languageSaved,
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
      title: t.settings.saved,
      description: t.settings.saved,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t.settings.title}</h1>
        <p className="text-muted-foreground">
          {t.settings.description}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t.settings.notifications.title}
            </CardTitle>
            <CardDescription>
              {t.settings.notifications.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t.settings.notifications.email}</Label>
                <p className="text-sm text-muted-foreground">
                  {t.settings.notifications.emailDesc}
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
                <Label>{t.settings.notifications.browser}</Label>
                <p className="text-sm text-muted-foreground">
                  {t.settings.notifications.browserDesc}
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
                <Label>{t.settings.notifications.elections}</Label>
                <p className="text-sm text-muted-foreground">
                  {t.settings.notifications.electionsDesc}
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
                <Label>{t.settings.notifications.results}</Label>
                <p className="text-sm text-muted-foreground">
                  {t.settings.notifications.resultsDesc}
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
              {t.settings.language.title}
            </CardTitle>
            <CardDescription>
              {t.settings.language.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t.settings.language.title}</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t.settings.language.title} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">{t.settings.language.spanish}</SelectItem>
                  <SelectItem value="en">{t.settings.language.english}</SelectItem>
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
              {t.settings.security.title}
            </CardTitle>
            <CardDescription>
              {t.settings.security.description}
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
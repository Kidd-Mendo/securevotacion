import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Lock,
  Mail,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/useTranslation";

export default function Login() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // Cargar email recordado al iniciar
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Manejar bloqueo por intentos múltiples
  useEffect(() => {
    if (blockTimer > 0) {
      const timer = setTimeout(() => {
        setBlockTimer(blockTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (blockTimer === 0 && isBlocked) {
      setIsBlocked(false);
      setAttempts(0);
    }
  }, [blockTimer, isBlocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast({
        title: "Acceso bloqueado",
        description: `Por favor espere ${blockTimer} segundos antes de intentar nuevamente.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simular validación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Para demo, usar credenciales de prueba
      if (formData.email === "admin@votacion.edu" && formData.password === "admin123") {
        // Guardar email si se marcó "Recordarme"
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
        
        // Redirigir al login de Replit para autenticación real
        window.location.href = "/api/login";
      } else {
        // Incrementar intentos fallidos
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setIsBlocked(true);
          setBlockTimer(30); // Bloquear por 30 segundos
          toast({
            title: "Demasiados intentos",
            description: "Acceso bloqueado temporalmente por seguridad.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error de autenticación",
            description: "Usuario o contraseña incorrectos. " + 
              `Intento ${newAttempts} de 3.`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al iniciar sesión. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-center">
            Ingrese sus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@votacion.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                  autoFocus
                  autoComplete="email"
                  aria-label="Correo electrónico"
                  disabled={isLoading || isBlocked}
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  required
                  autoComplete="current-password"
                  aria-label="Contraseña"
                  disabled={isLoading || isBlocked}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  disabled={isLoading || isBlocked}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Recordarme */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading || isBlocked}
              />
              <Label 
                htmlFor="remember" 
                className="text-sm font-normal cursor-pointer"
              >
                Recordar mi correo electrónico
              </Label>
            </div>

            {/* Mensaje de bloqueo */}
            {isBlocked && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Acceso bloqueado temporalmente. 
                  Espere {blockTimer} segundos antes de intentar nuevamente.
                </AlertDescription>
              </Alert>
            )}

            {/* Información de credenciales demo */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Credenciales de prueba:</strong><br />
                Email: admin@votacion.edu<br />
                Contraseña: admin123
              </AlertDescription>
            </Alert>

            {/* Botón de envío */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || isBlocked}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>

            {/* Enlaces adicionales */}
            <div className="text-center space-y-2 pt-2">
              <a 
                href="#" 
                className="text-sm text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  toast({
                    title: "Recuperación de contraseña",
                    description: "Contacte al administrador del sistema para restablecer su contraseña.",
                  });
                }}
              >
                ¿Olvidó su contraseña?
              </a>
              <p className="text-sm text-muted-foreground">
                ¿No tiene cuenta?{" "}
                <a href="/register" className="text-primary hover:underline">
                  Regístrese aquí
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
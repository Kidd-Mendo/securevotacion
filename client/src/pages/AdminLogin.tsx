
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Shield, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: "",
    adminId: ""
  });
  const [showCredentials, setShowCredentials] = useState(false);

  const defaultAdminCredentials = {
    email: "admin@votacion.edu",
    adminId: "admin-default-001",
    name: "Administrador Sistema"
  };

  const handleAdminAccess = () => {
    // Para el administrador por defecto, redirigir al login normal de Replit
    // que automáticamente asignará los permisos correctos
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md space-y-6 p-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Acceso de Administrador</h1>
          <p className="text-gray-600">Plataforma de Votación Educativa</p>
        </div>

        {/* Admin Access Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Credenciales de Administrador
            </CardTitle>
            <CardDescription>
              Utiliza las credenciales por defecto para acceder como administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Default Admin Info */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Administrador por defecto:</strong> El primer usuario que inicie sesión automáticamente obtendrá permisos de administrador.
              </AlertDescription>
            </Alert>

            {/* Show Credentials Button */}
            <Button 
              variant="outline" 
              onClick={() => setShowCredentials(!showCredentials)}
              className="w-full"
            >
              {showCredentials ? "Ocultar" : "Mostrar"} Credenciales por Defecto
            </Button>

            {/* Credentials Display */}
            {showCredentials && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="mt-1 font-mono text-sm bg-white p-2 rounded border">
                    {defaultAdminCredentials.email}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">ID de Usuario</Label>
                  <div className="mt-1 font-mono text-sm bg-white p-2 rounded border">
                    {defaultAdminCredentials.adminId}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Nombre</Label>
                  <div className="mt-1 font-mono text-sm bg-white p-2 rounded border">
                    {defaultAdminCredentials.name}
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Instrucciones de acceso:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>El primer usuario en registrarse será automáticamente administrador</li>
                <li>O utiliza las credenciales por defecto mostradas arriba</li>
                <li>Inicia sesión con tu cuenta de Replit</li>
                <li>El sistema detectará automáticamente tus permisos</li>
              </ol>
            </div>

            {/* Access Button */}
            <Button onClick={handleAdminAccess} className="w-full" size="lg">
              <Crown className="w-4 h-4 mr-2" />
              Acceder como Administrador
            </Button>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-medium text-amber-800">Aviso de Seguridad</h3>
                <p className="text-sm text-amber-700">
                  Cambia las credenciales por defecto después del primer acceso. Los administradores tienen acceso completo al sistema.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <Button variant="ghost" onClick={() => window.location.href = "/"}>
            ← Volver al Login Normal
          </Button>
        </div>
      </div>
    </div>
  );
}

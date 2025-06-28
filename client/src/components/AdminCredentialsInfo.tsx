
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Copy, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCredentialsInfo() {
  const [showCredentials, setShowCredentials] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const credentials = {
    email: "admin@votacion.edu",
    adminId: "admin-default-001",
    name: "Administrador Sistema"
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({
        title: "Copiado",
        description: `${label} copiado al portapapeles`,
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Crown className="w-5 h-5" />
          Credenciales de Administrador
        </CardTitle>
        <CardDescription className="text-purple-600">
          Información de acceso para el administrador por defecto del sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800">
            <strong>Importante:</strong> El primer usuario que se registre automáticamente será asignado como administrador.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCredentials(!showCredentials)}
            className="flex items-center gap-2"
          >
            {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showCredentials ? "Ocultar" : "Mostrar"} Credenciales
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("/admin", "_blank")}
            className="flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Página de Admin
          </Button>
        </div>

        {showCredentials && (
          <div className="space-y-3 p-4 bg-white rounded-lg border">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(credentials.email, "Email")}
                  className="h-6 px-2"
                >
                  {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <div className="font-mono text-sm bg-gray-50 p-2 rounded border">
                {credentials.email}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">ID de Usuario</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(credentials.adminId, "ID de Usuario")}
                  className="h-6 px-2"
                >
                  {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <div className="font-mono text-sm bg-gray-50 p-2 rounded border">
                {credentials.adminId}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
              <div className="font-mono text-sm bg-gray-50 p-2 rounded border mt-1">
                {credentials.name}
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-purple-700 space-y-1">
          <p><strong>Instrucciones:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Utiliza tu cuenta de Replit para iniciar sesión</li>
            <li>Si eres el primer usuario, automáticamente serás administrador</li>
            <li>Los administradores pueden gestionar usuarios, elecciones y configuración</li>
            <li>Accede al panel de administración desde el menú lateral</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

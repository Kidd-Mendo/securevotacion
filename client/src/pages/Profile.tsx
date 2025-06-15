
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Settings, Shield, Mail, Calendar, Edit3, Check, X } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("/api/profile/update", {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido actualizados correctamente.",
      });
      setIsEditing(false);
      setShowConfirmDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil.",
        variant: "destructive",
      });
      setShowConfirmDialog(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirmUpdate = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancelEdit = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "administrator": return "destructive";
      case "teacher": return "default";
      case "student": return "secondary";
      case "educational_authority": return "outline";
      default: return "secondary";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "administrator": return "Administrador";
      case "teacher": return "Profesor";
      case "student": return "Estudiante";
      case "educational_authority": return "Autoridad Educativa";
      default: return role;
    }
  };

  const hasChanges = () => {
    return (
      formData.firstName !== (user?.firstName || "") ||
      formData.lastName !== (user?.lastName || "") ||
      formData.email !== (user?.email || "")
    );
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Profile Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || "Usuario"} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {user.firstName} {user.lastName}
                    <Badge variant={getRoleBadgeColor(user.role || "student")}>
                      {getRoleDisplayName(user.role || "student")}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {isEditing ? "Cancelar" : "Editar"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Ingresa tu nombre"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Ingresa tu apellido"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Ingresa tu correo"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={!hasChanges() || updateProfileMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Guardar cambios
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Nombre</Label>
                    <p className="font-medium">{user.firstName || "No especificado"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Apellido</Label>
                    <p className="font-medium">{user.lastName || "No especificado"}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Correo electrónico</Label>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Fecha de registro</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("es-ES") : "No disponible"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security & Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad
            </CardTitle>
            <CardDescription>
              Configuración de seguridad y privacidad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-500">Estado de la cuenta</Label>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Activa
              </Badge>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm text-gray-500">Autenticación</Label>
              <p className="text-sm">Autenticación vía Replit</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm text-gray-500">Permisos</Label>
              <div className="space-y-1">
                <Badge variant="outline" className="mr-2">Votar</Badge>
                {(user.role === "teacher" || user.role === "administrator") && (
                  <Badge variant="outline" className="mr-2">Crear elecciones</Badge>
                )}
                {user.role === "administrator" && (
                  <Badge variant="outline" className="mr-2">Gestión completa</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cambios</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas actualizar tu información de perfil con los siguientes cambios?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3 text-sm">
              {formData.firstName !== (user?.firstName || "") && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium">{formData.firstName || "Sin especificar"}</span>
                </div>
              )}
              {formData.lastName !== (user?.lastName || "") && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Apellido:</span>
                  <span className="font-medium">{formData.lastName || "Sin especificar"}</span>
                </div>
              )}
              {formData.email !== (user?.email || "") && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={updateProfileMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmUpdate}
              disabled={updateProfileMutation.isPending}
              className="flex items-center gap-2"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Confirmar cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

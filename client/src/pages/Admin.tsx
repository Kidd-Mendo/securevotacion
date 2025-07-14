import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Settings,
  Shield,
  Activity,
  Plus,
  Edit,
  Trash2,
  Search,
  Crown,
} from "lucide-react";
import type { User } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["/api/admin/audit"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<User>;
    }) => {
      await apiRequest(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Usuario actualizado",
        description:
          "Los datos del usuario han sido actualizados correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingUser(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado del sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario.",
        variant: "destructive",
      });
    },
  });

  const makeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/users/${userId}/make-admin`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Administrador creado",
        description: "El usuario ahora tiene permisos de administrador.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo otorgar permisos de administrador.",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "administrator":
        return "destructive";
      case "teacher":
        return "default";
      case "student":
        return "secondary";
      case "educational_authority":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "administrator":
        return "Administrador";
      case "teacher":
        return "Profesor";
      case "student":
        return "Estudiante";
      case "educational_authority":
        return "Autoridad Educativa";
      default:
        return role;
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    if (editingUser) {
      updateUserMutation.mutate({
        userId: editingUser.id,
        data: updates,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Crown className="h-8 w-8 text-yellow-500" />
          Panel de Administración
        </h1>
        <p className="text-muted-foreground">
          Gestiona usuarios, configuraciones y monitorea el sistema
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Auditoría
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Usuarios
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Administradores
                </CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u: User) => u.role === "administrator").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Profesores
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u: User) => u.role === "teacher").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Estudiantes
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((u: User) => u.role === "student").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra roles y permisos de usuarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Buscar usuarios</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Buscar por nombre o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Filtrar por rol</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      <SelectItem value="administrator">
                        Administradores
                      </SelectItem>
                      <SelectItem value="teacher">Profesores</SelectItem>
                      <SelectItem value="student">Estudiantes</SelectItem>
                      <SelectItem value="educational_authority">
                        Autoridades
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Users Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          Cargando usuarios...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          No se encontraron usuarios
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user: User) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {user.id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={getRoleBadgeColor(
                                user.role || "student",
                              )}
                            >
                              {getRoleDisplayName(user.role || "student")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.isActive ? "default" : "secondary"}
                            >
                              {user.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "es-ES",
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Editar Usuario</DialogTitle>
                                    <DialogDescription>
                                      Modifica la información y permisos del
                                      usuario
                                    </DialogDescription>
                                  </DialogHeader>
                                  {editingUser && (
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Rol</Label>
                                        <Select
                                          value={editingUser.role}
                                          onValueChange={(role) =>
                                            handleUpdateUser({ role })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="student">
                                              Estudiante
                                            </SelectItem>
                                            <SelectItem value="teacher">
                                              Profesor
                                            </SelectItem>
                                            <SelectItem value="administrator">
                                              Administrador
                                            </SelectItem>
                                            <SelectItem value="educational_authority">
                                              Autoridad Educativa
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          id="isActive"
                                          checked={editingUser.isActive}
                                          onChange={(e) =>
                                            handleUpdateUser({
                                              isActive: e.target.checked,
                                            })
                                          }
                                        />
                                        <Label htmlFor="isActive">
                                          Usuario activo
                                        </Label>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              {user.role !== "administrator" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    makeAdminMutation.mutate(user.id)
                                  }
                                  disabled={makeAdminMutation.isPending}
                                >
                                  <Crown className="h-4 w-4" />
                                </Button>
                              )}

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      ¿Eliminar usuario?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer. El
                                      usuario será eliminado permanentemente del
                                      sistema.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        deleteUserMutation.mutate(user.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas del Sistema</CardTitle>
              <CardDescription>
                Métricas y configuración general
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Elecciones activas
                  </Label>
                  <p className="text-2xl font-bold">
                    {systemStats?.activeElections || 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Votos registrados
                  </Label>
                  <p className="text-2xl font-bold">
                    {systemStats?.totalVotes || 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Usuarios online
                  </Label>
                  <p className="text-2xl font-bold">
                    {systemStats?.onlineUsers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Auditoría</CardTitle>
              <CardDescription>
                Historial de actividades del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.length === 0 ? (
                  <p className="text-center py-6 text-gray-500">
                    No hay registros de auditoría
                  </p>
                ) : (
                  auditLogs.slice(0, 10).map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-500">{log.details}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString("es-ES")}
                        </p>
                        <Badge variant="outline">{log.entityType}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

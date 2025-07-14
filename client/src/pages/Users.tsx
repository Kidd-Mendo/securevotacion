import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Settings, 
  Shield,
  GraduationCap,
  BookOpen,
  Crown
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function UsersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const canManageUsers = user?.role === "administrator" || user?.role === "authority";

  // Mock data - in real app this would come from API
  const mockUsers = [
    {
      id: "1",
      firstName: "María",
      lastName: "González",
      email: "maria.gonzalez@example.com",
      role: "student",
      isActive: true,
      createdAt: new Date("2024-01-15"),
      profileImageUrl: null,
    },
    {
      id: "2",
      firstName: "Carlos",
      lastName: "Mendoza",
      email: "carlos.mendoza@example.com",
      role: "teacher",
      isActive: true,
      createdAt: new Date("2024-01-10"),
      profileImageUrl: null,
    },
    {
      id: "3",
      firstName: "Ana",
      lastName: "Rodríguez",
      email: "ana.rodriguez@example.com",
      role: "administrator",
      isActive: true,
      createdAt: new Date("2024-01-05"),
      profileImageUrl: null,
    },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return <GraduationCap className="w-4 h-4" />;
      case "teacher":
        return <BookOpen className="w-4 h-4" />;
      case "administrator":
        return <Shield className="w-4 h-4" />;
      case "authority":
        return <Crown className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      student: { label: "Estudiante", className: "bg-blue-100 text-blue-800" },
      teacher: { label: "Docente", className: "bg-green-100 text-green-800" },
      administrator: { label: "Administrador", className: "bg-purple-100 text-purple-800" },
      authority: { label: "Autoridad", className: "bg-red-100 text-red-800" },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, className: "bg-muted text-foreground" };
    
    return (
      <Badge variant="secondary" className={config.className}>
        {getRoleIcon(role)}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const userStats = {
    total: mockUsers.length,
    students: mockUsers.filter(u => u.role === "student").length,
    teachers: mockUsers.filter(u => u.role === "teacher").length,
    administrators: mockUsers.filter(u => u.role === "administrator").length,
    authorities: mockUsers.filter(u => u.role === "authority").length,
  };

  if (!canManageUsers) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-yellow-500" />
              <span>Acceso Restringido</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No tienes permisos para acceder a la gestión de usuarios. Esta sección está reservada para administradores y autoridades educativas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra roles y permisos de la comunidad educativa</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Agregar Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{userStats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.students}</p>
                <p className="text-sm text-muted-foreground">Estudiantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.teachers}</p>
                <p className="text-sm text-muted-foreground">Docentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.administrators}</p>
                <p className="text-sm text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{userStats.authorities}</p>
                <p className="text-sm text-muted-foreground">Autoridades</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="student">Estudiantes</SelectItem>
                  <SelectItem value="teacher">Docentes</SelectItem>
                  <SelectItem value="administrator">Administradores</SelectItem>
                  <SelectItem value="authority">Autoridades</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            {filteredUsers.length} de {mockUsers.length} usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Users className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No se encontraron usuarios</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.profileImageUrl || undefined} />
                            <AvatarFallback className="text-sm">
                              {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "secondary" : "destructive"}>
                          {user.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(user.createdAt, "d MMM yyyy", { locale: es })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

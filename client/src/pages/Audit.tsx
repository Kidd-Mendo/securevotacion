import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/useTranslation";
import { 
  Shield, 
  Search, 
  Download, 
  Filter,
  Eye,
  Lock,
  User,
  Vote,
  Settings,
  UserPlus,
  Activity,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { es, enUS, ptBR } from "date-fns/locale";

export default function Audit() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");

  const canViewAudit = user?.role === "administrator" || user?.role === "authority";
  
  // Select the correct locale based on language
  const dateLocale = language === 'es' ? es : language === 'pt' ? ptBR : enUS;

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["/api/audit-logs", { limit: 100 }],
    enabled: canViewAudit,
  });

  // Mock audit data for demonstration
  const mockAuditLogs = [
    {
      id: "1",
      userId: "user-1",
      action: "CAST_VOTE",
      resource: "vote",
      resourceId: "vote-123",
      details: { electionId: "election-1", transactionId: "VT-2025-001234" },
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
      timestamp: new Date("2025-05-15T14:30:00Z"),
    },
    {
      id: "2",
      userId: "admin-1",
      action: "CREATE_ELECTION",
      resource: "election",
      resourceId: "election-1",
      details: { electionName: "Representante Estudiantil" },
      ipAddress: "192.168.1.50",
      userAgent: "Mozilla/5.0...",
      timestamp: new Date("2025-05-14T10:15:00Z"),
    },
    {
      id: "3",
      userId: "admin-1",
      action: "CREATE_CANDIDATE",
      resource: "candidate",
      resourceId: "candidate-1",
      details: { candidateName: "Ana María Rodríguez", electionId: "election-1" },
      ipAddress: "192.168.1.50",
      userAgent: "Mozilla/5.0...",
      timestamp: new Date("2025-05-14T10:20:00Z"),
    },
    {
      id: "4",
      userId: "user-2",
      action: "LOGIN",
      resource: "user",
      resourceId: "user-2",
      details: { method: "oauth" },
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0...",
      timestamp: new Date("2025-05-15T13:45:00Z"),
    },
    {
      id: "5",
      userId: "admin-1",
      action: "UPDATE_ELECTION",
      resource: "election",
      resourceId: "election-1",
      details: { status: "active" },
      ipAddress: "192.168.1.50",
      userAgent: "Mozilla/5.0...",
      timestamp: new Date("2025-05-15T08:00:00Z"),
    },
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CAST_VOTE":
        return <Vote className="w-4 h-4" />;
      case "CREATE_ELECTION":
      case "UPDATE_ELECTION":
        return <Settings className="w-4 h-4" />;
      case "CREATE_CANDIDATE":
        return <UserPlus className="w-4 h-4" />;
      case "LOGIN":
      case "LOGOUT":
        return <User className="w-4 h-4" />;
      case "VIEW_RESULTS":
        return <Eye className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActionBadge = (action: string) => {
    const actionConfig = {
      CAST_VOTE: { label: "Voto Emitido", className: "bg-green-100 text-green-800" },
      CREATE_ELECTION: { label: "Crear Elección", className: "bg-blue-100 text-blue-800" },
      UPDATE_ELECTION: { label: "Actualizar Elección", className: "bg-yellow-100 text-yellow-800" },
      CREATE_CANDIDATE: { label: "Crear Candidato", className: "bg-purple-100 text-purple-800" },
      DELETE_CANDIDATE: { label: "Eliminar Candidato", className: "bg-red-100 text-red-800" },
      LOGIN: { label: "Inicio Sesión", className: "bg-muted text-foreground" },
      LOGOUT: { label: "Cerrar Sesión", className: "bg-muted text-foreground" },
      VIEW_RESULTS: { label: "Ver Resultados", className: "bg-indigo-100 text-indigo-800" },
    };

    const config = actionConfig[action as keyof typeof actionConfig] || { 
      label: action.replace(/_/g, ' '), 
      className: "bg-muted text-foreground" 
    };
    
    return (
      <Badge variant="secondary" className={config.className}>
        {getActionIcon(action)}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const getSeverityLevel = (action: string) => {
    const criticalActions = ["DELETE_ELECTION", "DELETE_CANDIDATE", "UPDATE_USER_ROLE"];
    const warningActions = ["CREATE_ELECTION", "UPDATE_ELECTION", "CAST_VOTE"];
    
    if (criticalActions.includes(action)) {
      return { level: "critical", icon: <AlertTriangle className="w-4 h-4 text-red-500" /> };
    } else if (warningActions.includes(action)) {
      return { level: "warning", icon: <Shield className="w-4 h-4 text-yellow-500" /> };
    } else {
      return { level: "info", icon: <Activity className="w-4 h-4 text-blue-500" /> };
    }
  };

  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesResource = resourceFilter === "all" || log.resource === resourceFilter;
    
    return matchesSearch && matchesAction && matchesResource;
  });

  const handleExportLogs = () => {
    const csvData = [
      ["Fecha", "Usuario", "Acción", "Recurso", "IP", "Detalles"],
      ...filteredLogs.map(log => [
        format(log.timestamp, "yyyy-MM-dd HH:mm:ss"),
        log.userId,
        log.action,
        log.resource,
        log.ipAddress,
        JSON.stringify(log.details)
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!canViewAudit) {
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
              No tienes permisos para acceder a los registros de auditoría. Esta sección está reservada para administradores y autoridades educativas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-24 bg-muted rounded-xl"></div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Auditoría y Seguridad</h1>
          <p className="text-muted-foreground">Monitoreo de actividades y registro de eventos del sistema</p>
        </div>
        <Button onClick={handleExportLogs}>
          <Download className="w-4 h-4 mr-2" />
          Exportar Logs
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">100%</p>
                <p className="text-sm text-muted-foreground">Seguridad</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{mockAuditLogs.filter(log => log.action === "CAST_VOTE").length}</p>
                <p className="text-sm text-muted-foreground">Votos Seguros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{mockAuditLogs.length}</p>
                <p className="text-sm text-muted-foreground">Eventos Registrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Incidentes</p>
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
                placeholder="Buscar en logs de auditoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <SelectItem value="CAST_VOTE">Votos</SelectItem>
                  <SelectItem value="CREATE_ELECTION">Crear Elección</SelectItem>
                  <SelectItem value="UPDATE_ELECTION">Actualizar Elección</SelectItem>
                  <SelectItem value="CREATE_CANDIDATE">Crear Candidato</SelectItem>
                  <SelectItem value="LOGIN">Inicio Sesión</SelectItem>
                </SelectContent>
              </Select>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por recurso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los recursos</SelectItem>
                  <SelectItem value="vote">Votos</SelectItem>
                  <SelectItem value="election">Elecciones</SelectItem>
                  <SelectItem value="candidate">Candidatos</SelectItem>
                  <SelectItem value="user">Usuarios</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.audit.title}</CardTitle>
          <CardDescription>
            {filteredLogs.length} de {mockAuditLogs.length} eventos mostrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severidad</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Dirección IP</TableHead>
                  <TableHead>Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Shield className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No se encontraron registros</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const severity = getSeverityLevel(log.action);
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {severity.icon}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(log.timestamp, "d MMM yyyy", { locale: es })}
                            </div>
                            <div className="text-muted-foreground">
                              {format(log.timestamp, "HH:mm:ss")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono">{log.userId}</span>
                        </TableCell>
                        <TableCell>
                          {getActionBadge(log.action)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {log.resource}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono">{log.ipAddress}</span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="text-sm text-foreground truncate">
                              {log.details && typeof log.details === 'object' ? (
                                Object.entries(log.details).map(([key, value]) => (
                                  <div key={key} className="truncate">
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </div>
                                ))
                              ) : (
                                String(log.details || "")
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

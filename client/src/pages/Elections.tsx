import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Plus, 
  Vote, 
  Calendar as CalendarIcon, 
  Users, 
  Settings, 
  Clock,
  CheckCircle,
  Play,
  Pause,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import VotingModal from "@/components/VotingModal";

const electionSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  startDate: z.date({
    required_error: "La fecha de inicio es requerida",
  }),
  endDate: z.date({
    required_error: "La fecha de fin es requerida",
  }),
  eligibleRoles: z.array(z.string()).min(1, "Debe seleccionar al menos un rol"),
  allowMultipleVotes: z.boolean().default(false),
  isPublic: z.boolean().default(true),
}).refine((data) => data.endDate > data.startDate, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["endDate"],
});

type ElectionFormData = z.infer<typeof electionSchema>;

export default function Elections() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [isVotingModalOpen, setIsVotingModalOpen] = useState(false);

  const { data: elections, isLoading } = useQuery({
    queryKey: ["/api/elections"],
  });

  const form = useForm<ElectionFormData>({
    resolver: zodResolver(electionSchema),
    defaultValues: {
      name: "",
      description: "",
      eligibleRoles: [],
      allowMultipleVotes: false,
      isPublic: true,
    },
  });

  const createElectionMutation = useMutation({
    mutationFn: async (data: ElectionFormData) => {
      return await apiRequest("POST", "/api/elections", data);
    },
    onSuccess: () => {
      toast({
        title: t.elections.createElection,
        description: "La elección ha sido creada exitosamente",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/elections"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "Iniciando sesión nuevamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo crear la elección",
        variant: "destructive",
      });
    },
  });

  const updateElectionStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PUT", `/api/elections/${id}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Estado actualizado",
        description: "El estado de la elección ha sido actualizado",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/elections"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "Iniciando sesión nuevamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ElectionFormData) => {
    createElectionMutation.mutate(data);
  };

  const handleVote = (election: any) => {
    setSelectedElection(election);
    setIsVotingModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-secondary text-white">{t.elections.active}</Badge>;
      case "completed":
        return <Badge variant="outline">{t.elections.completed}</Badge>;
      case "draft":
        return <Badge variant="secondary">{t.elections.draft}</Badge>;
      case "cancelled":
        return <Badge variant="destructive">{t.elections.cancelled}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const canManageElections = user?.role === "administrator" || user?.role === "authority";
  const canVote = user?.role === "student" || user?.role === "teacher";

  // MEJORA: Estado de carga con mejor accesibilidad
  if (isLoading) {
    return (
      <div 
        className="max-w-7xl mx-auto space-y-6"
        role="status"
        aria-label="Cargando elecciones"
      >
        <div className="animate-pulse space-y-6">
          <div className="h-24 bg-gray-200 rounded-xl loading-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className="h-48 bg-gray-200 rounded-xl loading-pulse"
                aria-hidden="true"
              ></div>
            ))}
          </div>
        </div>
        <span className="sr-only">Cargando información de elecciones...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* MEJORA: Header con mejor estructura semántica */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t.elections.title}
          </h1>
          <p className="text-gray-600 mt-1">
            {t.elections.description}
          </p>
        </div>
        {canManageElections && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="focus-ring"
                aria-label="Crear nueva elección electoral"
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                {t.elections.newElection}
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="max-w-2xl"
              aria-labelledby="create-election-title"
              aria-describedby="create-election-description"
            >
              <DialogHeader>
                <DialogTitle id="create-election-title">
                  {t.elections.createElection}
                </DialogTitle>
                <DialogDescription id="create-election-description">
                  Configure los parámetros de la nueva elección electoral. Los campos marcados con * son obligatorios.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Elección *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Elección Representante Estudiantil 2025" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descripción opcional de la elección..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha de Inicio *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                  ) : (
                                    <span>Seleccionar fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Fecha de Fin *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                  ) : (
                                    <span>Seleccionar fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="eligibleRoles"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Roles Elegibles *</FormLabel>
                          <FormDescription>
                            Seleccione qué roles pueden participar en esta elección
                          </FormDescription>
                        </div>
                        {[
                          { id: "student", label: "Estudiantes" },
                          { id: "teacher", label: "Docentes" },
                          { id: "administrator", label: "Administradores" },
                          { id: "authority", label: "Autoridades" },
                        ].map((role) => (
                          <FormField
                            key={role.id}
                            control={form.control}
                            name="eligibleRoles"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={role.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(role.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, role.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== role.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {role.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="allowMultipleVotes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Permitir votos múltiples
                            </FormLabel>
                            <FormDescription>
                              Los usuarios pueden cambiar su voto durante el período electoral
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Elección pública
                            </FormLabel>
                            <FormDescription>
                              Los resultados serán visibles para todos los usuarios
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="focus-ring"
                      aria-label="Cancelar creación de elección"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createElectionMutation.isPending}
                      className="focus-ring"
                      aria-label={createElectionMutation.isPending ? "Creando elección..." : "Crear nueva elección"}
                    >
                      {createElectionMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                          Creando...
                        </>
                      ) : (
                        "Crear Elección"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </header>

      {/* MEJORA: Elections Grid con mejor accesibilidad */}
      <main 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        role="main"
        aria-label="Lista de elecciones disponibles"
      >
        {elections?.length === 0 ? (
          <div 
            className="col-span-full text-center py-12"
            role="status"
            aria-live="polite"
          >
            <Vote 
              className="w-16 h-16 mx-auto text-gray-400 mb-4" 
              aria-hidden="true"
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay elecciones disponibles
            </h3>
            <p className="text-gray-600 mb-4">
              {canManageElections 
                ? "Crea tu primera elección para comenzar el proceso electoral"
                : "No hay elecciones disponibles en este momento"
              }
            </p>
            {canManageElections && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="focus-ring"
                aria-label="Crear primera elección del sistema"
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                Crear Primera Elección
              </Button>
            )}
          </div>
        ) : (
          elections?.map((election: any) => (
            <Card 
              key={election.id} 
              className="election-card focus-within:ring-2 focus-within:ring-primary"
              role="article"
              aria-labelledby={`election-title-${election.id}`}
              aria-describedby={`election-description-${election.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center smooth-transition hover:bg-primary/90"
                      role="img"
                      aria-label="Icono de elección"
                    >
                      <Vote className="text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle 
                        id={`election-title-${election.id}`}
                        className="line-clamp-2"
                      >
                        {election.name}
                      </CardTitle>
                      {getStatusBadge(election.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription 
                  id={`election-description-${election.id}`}
                  className="mb-4 line-clamp-3"
                >
                  {election.description || "Sin descripción disponible"}
                </CardDescription>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <span>
                      <time dateTime={election.startDate}>
                        {format(new Date(election.startDate), "d MMM", { locale: es })}
                      </time>
                      {" - "}
                      <time dateTime={election.endDate}>
                        {format(new Date(election.endDate), "d MMM yyyy", { locale: es })}
                      </time>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <span aria-label={`Roles elegibles: ${election.eligibleRoles.join(", ")}`}>
                      {election.eligibleRoles.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {canVote && election.status === "active" && election.eligibleRoles.includes(user?.role) && (
                    <Button 
                      size="sm" 
                      className="flex-1 focus-ring"
                      onClick={() => handleVote(election)}
                      aria-label={`Votar en la elección: ${election.name}`}
                    >
                      <Vote className="w-4 h-4 mr-2" aria-hidden="true" />
                      Votar
                    </Button>
                  )}
                  
                  {canManageElections && (
                    <>
                      {election.status === "draft" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateElectionStatusMutation.mutate({ id: election.id, status: "active" })}
                          disabled={updateElectionStatusMutation.isPending}
                          className="focus-ring"
                          aria-label={`Activar elección: ${election.name}`}
                        >
                          <Play className="w-4 h-4 mr-2" aria-hidden="true" />
                          Activar
                        </Button>
                      )}
                      
                      {election.status === "active" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateElectionStatusMutation.mutate({ id: election.id, status: "completed" })}
                          disabled={updateElectionStatusMutation.isPending}
                          className="focus-ring"
                          aria-label={`Finalizar elección: ${election.name}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                          Finalizar
                        </Button>
                      )}

                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="focus-ring"
                        aria-label={`Configurar elección: ${election.name}`}
                      >
                        <Settings className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>

      {/* Voting Modal */}
      {selectedElection && (
        <VotingModal
          election={selectedElection}
          isOpen={isVotingModalOpen}
          onClose={() => setIsVotingModalOpen(false)}
        />
      )}
    </div>
  );
}

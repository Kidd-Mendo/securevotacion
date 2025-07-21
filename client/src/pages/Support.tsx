import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/lib/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  LifeBuoy, 
  MessageCircle, 
  Mail, 
  Phone, 
  FileText,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Download,
  ExternalLink,
  Shield,
  Book,
  Settings,
  User,
  Vote,
  Loader2,
  X,
  Info
} from "lucide-react";

const supportSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingrese un correo electrónico válido"),
  subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres"),
  category: z.string().min(1, "Debe seleccionar una categoría"),
  priority: z.string().min(1, "Debe seleccionar una prioridad"),
  description: z.string()
    .min(20, "La descripción debe tener al menos 20 caracteres")
    .max(1000, "La descripción no puede exceder 1000 caracteres"),
});

type SupportFormData = z.infer<typeof supportSchema>;

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: Date;
  description: string;
}

export default function Support() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("help");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email || "",
      subject: "",
      category: "",
      priority: "",
      description: "",
    },
  });

  // Query para obtener tickets del usuario
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/support-tickets"],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const submitTicketMutation = useMutation({
    mutationFn: async (data: SupportFormData) => {
      return await apiRequest("/api/support-tickets", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (newTicket) => {
      setTicketSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: "✓ Ticket enviado exitosamente",
        description: `Su solicitud ha sido recibida. Número de ticket: #${newTicket.id}`,
      });
      form.reset({
        name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
        email: user?.email || "",
        subject: "",
        category: "",
        priority: "medium",
        description: "",
      });
      // Cambiar a la pestaña de tickets para mostrar el nuevo ticket
      setActiveTab("tickets");
      // Eliminar el delay de 5 segundos
      setTicketSubmitted(false);
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
        description: "No se pudo enviar el ticket de soporte",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SupportFormData) => {
    submitTicketMutation.mutate(data);
  };

  const faqItems = [
    {
      question: "¿Cómo puedo votar en una elección?",
      answer: "Para votar, navegue a la sección de Elecciones, seleccione la elección activa en la que desea participar y haga clic en 'Votar'. Siga las instrucciones en pantalla para seleccionar su candidato preferido y confirmar su voto de forma segura.",
      category: "voting"
    },
    {
      question: "¿Es seguro el sistema de votación?",
      answer: "Sí, nuestro sistema utiliza cifrado de extremo a extremo, autenticación segura y cumple con los estándares ISO 9241 e ISO/IEC 25010. Todos los votos se almacenan de forma cifrada y anónima, garantizando la privacidad y integridad del proceso electoral.",
      category: "security"
    },
    {
      question: "¿Puedo cambiar mi voto después de enviarlo?",
      answer: "Esto depende de la configuración de cada elección. Algunas elecciones permiten votos múltiples (cambio de voto), mientras que otras no. Esta información se muestra claramente en la pantalla de votación antes de confirmar su selección.",
      category: "voting"
    },
    {
      question: "¿Cómo puedo ver los resultados de una elección?",
      answer: "Los resultados están disponibles en la sección 'Resultados' una vez que la elección ha finalizado. Durante elecciones activas, algunos resultados pueden estar disponibles en tiempo real dependiendo de la configuración establecida por los administradores.",
      category: "results"
    },
    {
      question: "¿Qué hago si no puedo acceder al sistema?",
      answer: "Verifique que esté usando las credenciales correctas de su institución educativa. Si el problema persiste, contacte a su administrador local o envíe un ticket de soporte con los detalles del problema.",
      category: "access"
    },
    {
      question: "¿Cómo se garantiza la transparencia del proceso?",
      answer: "El sistema mantiene registros de auditoría completos, permite la supervisión por parte de autoridades educativas y genera reportes detallados. Todos los procesos siguen protocolos de transparencia establecidos por la institución.",
      category: "transparency"
    }
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: "Correo Electrónico",
      value: "soporte@votacion-educativa.edu",
      description: "Respuesta en 24 horas",
      action: "mailto:soporte@votacion-educativa.edu"
    },
    {
      icon: Phone,
      title: "Teléfono de Soporte",
      value: "+1 (555) 123-4567",
      description: "Lunes a Viernes, 8:00 AM - 6:00 PM",
      action: "tel:+15551234567"
    },
    {
      icon: MessageCircle,
      title: "Chat en Vivo",
      value: "Disponible ahora",
      description: "Respuesta inmediata",
      action: "#"
    }
  ];

  const resources = [
    {
      icon: Book,
      title: "Manual de Usuario",
      description: "Guía completa del sistema de votación",
      action: "#",
      type: "PDF"
    },
    {
      icon: FileText,
      title: "Políticas de Privacidad",
      description: "Información sobre el manejo de datos",
      action: "#",
      type: "PDF"
    },
    {
      icon: Shield,
      title: "Protocolo de Seguridad",
      description: "Detalles sobre medidas de seguridad",
      action: "#",
      type: "PDF"
    },
    {
      icon: Settings,
      title: "Guía de Administración",
      description: "Para administradores y autoridades",
      action: "#",
      type: "PDF"
    }
  ];

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">{t.support.urgent}</Badge>;
      case "high":
        return <Badge className="bg-orange-500 text-primary-foreground">Alta</Badge>;
      case "medium":
        return <Badge variant="secondary">Media</Badge>;
      case "low":
        return <Badge variant="outline">Baja</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800">{t.support.open}</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800">{t.support.inProgress}</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">{t.support.resolved}</Badge>;
      case "closed":
        return <Badge variant="outline">{t.support.closed}</Badge>;
      default:
        return null;
    }
  };

  const getCategoryDisplay = (category: string) => {
    switch (category) {
      case "technical": return "Problema Técnico";
      case "voting": return "Dificultad para Votar";
      case "account": return "Problema de Cuenta";
      case "results": return "Consulta sobre Resultados";
      case "security": return "Incidente de Seguridad";
      case "other": return "Otro";
      default: return category;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <LifeBuoy className="text-primary-foreground text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t.support.title}</h1>
            <p className="text-muted-foreground">{t.support.description}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="help">
            <HelpCircle className="w-4 h-4 mr-2" />
            {t.support.faq}
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Mail className="w-4 h-4 mr-2" />
            {t.support.contactForm}
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <MessageCircle className="w-4 h-4 mr-2" />
            {t.support.myTickets}
          </TabsTrigger>
          <TabsTrigger value="resources">
            <FileText className="w-4 h-4 mr-2" />
            Recursos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="help" className="space-y-6">
          {/* Quick Help Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                toast({
                  title: "Guía de Votación",
                  description: "Abriendo guía paso a paso para votar...",
                });
                setActiveTab("resources");
              }}
            >
              <CardContent className="p-4 text-center">
                <Vote className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Cómo Votar</h3>
                <p className="text-sm text-muted-foreground">Guía paso a paso</p>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                const securityFAQ = faqItems.filter(item => item.category === "security");
                if (securityFAQ.length > 0) {
                  toast({
                    title: "Información de Seguridad",
                    description: "Consulte las preguntas frecuentes sobre seguridad abajo",
                  });
                }
              }}
            >
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 text-secondary mx-auto mb-2" />
                <h3 className="font-semibold">Seguridad</h3>
                <p className="text-sm text-muted-foreground">Información de seguridad</p>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                window.location.href = "/settings";
              }}
            >
              <CardContent className="p-4 text-center">
                <Settings className="w-8 h-8 text-accent mx-auto mb-2" />
                <h3 className="font-semibold">Configuración</h3>
                <p className="text-sm text-muted-foreground">Ajustar preferencias</p>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                window.location.href = "/profile";
              }}
            >
              <CardContent className="p-4 text-center">
                <User className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold">Mi Cuenta</h3>
                <p className="text-sm text-muted-foreground">Gestionar perfil</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preguntas Frecuentes</CardTitle>
              <CardDescription>
                Encuentra respuestas a las consultas más comunes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {faqItems.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((contact, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <contact.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{contact.title}</h3>
                  <p className="text-xl font-bold text-primary mb-2">{contact.value}</p>
                  <p className="text-sm text-muted-foreground mb-4">{contact.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (contact.action.startsWith('#')) {
                        toast({
                          title: "Próximamente",
                          description: "Esta función estará disponible pronto",
                        });
                      } else {
                        window.open(contact.action, '_blank');
                      }
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Contactar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Emergency Contact */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="w-6 h-6 text-orange-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-orange-900 mb-2">Contacto de Emergencia</h3>
                  <p className="text-orange-800 mb-3">
                    Para problemas críticos durante períodos de votación activa, 
                    comuníquese inmediatamente con el equipo de soporte técnico.
                  </p>
                  <div className="flex space-x-3">
                    <Button 
                      size="sm" 
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => window.location.href = "tel:+15551234567"}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Llamar Ahora
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowLiveChat(true)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat Urgente
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          {/* Success message */}
          {ticketSubmitted && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2">¡Ticket enviado con éxito!</h3>
                    <p className="text-green-800 mb-2">
                      Su solicitud ha sido recibida y será procesada por nuestro equipo de soporte.
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Tiempo estimado de respuesta:</strong> 24-48 horas para prioridad normal.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create Ticket Form */}
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Ticket de Soporte</CardTitle>
              <CardDescription>
                Describe tu problema y nuestro equipo te ayudará a resolverlo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)(e);
                  }} 
                  className="space-y-6"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                      e.preventDefault();
                    }
                  }}
                >
                  {/* Instrucciones iniciales */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Instrucciones:</strong> Complete todos los campos obligatorios (*). 
                      Proporcione información detallada para que podamos ayudarle mejor. 
                      Tiempo estimado de respuesta: 24-48 horas para prioridad normal.
                    </p>
                  </div>

                  {/* Datos de contacto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                {...field} 
                                placeholder="Juan Pérez"
                                className="pl-10"
                                autoComplete="name"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                {...field} 
                                type="email"
                                placeholder="usuario@votacion.edu"
                                className="pl-10"
                                autoComplete="email"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="technical">Problema Técnico</SelectItem>
                              <SelectItem value="voting">Dificultad para Votar</SelectItem>
                              <SelectItem value="account">Problema de Cuenta</SelectItem>
                              <SelectItem value="results">Consulta sobre Resultados</SelectItem>
                              <SelectItem value="security">Incidente de Seguridad</SelectItem>
                              <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridad *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona la prioridad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Baja</SelectItem>
                              <SelectItem value="medium">Media</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="urgent">Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto *</FormLabel>
                        <FormControl>
                          <Input placeholder="Describe brevemente el problema" {...field} />
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
                        <FormLabel>Descripción Detallada *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Proporciona una descripción detallada del problema, incluyendo pasos para reproducirlo si es aplicable..."
                            className="min-h-32 resize-y"
                            {...field}
                            maxLength={1000}
                          />
                        </FormControl>
                        <FormDescription className="text-right">
                          {field.value?.length || 0}/1000 caracteres
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between items-center">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                      disabled={submitTicketMutation.isPending}
                    >
                      Limpiar formulario
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submitTicketMutation.isPending}
                      className="min-w-[150px] focus-ring"
                    >
                      {submitTicketMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Ticket
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* User Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Tickets Recientes</CardTitle>
              <CardDescription>
                Historial de tickets de soporte enviados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No has enviado ningún ticket todavía</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Los tickets que envíes aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket: any) => (
                    <div key={ticket.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          ticket.status === 'resolved' ? 'bg-green-100' :
                          ticket.status === 'in_progress' ? 'bg-yellow-100' :
                          ticket.status === 'closed' ? 'bg-muted' :
                          'bg-blue-100'
                        }`}>
                          {ticket.status === 'resolved' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : ticket.status === 'in_progress' ? (
                            <Clock className="w-5 h-5 text-yellow-600" />
                          ) : ticket.status === 'closed' ? (
                            <X className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <MessageCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{ticket.subject}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Ticket #{ticket.id} • {getCategoryDisplay(ticket.category)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Creado el {new Date(ticket.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 ml-4">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {/* Documentation and Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <resource.icon className="w-10 h-10 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
                      <p className="text-muted-foreground mb-4">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{resource.type}</Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Descargando recurso",
                              description: `Descargando ${resource.title}...`,
                            });
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Video Tutorials */}
          <Card>
            <CardHeader>
              <CardTitle>Tutoriales en Video</CardTitle>
              <CardDescription>
                Aprende a usar el sistema con nuestros tutoriales paso a paso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "Cómo votar por primera vez", duration: "3:45" },
                  { title: "Configurar tu perfil", duration: "2:30" },
                  { title: "Ver resultados electorales", duration: "4:15" },
                  { title: "Seguridad y privacidad", duration: "6:20" },
                  { title: "Reportar problemas", duration: "2:45" },
                  { title: "Gestión de notificaciones", duration: "3:10" }
                ].map((video, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted cursor-pointer">
                    <div className="aspect-video bg-muted rounded mb-3 flex items-center justify-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-l-4 border-l-white border-y-2 border-y-transparent ml-1"></div>
                      </div>
                    </div>
                    <h4 className="font-medium mb-1">{video.title}</h4>
                    <p className="text-sm text-muted-foreground">{video.duration}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live Chat Modal */}
      <Dialog open={showLiveChat} onOpenChange={setShowLiveChat}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Chat en Vivo
            </DialogTitle>
            <DialogDescription>
              Conéctate con un agente de soporte en tiempo real
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Agente disponible</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Un agente de soporte está listo para ayudarte. Tiempo de respuesta promedio: menos de 1 minuto.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Agente:</strong> ¡Hola! Soy Ana del equipo de soporte. ¿En qué puedo ayudarte hoy?
                </p>
              </div>
              
              <div className="relative">
                <Input 
                  placeholder="Escribe tu mensaje..."
                  className="pr-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      toast({
                        title: "Mensaje enviado",
                        description: "Tu mensaje ha sido enviado al agente",
                      });
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => {
                    toast({
                      title: "Mensaje enviado",
                      description: "Tu mensaje ha sido enviado al agente",
                    });
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLiveChat(false)}>
              Cerrar chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

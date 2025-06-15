import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
  Vote
} from "lucide-react";

const supportSchema = z.object({
  subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres"),
  category: z.string().min(1, "Debe seleccionar una categoría"),
  priority: z.string().min(1, "Debe seleccionar una prioridad"),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
});

type SupportFormData = z.infer<typeof supportSchema>;

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("help");

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      subject: "",
      category: "",
      priority: "",
      description: "",
    },
  });

  const submitTicketMutation = useMutation({
    mutationFn: async (data: SupportFormData) => {
      // In a real implementation, this would call the support API
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "Ticket enviado",
        description: "Su solicitud de soporte ha sido enviada exitosamente. Recibirá una respuesta pronto.",
      });
      form.reset();
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
        return <Badge variant="destructive">Urgente</Badge>;
      case "high":
        return <Badge className="bg-orange-500 text-white">Alta</Badge>;
      case "medium":
        return <Badge variant="secondary">Media</Badge>;
      case "low":
        return <Badge variant="outline">Baja</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <LifeBuoy className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Centro de Soporte</h1>
            <p className="text-gray-600">Obtén ayuda y resuelve tus dudas</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="help">
            <HelpCircle className="w-4 h-4 mr-2" />
            Ayuda
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Mail className="w-4 h-4 mr-2" />
            Contacto
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <MessageCircle className="w-4 h-4 mr-2" />
            Tickets
          </TabsTrigger>
          <TabsTrigger value="resources">
            <FileText className="w-4 h-4 mr-2" />
            Recursos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="help" className="space-y-6">
          {/* Quick Help Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Vote className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Cómo Votar</h3>
                <p className="text-sm text-gray-600">Guía paso a paso</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 text-secondary mx-auto mb-2" />
                <h3 className="font-semibold">Seguridad</h3>
                <p className="text-sm text-gray-600">Información de seguridad</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Settings className="w-8 h-8 text-accent mx-auto mb-2" />
                <h3 className="font-semibold">Configuración</h3>
                <p className="text-sm text-gray-600">Ajustar preferencias</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <User className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold">Mi Cuenta</h3>
                <p className="text-sm text-gray-600">Gestionar perfil</p>
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
                    <AccordionContent className="text-gray-600">
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
                  <p className="text-sm text-gray-600 mb-4">{contact.description}</p>
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
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Llamar Ahora
                    </Button>
                    <Button size="sm" variant="outline">
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={submitTicketMutation.isPending}
                      className="min-w-32"
                    >
                      {submitTicketMutation.isPending ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
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

          {/* Recent Tickets (Mock) */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Tickets Recientes</CardTitle>
              <CardDescription>
                Historial de tickets de soporte enviados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Problema con acceso a elección</h4>
                      <p className="text-sm text-gray-600">Ticket #12345 • Creado hace 2 días</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Resuelto</Badge>
                    {getPriorityBadge("medium")}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Consulta sobre resultados</h4>
                      <p className="text-sm text-gray-600">Ticket #12346 • Creado hace 1 día</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-100 text-yellow-800">En Progreso</Badge>
                    {getPriorityBadge("low")}
                  </div>
                </div>
              </div>
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
                      <p className="text-gray-600 mb-4">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{resource.type}</Badge>
                        <Button size="sm" variant="outline">
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
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="aspect-video bg-gray-200 rounded mb-3 flex items-center justify-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-l-4 border-l-white border-y-2 border-y-transparent ml-1"></div>
                      </div>
                    </div>
                    <h4 className="font-medium mb-1">{video.title}</h4>
                    <p className="text-sm text-gray-600">{video.duration}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

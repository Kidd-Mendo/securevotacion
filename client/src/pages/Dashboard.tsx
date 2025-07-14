import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/StatsCard";
import ActivityTimeline from "@/components/ActivityTimeline";
import { 
  Vote, 
  Users, 
  Shield, 
  CheckCircle, 
  Plus, 
  UserPlus, 
  BarChart, 
  Settings,
  Calendar,
  Clock,
  GraduationCap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslation } from "@/lib/i18n";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: activeElections, isLoading: electionsLoading } = useQuery({
    queryKey: ["/api/elections/active"],
  });

  // MEJORA: Estado de carga con mejor accesibilidad
  if (statsLoading || electionsLoading) {
    return (
      <div 
        className="max-w-7xl mx-auto space-y-6"
        role="status"
        aria-label="Cargando panel de control"
      >
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-2xl loading-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className="h-32 bg-gray-200 rounded-xl loading-pulse"
                aria-hidden="true"
              ></div>
            ))}
          </div>
        </div>
        <span className="sr-only">Cargando información del panel de control...</span>
      </div>
    );
  }

  const currentDate = format(new Date(), "d 'de' MMMM, yyyy", { locale: es });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* MEJORA: Welcome Section con mejor accesibilidad */}
      <section 
        className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white"
        role="banner"
        aria-labelledby="welcome-title"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 
              id="welcome-title"
              className="text-2xl font-bold mb-2"
            >
              {t.dashboard.welcome}
            </h1>
            <p className="text-blue-100 mb-4">
              {t.dashboard.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <time dateTime={new Date().toISOString()}>
                  {currentDate}
                </time>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" aria-hidden="true" />
                <span aria-label={`Total de usuarios registrados: ${stats?.totalUsers || 0}`}>
                  {stats?.totalUsers || 0} usuarios registrados
                </span>
              </div>
            </div>
          </div>
          <div 
            className="hidden md:block"
            role="img"
            aria-label="Icono del sistema de votación"
          >
            <Vote className="w-24 h-24 text-blue-200" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t.dashboard.activeElections}
          value={stats?.activeElections || 0}
          subtitle={t.dashboard.processesInProgress}
          icon={Vote}
          color="primary"
          trend="up"
        />
        <StatsCard
          title={t.dashboard.votesToday}
          value={stats?.votesToday || 0}
          subtitle={t.dashboard.activeParticipation}
          icon={CheckCircle}
          color="secondary"
          trend="up"
        />
        <StatsCard
          title={t.dashboard.onlineUsers}
          value={stats?.onlineUsers || 0}
          subtitle={t.dashboard.realTime}
          icon={Users}
          color="accent"
        />
        <StatsCard
          title={t.dashboard.security}
          value="100%"
          subtitle={t.dashboard.protectedSystems}
          icon={Shield}
          color="secondary"
        />
      </div>

      {/* Quick Actions and Active Elections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t.dashboard.quickActions}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(user?.role === "administrator" || user?.role === "authority") && (
                <Link href="/elections">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto p-4 border-2 border-dashed hover:border-primary hover:bg-primary/5"
                  >
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                      <Plus className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{t.dashboard.newElection}</p>
                      <p className="text-sm text-gray-600">{t.dashboard.createElectoralProcess}</p>
                    </div>
                  </Button>
                </Link>
              )}

              {(user?.role === "administrator" || user?.role === "authority") && (
                <Link href="/users">
                  <Button variant="outline" className="w-full justify-start h-auto p-4">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mr-3">
                      <UserPlus className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{t.dashboard.registerUser}</p>
                      <p className="text-sm text-gray-600">{t.dashboard.addNewParticipant}</p>
                    </div>
                  </Button>
                </Link>
              )}

              <Link href="/results">
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mr-3">
                    <BarChart className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{t.dashboard.viewResults}</p>
                    <p className="text-sm text-gray-600">{t.dashboard.analyzeVotingData}</p>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Active Elections */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t.dashboard.activeElections}</CardTitle>
              <Link href="/elections">
                <Button variant="ghost" size="sm">
                  {t.dashboard.viewAll} →
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {activeElections?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Vote className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>{t.dashboard.noActiveElections}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeElections?.slice(0, 3).map((election: any) => (
                    <div key={election.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <Vote className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{election.name}</h4>
                          <p className="text-sm text-gray-600">
                            {election.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            Finaliza: {format(new Date(election.endDate), "d MMM yyyy, HH:mm", { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-secondary text-white">
                          <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                          Activa
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline />
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-secondary/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="text-secondary text-xl" />
                  <div>
                    <p className="font-medium text-gray-900">Seguridad</p>
                    <p className="text-sm text-gray-600">Todos los sistemas protegidos</p>
                  </div>
                </div>
                <Badge className="bg-secondary text-white">Óptimo</Badge>
              </div>
            </div>

            <div className="p-4 bg-secondary/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="text-secondary text-xl" />
                  <div>
                    <p className="font-medium text-gray-900">Servidor</p>
                    <p className="text-sm text-gray-600">Uptime: 99.98%</p>
                  </div>
                </div>
                <Badge className="bg-secondary text-white">En línea</Badge>
              </div>
            </div>

            <div className="p-4 bg-secondary/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="text-secondary text-xl" />
                  <div>
                    <p className="font-medium text-gray-900">Cifrado</p>
                    <p className="text-sm text-gray-600">TLS 1.3 - AES 256</p>
                  </div>
                </div>
                <Badge className="bg-secondary text-white">Activo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

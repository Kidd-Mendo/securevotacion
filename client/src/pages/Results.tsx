import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { 
  BarChart as BarChartIcon, 
  Download, 
  Eye, 
  TrendingUp,
  Users,
  Vote,
  Calendar,
  Loader2,
  Info,
  Trophy,
  FileDown,
  Share2
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const COLORS = ['hsl(207, 90%, 54%)', 'hsl(142, 69%, 58%)', 'hsl(32, 95%, 44%)', 'hsl(0, 84%, 60%)'];

export default function Results() {
  const { t } = useTranslation();
  const [selectedElection, setSelectedElection] = useState<string>("all");

  const { data: elections, isLoading: electionsLoading } = useQuery({
    queryKey: ["/api/elections"],
  });

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ["/api/elections", selectedElection, "results"],
    enabled: selectedElection !== "all" && selectedElection !== "",
  });

  // Mock results data for demonstration
  const mockResults = {
    "election-1": {
      election: {
        id: "election-1",
        name: "Elección Representante Estudiantil 2025",
        totalVotes: 234,
        startDate: "2025-05-15",
        endDate: "2025-05-16",
        status: "completed"
      },
      results: [
        { candidateId: "1", candidateName: "Ana María Rodríguez", voteCount: 89, percentage: 38.0 },
        { candidateId: "2", candidateName: "Carlos Eduardo Mendez", voteCount: 76, percentage: 32.5 },
        { candidateId: "3", candidateName: "Laura Patricia Morales", voteCount: 69, percentage: 29.5 }
      ]
    },
    "election-2": {
      election: {
        id: "election-2",
        name: "Elección Consejo Académico 2025",
        totalVotes: 156,
        startDate: "2025-05-10",
        endDate: "2025-05-12",
        status: "completed"
      },
      results: [
        { candidateId: "4", candidateName: "Dr. Pedro Hernández", voteCount: 92, percentage: 59.0 },
        { candidateId: "5", candidateName: "Dra. Carmen López", voteCount: 64, percentage: 41.0 }
      ]
    }
  };

  const availableElections = elections?.filter((election: any) => 
    election.status === "completed" || election.status === "active"
  ) || [];

  const currentResults = selectedElection !== "all" && selectedElection !== "" 
    ? mockResults[selectedElection as keyof typeof mockResults] 
    : null;

  const handleExportResults = () => {
    if (!currentResults) return;
    
    const csvData = [
      ["Candidato", "Votos", "Porcentaje"],
      ...currentResults.results.map(result => [
        result.candidateName,
        result.voteCount.toString(),
        `${result.percentage}%`
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultados-${selectedElection}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getWinnerBadge = (index: number) => {
    if (index === 0) return (
      <Badge className="bg-yellow-500 text-primary-foreground ml-2" aria-label="Ganador de la elección">
        <Trophy className="w-3 h-3 mr-1" aria-hidden="true" />
        {t.results.winner}
      </Badge>
    );
    if (index === 1) return <Badge variant="secondary" className="ml-2" aria-label="Segundo lugar">{t.results.secondPlace}</Badge>;
    if (index === 2) return <Badge variant="outline" className="ml-2" aria-label="Tercer lugar">{t.results.thirdPlace}</Badge>;
    return null;
  };

  if (electionsLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">{t.common.loading}</h2>
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.results.title}</h1>
          <p className="text-muted-foreground">{t.results.description}</p>
        </div>
        {currentResults && (
          <div className="flex gap-2">
            <Button 
              onClick={handleExportResults}
              className="focus-ring"
              aria-label="Descargar resultados en formato CSV"
            >
              <FileDown className="w-4 h-4 mr-2" />
              {t.results.exportResults}
            </Button>
            <Button 
              variant="outline"
              className="focus-ring"
              aria-label="Compartir resultados"
              onClick={() => {
                // Future implementation for sharing
                const shareData = {
                  title: currentResults.election.name,
                  text: `Resultados de ${currentResults.election.name}`,
                  url: window.location.href
                };
                if (navigator.share) {
                  navigator.share(shareData);
                }
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {t.results.shareResults}
            </Button>
          </div>
        )}
      </div>

      {/* Election Selector */}
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Eye className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="election-selector" className="sr-only">
                Seleccionar elección para ver resultados
              </label>
              <Select value={selectedElection} onValueChange={setSelectedElection}>
                <SelectTrigger id="election-selector" className="w-full sm:w-80 focus-ring">
                  <SelectValue placeholder="Selecciona una elección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.results.allElections}</SelectItem>
                  {availableElections.map((election: any) => (
                    <SelectItem key={election.id} value={election.id}>
                      {election.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" aria-hidden="true" />
              <span>{availableElections.length} {t.results.availableElections}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Content */}
      {selectedElection === "all" || selectedElection === "" ? (
        // Overview of all elections
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableElections.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BarChartIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t.results.noResultsAvailable}</h3>
              <p className="text-muted-foreground">
                Los resultados aparecerán cuando las elecciones estén completadas.
              </p>
            </div>
          ) : (
            availableElections.map((election: any) => (
              <Card 
                key={election.id} 
                className="hover:shadow-lg transition-all cursor-pointer focus-within:ring-2 focus-within:ring-primary"
                onClick={() => setSelectedElection(election.id)}
                role="article"
                aria-label={`Elección: ${election.name}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">{election.name}</CardTitle>
                      <Badge 
                        variant={election.status === "completed" ? "secondary" : "outline"}
                        className="mt-2"
                        aria-label={`Estado: ${election.status === "completed" ? "Completada" : "En Progreso"}`}
                      >
                        {election.status === "completed" ? "Completada" : "En Progreso"}
                      </Badge>
                    </div>
                    <BarChartIcon className="w-6 h-6 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
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
                      <Vote className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      <span>
                        {mockResults[election.id as keyof typeof mockResults]?.election.totalVotes || 0} votos emitidos
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4 focus-ring"
                    aria-label={`Ver resultados detallados de ${election.name}`}
                  >
                    Ver Resultados Detallados
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : currentResults ? (
        // Detailed results for selected election
        <div className="space-y-6">
          {/* Election Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentResults.election.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(currentResults.election.startDate), "d MMM", { locale: es })} - {" "}
                          {format(new Date(currentResults.election.endDate), "d MMM yyyy", { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Vote className="w-4 h-4" />
                        <span>{currentResults.election.totalVotes} votos emitidos</span>
                      </div>
                    </div>
                  </CardDescription>
                </div>
                <Badge className="bg-secondary text-primary-foreground">
                  {currentResults.election.status === "completed" ? "Completada" : "En Progreso"}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="chart" className="space-y-6">
            <TabsList>
              <TabsTrigger value="chart">Gráfico de Barras</TabsTrigger>
              <TabsTrigger value="pie">Gráfico Circular</TabsTrigger>
              <TabsTrigger value="table">Tabla Detallada</TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              <Card>
                <CardHeader>
                  <CardTitle>Resultados por Candidato</CardTitle>
                  <CardDescription>Distribución de votos en formato de barras</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={currentResults.results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="candidateName" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`${value} votos`, "Votos"]}
                          labelFormatter={(label) => `Candidato: ${label}`}
                        />
                        <Bar dataKey="voteCount" fill="hsl(207, 90%, 54%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pie">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución Porcentual</CardTitle>
                  <CardDescription>Proporción de votos por candidato</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={currentResults.results}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ candidateName, percentage }) => `${candidateName}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="voteCount"
                        >
                          {currentResults.results.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} votos`, "Votos"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="table">
              <Card>
                <CardHeader>
                  <CardTitle id="results-table-title">Resultados Detallados</CardTitle>
                  <CardDescription>Tabla completa de resultados ordenada por votos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table 
                      className="w-full" 
                      role="table"
                      aria-labelledby="results-table-title"
                    >
                      <thead className="sr-only">
                        <tr>
                          <th scope="col">Posición</th>
                          <th scope="col">Candidato</th>
                          <th scope="col">Votos</th>
                          <th scope="col">Porcentaje</th>
                          <th scope="col">Progreso visual</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-4">
                        {currentResults.results.map((result, index) => (
                          <tr 
                            key={result.candidateId} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors"
                          >
                            <td className="flex items-center space-x-4">
                              <div 
                                className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold"
                                aria-label={`Posición ${index + 1}`}
                              >
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground flex items-center">
                                  {result.candidateName}
                                  {getWinnerBadge(index)}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  <span aria-label={`${result.voteCount} votos recibidos`}>
                                    {result.voteCount} votos
                                  </span>
                                  {" • "}
                                  <span aria-label={`${result.percentage} por ciento del total`}>
                                    {result.percentage}% del total
                                  </span>
                                </p>
                              </div>
                            </td>
                            <td className="text-right">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-24 bg-muted rounded-full h-2"
                                  role="progressbar"
                                  aria-valuenow={result.percentage}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-label={`Progreso: ${result.percentage}%`}
                                >
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${result.percentage}%` }}
                                  ></div>
                                </div>
                                <TrendingUp className="w-4 h-4 text-secondary" aria-hidden="true" />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Summary Statistics */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total de votos</p>
                        <p className="text-2xl font-bold text-primary">
                          {currentResults.election.totalVotes}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Candidatos</p>
                        <p className="text-2xl font-bold text-secondary">
                          {currentResults.results.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Participación</p>
                        <p className="text-2xl font-bold text-accent">100%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChartIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Selecciona una elección</h3>
            <p className="text-muted-foreground">
              Elige una elección del menú desplegable para ver sus resultados detallados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

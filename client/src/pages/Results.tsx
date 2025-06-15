import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const COLORS = ['hsl(207, 90%, 54%)', 'hsl(142, 69%, 58%)', 'hsl(32, 95%, 44%)', 'hsl(0, 84%, 60%)'];

export default function Results() {
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
    if (index === 0) return <Badge className="bg-yellow-500 text-white ml-2">Ganador</Badge>;
    if (index === 1) return <Badge variant="secondary" className="ml-2">2do Lugar</Badge>;
    if (index === 2) return <Badge variant="outline" className="ml-2">3er Lugar</Badge>;
    return null;
  };

  if (electionsLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-24 bg-gray-200 rounded-xl"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resultados Electorales</h1>
          <p className="text-gray-600">Visualiza y analiza los resultados de las elecciones</p>
        </div>
        {currentResults && (
          <Button onClick={handleExportResults}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Resultados
          </Button>
        )}
      </div>

      {/* Election Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Eye className="w-5 h-5 text-gray-400" />
            <Select value={selectedElection} onValueChange={setSelectedElection}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Selecciona una elección" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las elecciones</SelectItem>
                {availableElections.map((election: any) => (
                  <SelectItem key={election.id} value={election.id}>
                    {election.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Content */}
      {selectedElection === "all" || selectedElection === "" ? (
        // Overview of all elections
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableElections.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BarChartIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay resultados disponibles</h3>
              <p className="text-gray-600">
                Los resultados aparecerán cuando las elecciones estén completadas.
              </p>
            </div>
          ) : (
            availableElections.map((election: any) => (
              <Card key={election.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedElection(election.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="line-clamp-2">{election.name}</CardTitle>
                      <Badge variant={election.status === "completed" ? "secondary" : "outline"}>
                        {election.status === "completed" ? "Completada" : "En Progreso"}
                      </Badge>
                    </div>
                    <BarChartIcon className="w-6 h-6 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {format(new Date(election.startDate), "d MMM", { locale: es })} - {" "}
                        {format(new Date(election.endDate), "d MMM yyyy", { locale: es })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Vote className="w-4 h-4 text-gray-400" />
                      <span>
                        {mockResults[election.id as keyof typeof mockResults]?.election.totalVotes || 0} votos emitidos
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
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
                <Badge className="bg-secondary text-white">
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
                  <CardTitle>Resultados Detallados</CardTitle>
                  <CardDescription>Tabla completa de resultados ordenada por votos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentResults.results.map((result, index) => (
                      <div key={result.candidateId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 flex items-center">
                              {result.candidateName}
                              {getWinnerBadge(index)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {result.voteCount} votos • {result.percentage}% del total
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${result.percentage}%` }}
                              ></div>
                            </div>
                            <TrendingUp className="w-4 h-4 text-secondary" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChartIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona una elección</h3>
            <p className="text-gray-600">
              Elige una elección del menú desplegable para ver sus resultados detallados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

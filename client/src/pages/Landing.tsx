import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Vote, Users, BarChart } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Vote className="text-white text-2xl" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">Sistema de Votación Electrónica</h1>
              <p className="text-gray-600">Comunidades Educativas</p>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gestiona elecciones de forma segura y transparente con nuestro sistema de votación electrónica 
            diseñado especialmente para instituciones educativas.
          </p>
        </header>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Seguridad Avanzada</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Cifrado de extremo a extremo y autenticación segura para proteger cada voto.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Vote className="w-12 h-12 text-secondary mx-auto mb-4" />
              <CardTitle className="text-lg">Votación Intuitiva</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Interfaz simple y accesible desde cualquier dispositivo con confirmación cifrada.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart className="w-12 h-12 text-accent mx-auto mb-4" />
              <CardTitle className="text-lg">Resultados en Tiempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualización de resultados con gráficos interactivos y exportación de datos.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">Gestión Multi-Rol</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Soporte para estudiantes, docentes, administradores y autoridades educativas.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">¿Listo para comenzar?</CardTitle>
              <CardDescription className="text-lg">
                Accede al sistema con tu cuenta institucional para participar en las elecciones activas 
                o gestionar procesos electorales.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button 
                onClick={handleLogin} 
                size="lg" 
                className="w-full sm:w-auto px-8 py-3 text-lg"
              >
                <Shield className="w-5 h-5 mr-2" />
                Acceder al Sistema
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Sistema seguro con autenticación institucional
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Sistema desarrollado siguiendo estándares ISO 9241 y ISO/IEC 25010 para 
            garantizar usabilidad, seguridad y accesibilidad.
          </p>
        </footer>
      </div>
    </div>
  );
}

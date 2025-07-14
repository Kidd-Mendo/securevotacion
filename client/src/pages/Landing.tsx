import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Vote, Users, BarChart } from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";

export default function Landing() {
  const { t } = useTranslation();
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Vote className="text-primary-foreground text-2xl" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-foreground dark:text-foreground">{t.common.appName}</h1>
              <p className="text-muted-foreground dark:text-muted-foreground">{t.common.appSubtitle}</p>
            </div>
          </div>
          <p className="text-xl text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto">
            Gestiona elecciones de forma segura y transparente con nuestro sistema de votación electrónica 
            diseñado especialmente para instituciones educativas.
          </p>
        </header>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">{t.landing.security.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t.landing.security.description}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Vote className="w-12 h-12 text-secondary mx-auto mb-4" />
              <CardTitle className="text-lg">{t.landing.voting.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t.landing.voting.description}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart className="w-12 h-12 text-accent mx-auto mb-4" />
              <CardTitle className="text-lg">{t.landing.results.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t.landing.results.description}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg">{t.landing.multiRole.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t.landing.multiRole.description}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-card dark:bg-card shadow-lg border border-border dark:border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-card-foreground dark:text-card-foreground">{t.landing.cta.title}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground dark:text-muted-foreground">
                {t.landing.cta.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button 
                onClick={handleLogin} 
                size="lg" 
                className="w-full sm:w-auto px-8 py-3 text-lg"
              >
                <Shield className="w-5 h-5 mr-2" />
                {t.landing.cta.button}
              </Button>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-4">
                {t.landing.cta.secureSystem}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pt-8 border-t border-border dark:border-border">
          <p className="text-muted-foreground dark:text-muted-foreground">
            {t.landing.footer}
          </p>
        </footer>
      </div>
    </div>
  );
}

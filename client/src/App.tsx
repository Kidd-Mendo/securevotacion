import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import Elections from "@/pages/Elections";
import Users from "@/pages/Users";
import Results from "@/pages/Results";
import Audit from "@/pages/Audit";
import Support from "@/pages/Support";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Landing from "@/pages/Landing";
import AdminLogin from "@/pages/AdminLogin";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="*" component={Landing} />
      </Switch>
    );
  }
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/elections" component={Elections} />
        <Route path="/users" component={Users} />
        <Route path="/results" component={Results} />
        <Route path="/audit" component={Audit} />
        <Route path="/support" component={Support} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Layout>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light" storageKey="sistema-votacion-theme">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
export default App;

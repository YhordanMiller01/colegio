import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LoginModal } from "@/components/login-modal";
import Dashboard from "@/pages/dashboard";
import Attendance from "@/pages/attendance";
import Behavior from "@/pages/behavior";
import Notifications from "@/pages/notifications";
import Surveys from "@/pages/surveys";
import Students from "@/pages/students";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/behavior" component={Behavior} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/surveys" component={Surveys} />
      <Route path="/students" component={Students} />
    </Switch>
  );
}

function AppContent() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginModal />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const currentDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="bg-card border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold text-foreground">DisciColeControl</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {currentDate}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">{user.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

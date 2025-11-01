// Reference: javascript_log_in_with_replit, javascript_object_storage blueprints
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/pages/LandingPage";
import OnboardingPage from "@/pages/OnboardingPage";
import FeedPage from "@/pages/FeedPage";
import ProfilePage from "@/pages/ProfilePage";
import DashboardPage from "@/pages/DashboardPage";
import NotificationsPage from "@/pages/NotificationsPage";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show landing page while loading or not authenticated
  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route component={LandingPage} />
      </Switch>
    );
  }

  // Check if user needs onboarding (first-time user without name)
  if (user && (!(user as any).firstName || !(user as any).lastName || !(user as any).phoneNumber)) {
    return (
      <Switch>
        <Route path="/onboarding" component={OnboardingPage} />
        <Route component={OnboardingPage} />
      </Switch>
    );
  }

  // Show app routes for authenticated users
  return (
    <Switch>
      <Route path="/" component={FeedPage} />
      <Route path="/feed" component={FeedPage} />
      <Route path="/profile/:username" component={ProfilePage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

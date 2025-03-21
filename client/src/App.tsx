import { Route, Switch, useLocation, Redirect } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./providers/theme-provider";
import { useEffect, useState } from "react";

import Dashboard from "@/pages/dashboard";
import Survey from "@/pages/survey";
import NotFound from "@/pages/not-found";

function AppRouter() {
  const [location] = useLocation();
  const [checkingUser, setCheckingUser] = useState(true);
  const [isNewUser, setIsNewUser] = useState(true);
  
  // Check if user has profile
  const { data, isLoading } = useQuery({
    queryKey: ['/api/user/1'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user/1');
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error checking user profile:", error);
        return { success: false };
      }
    },
    retry: 1,
  });
  
  useEffect(() => {
    if (!isLoading) {
      setIsNewUser(!data?.success || !data?.user?.hasProfile);
      setCheckingUser(false);
    }
  }, [data, isLoading]);
  
  // If we're on root path, check if user is new and redirect accordingly
  if (location === "/" && !checkingUser) {
    if (isNewUser) {
      return <Redirect to="/survey" />;
    } else {
      return <Redirect to="/dashboard" />;
    }
  }
  
  return (
    <Switch>
      <Route path="/survey" component={Survey} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppRouter />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

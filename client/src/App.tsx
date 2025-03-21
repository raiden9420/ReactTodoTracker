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
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Check if user is new
  const { data, isLoading } = useQuery({
    queryKey: ['/api/check-new'],
    queryFn: async () => {
      try {
        const response = await fetch('http://localhost:5001/api/check-new');
        if (!response.ok) {
          throw new Error('Failed to fetch user status');
        }
        return await response.json();
      } catch (error) {
        console.error("Error checking user status:", error);
        // Default to showing dashboard on error
        return { is_new: false };
      }
    },
    retry: 1,
  });
  
  useEffect(() => {
    if (!isLoading && data) {
      setIsNewUser(data.is_new);
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

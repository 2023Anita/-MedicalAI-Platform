import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // Check login state from localStorage
    const loginState = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loginState === "true");
  }, []);
  
  useEffect(() => {
    if (isLoggedIn === null) return; // Still loading
    
    // Redirect logic based on auth state
    if (isLoggedIn && location === "/") {
      setLocation("/dashboard");
    } else if (!isLoggedIn && location === "/dashboard") {
      setLocation("/");
    }
  }, [isLoggedIn, location, setLocation]);
  
  // Show loading while checking auth state
  if (isLoggedIn === null) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">加载中...</p>
      </div>
    </div>;
  }
  
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

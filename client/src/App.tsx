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
  const [location] = useLocation();
  
  // Check authentication state synchronously
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  // Immediate redirect without loading state
  useEffect(() => {
    if (isLoggedIn && location === "/") {
      window.location.href = "/dashboard";
    } else if (!isLoggedIn && location === "/dashboard") {
      window.location.href = "/";
    }
  }, [isLoggedIn, location]);
  
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

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ProjectView from "@/pages/ProjectView";
import Reports from "@/pages/Reports";
import TasksPage from "@/pages/Tasks";
import TeamPage from "@/pages/Team";
import ProjectsPage from "@/pages/ProjectsPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/project/:id" component={ProjectView} />
      <Route path="/reports" component={Reports} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/team" component={TeamPage} />
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

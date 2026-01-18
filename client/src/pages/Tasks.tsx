import { useTasks } from "@/hooks/use-tasks";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "low": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "bg-emerald-500/10 text-emerald-600";
      case "in_progress": return "bg-blue-500/10 text-blue-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">All Tasks</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage all tasks across all your projects.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.length === 0 ? (
              <Card className="border-none shadow-sm bg-muted/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No tasks found. Create a project to start adding tasks.</p>
                </CardContent>
              </Card>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
                  <div className="flex items-center p-6 gap-6">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-display font-semibold text-lg">{task.title}</h3>
                        <Badge variant="outline" className={cn("capitalize", getPriorityColor(task.priority))}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-1">{task.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      {task.dueDate && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(task.dueDate), "MMM d, yyyy")}
                        </div>
                      )}
                      
                      <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium capitalize",
                        getStatusColor(task.status)
                      )}>
                        {task.status.replace("_", " ")}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

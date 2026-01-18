import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Users
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const completedTasks = tasks.filter(t => t.status === "done").length;
    const pendingTasks = tasks.filter(t => t.status !== "done").length;
    const highPriority = tasks.filter(t => t.priority === "high").length;

    return [
      { label: "Total Projects", value: totalProjects, icon: FolderKanban, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Tasks Completed", value: completedTasks, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "Pending Tasks", value: pendingTasks, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
      { label: "High Priority", value: highPriority, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
    ];
  }, [projects, tasks]);

  const isLoading = projectsLoading || tasksLoading;

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2 text-lg">Here's an overview of your workspace today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`${stat.bg} p-3 rounded-xl`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold font-display">{isLoading ? "..." : stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Task Completion Trend</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="h-[350px] pt-4">
              {isLoading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: "Mon", completed: 4 },
                    { name: "Tue", completed: 7 },
                    { name: "Wed", completed: 5 },
                    { name: "Thu", completed: 12 },
                    { name: "Fri", completed: 8 },
                    { name: "Sat", completed: 15 },
                    { name: "Sun", completed: 10 },
                  ]}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip />
                    <Area type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity or Side Stats */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader>
              <CardTitle className="font-display">Team Quick View</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {String.fromCharCode(64 + i)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">User {i}</p>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
              ))}
              <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/5 rounded-xl gap-2" asChild>
                <a href="/team">
                  <Users className="h-4 w-4" /> View All Team
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

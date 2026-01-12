import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

export default function Reports() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks();

  const statusData = useMemo(() => {
    const counts: Record<string, number> = { todo: 0, in_progress: 0, done: 0 };
    allTasks.forEach(task => {
      if (counts[task.status] !== undefined) {
        counts[task.status]++;
      }
    });
    return [
      { name: "Todo", value: counts.todo },
      { name: "In Progress", value: counts.in_progress },
      { name: "Done", value: counts.done },
    ].filter(d => d.value > 0);
  }, [allTasks]);

  const priorityData = useMemo(() => {
    const counts: Record<string, number> = { low: 0, medium: 0, high: 0 };
    allTasks.forEach(task => {
      if (counts[task.priority] !== undefined) {
        counts[task.priority]++;
      }
    });
    return [
      { name: "Low", value: counts.low },
      { name: "Medium", value: counts.medium },
      { name: "High", value: counts.high },
    ];
  }, [allTasks]);

  const projectProgressData = useMemo(() => {
    if (!projects) return [];
    return projects.map(project => {
      const projectTasks = allTasks.filter(t => t.projectId === project.id);
      const doneTasks = projectTasks.filter(t => t.status === "done").length;
      const progress = projectTasks.length > 0 
        ? Math.round((doneTasks / projectTasks.length) * 100) 
        : 0;
      return {
        name: project.name,
        progress: progress,
      };
    });
  }, [projects, allTasks]);

  const isLoading = projectsLoading || tasksLoading;

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-2 text-lg">Visual insights into your project performance.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Task Status Distribution */}
              <Card className="border-none shadow-md bg-white overflow-hidden">
                <CardHeader>
                  <CardTitle className="font-display">Task Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Task Priority Distribution */}
              <Card className="border-none shadow-md bg-white overflow-hidden">
                <CardHeader>
                  <CardTitle className="font-display">Priority Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Project Progress */}
            <Card className="border-none shadow-md bg-white overflow-hidden">
              <CardHeader>
                <CardTitle className="font-display">Project Progress (%)</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={projectProgressData} 
                    layout="vertical"
                    margin={{ left: 40, right: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}

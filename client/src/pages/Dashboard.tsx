import { useProjects } from "@/hooks/use-projects";
import { Layout } from "@/components/Layout";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Clock, MoreVertical, Layout as LayoutIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteProject } from "@/hooks/use-projects";

export default function Dashboard() {
  const { data: projects, isLoading } = useProjects();
  const { mutate: deleteProject } = useDeleteProject();

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-lg">Manage your projects and track progress.</p>
          </div>
          <CreateProjectDialog />
        </div>

        {/* Stats Row (Mock) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Active Projects", value: projects?.length || 0, icon: LayoutIcon, color: "text-blue-500" },
            { label: "Total Tasks", value: "24", icon: Clock, color: "text-orange-500" },
            { label: "Completed", value: "12", icon: ArrowRight, color: "text-green-500" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-md bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-muted ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold font-display">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold font-display">Your Projects</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-2xl" />
              ))}
            </div>
          ) : projects?.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderKanbanIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No projects yet</h3>
              <p className="text-muted-foreground mb-6">Create your first project to get started.</p>
              <CreateProjectDialog />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects?.map((project) => (
                <Link key={project.id} href={`/project/${project.id}`}>
                  <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 overflow-hidden h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="font-display text-xl group-hover:text-primary transition-colors">
                            {project.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {project.description}
                          </CardDescription>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => deleteProject(project.id)}
                              >
                                Delete Project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="mt-4 flex gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          project.status === 'active' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-muted text-muted-foreground border-transparent'
                        }`}>
                          {project.status === 'active' ? 'Active' : 'Completed'}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 border-t border-border/50 p-4 bg-muted/20">
                      <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {project.createdAt && format(new Date(project.createdAt), 'MMM d, yyyy')}
                        </span>
                        <span className="group-hover:translate-x-1 transition-transform">
                          Open Board →
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function FolderKanbanIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      <path d="M2 10h20" />
    </svg>
  );
}

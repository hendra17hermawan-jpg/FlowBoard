import { useProjects } from "@/hooks/use-projects";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderKanban, 
  Calendar,
  ChevronRight,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-2 text-lg">Manage and track all your active projects.</p>
          </div>
          <Button className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/project/${project.id}`}>
                <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-white overflow-hidden group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-display font-bold group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                    <div className="p-2 rounded-lg bg-primary/5 text-primary">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-6 h-10">
                      {project.description || "No description provided."}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "No date"}
                      </div>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none capitalize">
                        {project.status}
                      </Badge>
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-end text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
            <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold">No projects yet</h3>
            <p className="text-muted-foreground">Create your first project to get started.</p>
            <Button className="mt-6 rounded-xl">Create Project</Button>
          </div>
        )}
      </div>
    </Layout>
  );
}

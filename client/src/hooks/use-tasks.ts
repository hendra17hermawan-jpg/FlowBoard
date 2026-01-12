import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useTasks(projectId?: number) {
  return useQuery({
    queryKey: projectId ? [api.tasks.list.path, projectId] : [api.tasks.listAll.path],
    queryFn: async () => {
      const url = projectId 
        ? api.tasks.list.path.replace(':projectId', projectId.toString())
        : api.tasks.listAll.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return (projectId ? api.tasks.list : api.tasks.listAll).responses[200].parse(await res.json());
    },
    enabled: projectId !== undefined ? !isNaN(projectId) : true,
  });
}

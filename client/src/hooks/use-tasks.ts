import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateTaskRequest, type UpdateTaskRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useTasks(projectId?: number) {
  return useQuery({
    queryKey: projectId ? [api.tasks.list.path, projectId] : [api.tasks.listAll.path],
    queryFn: async () => {
      const url = projectId 
        ? buildUrl(api.tasks.list.path, { projectId })
        : api.tasks.listAll.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return (projectId ? api.tasks.list : api.tasks.listAll).responses[200].parse(await res.json());
    },
    enabled: projectId !== undefined ? !isNaN(projectId) : true,
  });
}

export function useCreateTask(projectId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<CreateTaskRequest, "projectId">) => {
      const url = buildUrl(api.tasks.create.path, { projectId });
      const res = await fetch(url, {
        method: api.tasks.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.tasks.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create task");
      }
      return api.tasks.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path, projectId] });
      queryClient.invalidateQueries({ queryKey: [api.tasks.listAll.path] });
      toast({ title: "Success", description: "Task added to board" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateTaskRequest) => {
      const url = buildUrl(api.tasks.update.path, { id });
      const res = await fetch(url, {
        method: api.tasks.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update task");
      return api.tasks.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] }); 
      queryClient.invalidateQueries({ queryKey: [api.tasks.listAll.path] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tasks.delete.path, { id });
      const res = await fetch(url, { method: api.tasks.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.tasks.listAll.path] });
      toast({ title: "Deleted", description: "Task removed" });
    },
  });
}

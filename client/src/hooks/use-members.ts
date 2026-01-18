import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateMemberRequest, type UpdateMemberRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useMembers() {
  return useQuery({
    queryKey: [api.members.list.path],
    queryFn: async () => {
      const res = await fetch(api.members.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch members");
      return api.members.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateMemberRequest) => {
      const res = await fetch(api.members.create.path, {
        method: api.members.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create member");
      return api.members.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.members.list.path] });
      toast({ title: "Success", description: "Member added successfully" });
    },
  });
}

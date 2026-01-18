import { useMembers } from "@/hooks/use-members";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddMemberDialog } from "@/components/AddMemberDialog";

export default function TeamPage() {
  const { data: members = [], isLoading } = useMembers();

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground">Team Members</h1>
            <p className="text-muted-foreground mt-2 text-lg">Manage your team and their roles.</p>
          </div>
          <AddMemberDialog />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <Card key={member.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/10">
                      <AvatarImage src={member.avatarUrl || ""} />
                      <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                        {member.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-xl">{member.name}</h3>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <Mail className="h-3.5 w-3.5" />
                        {member.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium capitalize">{member.role}</span>
                    </div>
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

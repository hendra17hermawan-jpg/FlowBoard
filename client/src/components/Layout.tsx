import { Link, useLocation } from "wouter";
import { LayoutDashboard, FolderKanban, Settings, LogOut, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: BarChart3, label: "Reports", href: "/reports" },
    // Add more nav items as needed
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FolderKanban className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">FlowBoard</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  location === item.href
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", location === item.href ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}

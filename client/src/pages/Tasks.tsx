import { useState } from "react";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, AlertCircle, GripVertical, List, LayoutDashboard } from "lucide-react";
import { format } from "date-fns";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sortable Task Card Component
function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: "bg-blue-50 text-blue-700 border-blue-200",
    medium: "bg-orange-50 text-orange-700 border-orange-200",
    high: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative bg-white p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 ring-2 ring-primary rotate-2"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <Badge 
          variant="outline" 
          className={cn("text-[10px] uppercase tracking-wider font-bold border", priorityColors[task.priority as keyof typeof priorityColors])}
        >
          {task.priority}
        </Badge>
        <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
      </div>
      <h4 className="font-medium text-foreground leading-tight">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{task.description}</p>
      )}
      {task.dueDate && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-3">
          <Calendar className="h-3 w-3" />
          {format(new Date(task.dueDate), "MMM d")}
        </div>
      )}
    </div>
  );
}

// Column Component
function KanbanColumn({ id, title, tasks }: { id: string; title: string; tasks: Task[] }) {
  const { setNodeRef } = useSortable({ id });

  return (
    <div ref={setNodeRef} className="flex flex-col h-full bg-muted/40 rounded-2xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-display font-semibold text-lg text-foreground">{title}</h3>
        <span className="text-xs font-bold bg-muted-foreground/10 text-muted-foreground px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 space-y-3 min-h-[150px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground/50 text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const { mutate: updateTask } = useUpdateTask();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "board">("board");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    let newStatus = over.id as string;
    const overTask = tasks.find(t => t.id === over.id);
    if (overTask) {
      newStatus = overTask.status;
    }

    if (activeTask.status !== newStatus && ["todo", "in_progress", "done"].includes(newStatus)) {
      updateTask({ id: activeTask.id, status: newStatus });
    }
    setActiveId(null);
  };

  const columns = {
    todo: tasks.filter(t => t.status === "todo"),
    in_progress: tasks.filter(t => t.status === "in_progress"),
    done: tasks.filter(t => t.status === "done"),
  };

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
      <div className="flex flex-col h-screen overflow-hidden">
        <header className="px-8 py-6 border-b border-border/50 bg-background/50 backdrop-blur-sm z-10">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">All Tasks</h1>
              <p className="text-muted-foreground mt-1 text-sm">Manage all tasks across all your projects.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-muted p-1 rounded-lg flex gap-1">
                <Button 
                  variant={view === "board" ? "white" : "ghost"} 
                  size="sm" 
                  className={cn("h-8 rounded-md", view === "board" && "shadow-sm bg-white")}
                  onClick={() => setView("board")}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" /> Board
                </Button>
                <Button 
                  variant={view === "list" ? "white" : "ghost"} 
                  size="sm" 
                  className={cn("h-8 rounded-md", view === "list" && "shadow-sm bg-white")}
                  onClick={() => setView("list")}
                >
                  <List className="h-4 w-4 mr-2" /> List
                </Button>
              </div>
              <AddTaskDialog />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-background">
          <div className="max-w-7xl mx-auto w-full h-full">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                <Skeleton className="h-[500px] rounded-2xl" />
                <Skeleton className="h-[500px] rounded-2xl" />
                <Skeleton className="h-[500px] rounded-2xl" />
              </div>
            ) : view === "board" ? (
              <DndContext 
                sensors={sensors} 
                collisionDetection={closestCorners} 
                onDragStart={handleDragStart} 
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px] pb-8">
                  <KanbanColumn id="todo" title="To Do" tasks={columns.todo} />
                  <KanbanColumn id="in_progress" title="In Progress" tasks={columns.in_progress} />
                  <KanbanColumn id="done" title="Done" tasks={columns.done} />
                </div>
                <DragOverlay>
                  {activeId ? (
                    <div className="rotate-2 cursor-grabbing">
                      <SortableTaskCard task={tasks.find(t => t.id === activeId)!} />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            ) : (
              <div className="grid gap-4 pb-8">
                {tasks.length === 0 ? (
                  <Card className="border-none shadow-sm bg-muted/50">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No tasks found. Create a task to get started.</p>
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
                          <div className={cn("px-3 py-1 rounded-full text-xs font-medium capitalize", getStatusColor(task.status))}>
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
        </div>
      </div>
    </Layout>
  );
}

import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useProject } from "@/hooks/use-projects";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { Layout } from "@/components/Layout";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, GripVertical, AlertCircle } from "lucide-react";
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@shared/schema";
import { cn } from "@/lib/utils";

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
      <div className="flex-1 space-y-3 min-h-[100px]">
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

export default function ProjectView() {
  const [, params] = useRoute("/project/:id");
  const projectId = Number(params?.id);
  
  const { data: project, isLoading: isProjectLoading } = useProject(projectId);
  const { data: tasks, isLoading: isTasksLoading } = useTasks(projectId);
  const { mutate: updateTask } = useUpdateTask();

  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (isProjectLoading || isTasksLoading) {
    return (
      <Layout>
        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          <Skeleton className="h-10 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
            <Skeleton className="h-full rounded-2xl" />
            <Skeleton className="h-full rounded-2xl" />
            <Skeleton className="h-full rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="p-20 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Project Not Found</h1>
          <p className="text-muted-foreground mt-2 mb-6">The project you are looking for does not exist.</p>
          <Link href="/">
            <Button>Go Back Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const columns = {
    todo: tasks?.filter(t => t.status === "todo") || [],
    in_progress: tasks?.filter(t => t.status === "in_progress") || [],
    done: tasks?.filter(t => t.status === "done") || [],
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeTask = tasks?.find(t => t.id === active.id);
    if (!activeTask) return;

    // Find which column we dropped into
    // If dropping over a container (column), id is string like "todo"
    // If dropping over a task, we need to find that task's status
    let newStatus = over.id as string;
    
    const overTask = tasks?.find(t => t.id === over.id);
    if (overTask) {
      newStatus = overTask.status;
    }

    if (activeTask.status !== newStatus && ["todo", "in_progress", "done"].includes(newStatus)) {
      updateTask({ id: activeTask.id, status: newStatus });
    }

    setActiveId(null);
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 border-b border-border/50 bg-background/50 backdrop-blur-sm z-10">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Link href="/">
                  <a className="hover:text-foreground transition-colors flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Back to Dashboard
                  </a>
                </Link>
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground">{project.name}</h1>
            </div>
            <CreateTaskDialog projectId={projectId} />
          </div>
        </header>

        {/* Board Area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 bg-background">
          <div className="h-full max-w-7xl mx-auto min-w-[800px]">
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCorners} 
              onDragStart={handleDragStart} 
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-3 gap-6 h-full pb-4">
                <KanbanColumn id="todo" title="To Do" tasks={columns.todo} />
                <KanbanColumn id="in_progress" title="In Progress" tasks={columns.in_progress} />
                <KanbanColumn id="done" title="Done" tasks={columns.done} />
              </div>

              <DragOverlay>
                {activeId ? (
                  <div className="rotate-2 cursor-grabbing">
                    <SortableTaskCard task={tasks?.find(t => t.id === activeId)!} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>
    </Layout>
  );
}

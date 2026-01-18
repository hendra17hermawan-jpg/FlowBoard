import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { projects, tasks, members } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Members
  app.get(api.members.list.path, async (req, res) => {
    const members = await storage.getMembers();
    res.json(members);
  });

  app.post(api.members.create.path, async (req, res) => {
    try {
      const input = api.members.create.input.parse(req.body);
      const member = await storage.createMember(input);
      res.status(201).json(member);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.members.update.path, async (req, res) => {
    try {
      const input = api.members.update.input.parse(req.body);
      const member = await storage.updateMember(Number(req.params.id), input);
      if (!member) return res.status(404).json({ message: "Member not found" });
      res.json(member);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.members.delete.path, async (req, res) => {
    await storage.deleteMember(Number(req.params.id));
    res.status(204).end();
  });

  // Projects
  app.get(api.projects.list.path, async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.get(api.projects.get.path, async (req, res) => {
    const project = await storage.getProject(Number(req.params.id));
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  });

  app.post(api.projects.create.path, async (req, res) => {
    try {
      const input = api.projects.create.input.parse(req.body);
      const project = await storage.createProject(input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.projects.update.path, async (req, res) => {
    try {
      const input = api.projects.update.input.parse(req.body);
      const project = await storage.updateProject(Number(req.params.id), input);
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json(project);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.projects.delete.path, async (req, res) => {
    await storage.deleteProject(Number(req.params.id));
    res.status(204).end();
  });

  // Tasks
  app.get(api.tasks.listAll.path, async (_req, res) => {
    const tasks = await storage.getAllTasks();
    res.json(tasks);
  });

  app.get(api.tasks.list.path, async (req, res) => {
    const tasks = await storage.getTasksByProject(Number(req.params.projectId));
    res.json(tasks);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask({
        ...input,
        projectId: Number(req.params.projectId)
      });
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.tasks.update.path, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const task = await storage.updateTask(Number(req.params.id), input);
      if (!task) return res.status(404).json({ message: "Task not found" });
      res.json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).end();
  });

  // Seed data
  const existingProjects = await storage.getProjects();
  if (existingProjects.length === 0) {
    const [p1] = await db.insert(projects).values({
      name: "Website Redesign",
      description: "Revamp the company website with modern UI",
      status: "active"
    }).returning();
    await db.insert(tasks).values({
      projectId: p1.id,
      title: "Design Mockups",
      description: "Create Figma designs for homepage",
      status: "done",
      priority: "high",
      dueDate: new Date()
    });
    await db.insert(tasks).values({
      projectId: p1.id,
      title: "Implement Landing Page",
      description: "Convert designs to React components",
      status: "in_progress",
      priority: "high"
    });

    const [p2] = await db.insert(projects).values({
      name: "Mobile App",
      description: "Flutter app for Android and iOS",
      status: "active"
    }).returning();
    await db.insert(tasks).values({
      projectId: p2.id,
      title: "Setup CI/CD",
      description: "Configure GitHub Actions",
      status: "todo",
      priority: "medium"
    });

    // Seed team members
    await db.insert(members).values([
      { name: "John Doe", email: "john@example.com", role: "admin" },
      { name: "Jane Smith", email: "jane@example.com", role: "member" },
      { name: "Alice Brown", email: "alice@example.com", role: "member" }
    ]);
  }

  return httpServer;
}

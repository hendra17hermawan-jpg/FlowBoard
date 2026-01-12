# FlowBoard - Project Management Application

## Overview

FlowBoard is a Kanban-style project management application built with a React frontend and Express backend. It enables users to create projects, manage tasks across different statuses (todo, in_progress, done), and visualize project progress through reports. The application features drag-and-drop task management, priority levels, and due date tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Forms**: React Hook Form with Zod validation
- **Drag & Drop**: @dnd-kit for Kanban board interactions
- **Charts**: Recharts for data visualization on the Reports page

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful API with routes defined in `shared/routes.ts`
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Validation**: Zod schemas shared between frontend and backend

### Data Storage
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` contains Drizzle table definitions
- **Tables**:
  - `projects`: id, name, description, status, createdAt
  - `tasks`: id, projectId, title, description, status, priority, dueDate, createdAt

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI and feature components
│       ├── hooks/        # Custom React hooks (queries, mutations)
│       ├── lib/          # Utilities and query client
│       └── pages/        # Route page components
├── server/           # Express backend
│   ├── db.ts         # Database connection
│   ├── routes.ts     # API route handlers
│   └── storage.ts    # Data access layer
└── shared/           # Shared code between client/server
    ├── routes.ts     # API route definitions with Zod schemas
    └── schema.ts     # Drizzle database schema
```

### API Design
Routes are defined declaratively in `shared/routes.ts` with:
- Path definitions
- HTTP methods
- Input validation schemas (Zod)
- Response type schemas

This allows type-safe API contracts shared between frontend and backend.

### Build System
- **Development**: Vite dev server with HMR
- **Production Build**: Vite for frontend, esbuild for backend bundling
- **Database Migrations**: Drizzle Kit with `db:push` command

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: PostgreSQL session store (available but not currently used for auth)

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@dnd-kit**: Drag and drop functionality for Kanban boards
- **recharts**: Chart library for the Reports page
- **date-fns**: Date formatting and manipulation
- **wouter**: Client-side routing

### UI Framework
- **Radix UI**: Headless UI primitives (dialog, dropdown, popover, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type checking across the entire codebase
- **esbuild**: Backend bundling for production
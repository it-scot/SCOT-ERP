# SCoT ERP System Architecture

## 1. High-Level Overview
The SCoT ERP is designed as a modern, scalable, multi-portal enterprise application consisting of:
1. **Frontend (Apps/Web)**: React, Vite, TypeScript, TailwindCSS/Bootstrap, React Router, TanStack Query.
2. **Backend (Apps/Api)**: Node.js, Express, TypeScript.
3. **Database**: PostgreSQL (Development) migrating to Azure SQL/PostgreSQL (Production) via Prisma ORM.

## 2. Directory Structure (Monorepo)
```text
SCOT-ERP/
├── apps/
│   ├── web/               # React Frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── pages/     # Feature-based pages (e.g., auth, staff, student)
│   │   │   ├── services/  # API layer hooks
│   │   │   └── styles/
│   ├── api/               # Express Backend
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── repositories/ # DB abstraction layer
│   │   │   ├── routes/
│   │   │   └── services/     # Business logic
├── packages/
│   ├── shared/            # Shared TS types and validation schemas
└── docs/                  # Architecture & Engine documentation
```

## 3. UI Information Architecture
The frontend is divided into two primary isolated portals:
- **Internal Employee Portal**: Routed under `/dashboard` etc. Navigation dynamic based on RBAC.
- **Student Portal**: Routed under `/student`. Completely isolated state and API endpoints.

## 4. RBAC Permission Matrix
- **Super Admin**: `*`
- **IT Admin**: `employee.view`, `asset.manage`, `procurement.manage`, `onboarding.manage`
- **HR Admin**: `employee.*`, `attendance.*`, `leave.*`, `evaluation.manage`, `onboarding.manage`
- **HOD**: `employee.view.team`, `leave.approve`, `evaluation.evaluate`, `kpi.view.team`
- **Employee**: `employee.view.self`, `leave.apply`, `evaluation.self`, `evaluation.peer`

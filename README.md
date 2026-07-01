# Inspection Report Portal

A modern web application for managing equipment inspection reports with client assignment and public QR code access.

## Overview

This system solves the problem of managing and distributing inspection reports for electrical equipment. 

**Key Features:**
- Admin can upload PDF inspection reports
- Assign reports to specific clients
- Use QR codes for public access of equipment inspection reports (no login required)
- Clients can view their assigned reports through a clean portal
- Public QR code scanning opens the report directly

## Tech Stack

- **Frontend (client-portal & admin-portal)**: React Router Framework + TypeScript + Shadcn/UI + Tailwind
- **Backend**: Fastify + TypeScript
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Auth**: Clerk
- **File Storage**: Google Drive
- **Monorepo**: PNPM Workspaces + Turborepo
- **QR Codes**: Generated client-side

## Project Structure
```bash
inspection-report-portal/
├── apps/
│   ├── admin-portal/      # Admin dashboard
│   ├── client-portal/     # Client view
│   └── backend/           # Fastify API
├── packages/
│   ├── db/                # Drizzle schema & connection
└── .env                   # Root environment variables
```

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/talha5978/inspection-report-portal.git
cd inspection-report-portal
pnpm install
```

### 2. Environment Setup
Copy .env.example to .env and fill in the values.

### 3. Google Drive Setup

1. Create a folder in Google Drive
2. Get Folder ID from URL
3. Create OAuth2 credentials in Google Cloud Console
4. Run `cd apps/backend/src/utils/` from the repo root
5. Then run npx ./get-refresh-token.ts to get the refresh token env variable

### 4. Run Development Servers

```Bash
pnpm backend:dev # Backend server
pnpm client:dev  # Client portal
pnpm admin:dev   # Admin portal
```

## Database Setup & Migrations
Easy to use database commands are given to run from repo root. Moreover migration file is provided for initial schema structure.
```Bash
# Generate migrations
pnpm db:generate

# Push to database (development)
pnpm db:push

# Or run migrations (production)
pnpm db:migrate
```

## Core Problem Solved

- Digitally manage inspection reports through a simple portal
- Assign reports to specific clients
- Provide public access of inspection reports via qr-code printed and pasted on eqipments
- Allow field workers to quickly access reports by scanning QR codes on field
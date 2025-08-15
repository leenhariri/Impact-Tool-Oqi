# OQI SDG Tool

## Overview
The OQI SDG Tool is a web-based platform for designing, mapping, and evaluating project impact pathways against the UN SDGs. It supports Theory of Change design, SDG alignment, risk/assumption tracking, an SDG interlinkage matrix, collaboration, and PDF/PNG export.

## Features
- Auth: Local JWT (Phase 1) or CERN Auth Proxy SSO (Phase 2)
- Multi-user collaboration with roles (OWNER/EDITOR/VIEWER)
- Table view (results, indicators, SDGs, risks, assumptions)
- Diagram view (arrows, hierarchy colors, linked risks)
- SDG matrix (-3..+3)
- CSV/JSON import, PDF/PNG export

## Tech Stack
Frontend: Next.js (React + TypeScript), Tailwind CSS, ShadCN/UI, React Flow  
Backend: Node.js + Express, Prisma ORM  
Database: PostgreSQL (JSONB for flexible fields)

## Core Data Model
Users/ProjectMembers, Projects, ImpactRows, Risks/Assumptions, DiagramNodes/Edges, MatrixEntries, SDG/SDGTargets, Stakeholders/StakeholderImpactLinks.

## Integration Points
- Identity/SSO: Azure AD or CERN Auth Proxy
- Email (optional): SMTP
- File storage for exports: Azure Blob or CERN storage

## Infrastructure (CERN focus)
- Hosting: OKD4 (OpenShift) + CERN Auth Proxy + DBOD PostgreSQL
- Security: HTTPS, secrets in OpenShift, RBAC
- Deploy: build Docker image → push to CERN registry → deploy to OKD

## Deployment on CERN (summary)
1) Build & push image to CERN registry  
2) Deploy to OKD4 project  
3) Provision PostgreSQL in DBOD  
4) Configure secrets (DB, JWT for dev, SMTP)

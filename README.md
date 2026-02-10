# OQI SDG Tool

## Project Description
OQI Impact Tool is a web-based impact assessment platform developed for the Open Quantum Institute (OQI). The tool supports structured Theory of Change modelling and enables projects to align their activities and outcomes with the UN Sustainable Development Goals (SDGs).

The application allows users to define impact hierarchies, associate indicators and baselines, link results to SDGs and SDG Targets, and capture contextual elements such as risks, assumptions, activities, and stakeholders. Based on this structured data, the tool generates interactive Theory of Change diagrams and SDG interlinkage matrices to support analysis, reporting, and decision-making.

The platform is designed for research, policy, and innovation projects that require transparent, evidence-based impact assessment. Authentication in the deployed environment is handled via Single Sign-On (SSO), and the tool is intended to run behind an institutional identity provider.


## Features
- Auth: Local JWT (Phase 1) or CERN Auth Proxy SSO (Phase 2)
- Multi-user collaboration with roles (OWNER/EDITOR/VIEWER)
- Table view (results, indicators, SDGs, risks, assumptions)
- Diagram view (arrows, hierarchy colors, linked risks)
- SDG matrix (-3..+3)
- CSV/JSON import (for SDGs and SDG targets in the future), PDF/PNG export

## Tech Stack
Frontend: Next.js (React + TypeScript), Tailwind CSS, ShadCN/UI, React Flow  
Backend: Node.js + Express, Prisma ORM  
Database: PostgreSQL 

## Core Data Model
Users/ProjectMembers, Projects, ImpactRows, Risks/Assumptions, DiagramNodes/Edges, MatrixEntries, SDG/SDGTargets, Stakeholders/StakeholderImpactLinks, ProjectInvite.

## Integration Points
- Identity/SSO: CERN Auth Proxy when hosting under CERN.
- Email (tbc): SMTP
- File storage for exports: Azure Blob or CERN storage

## Infrastructure 
- Hosting: OKD4 (OpenShift) + CERN Auth Proxy + DBOD PostgreSQL
- Security: HTTPS, secrets in OpenShift, RBAC
- Deploy: build Docker image → push to CERN registry → deploy to OKD

## Deployment on CERN 
1) Build & push image to CERN registry  
2) Deploy to OKD4 project  
3) Provision PostgreSQL in DBOD  
4) Configure secrets (DB, JWT for dev, SMTP)

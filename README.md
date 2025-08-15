# OQI SDG Tool

## Overview
The OQI SDG Tool is a web-based platform developed by the Open Quantum Institute to help users design, map, and evaluate the impact pathways of their projects against the United Nations Sustainable Development Goals (SDGs). It enables individuals or teams to document their theory of change, align it with relevant SDGs, visualize the relationships between results and indicators, identify associated risks and assumptions, and assess cross-SDG interactions using a color-coded interlinkage matrix.
The tool supports multi-user collaboration, a project initiator can invite others to work on the same project. All work can be saved, edited, and exported as PDF for reporting or presentation purposes.


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
Database: PostgreSQL 

## Core Data Model
Users/ProjectMembers, Projects, ImpactRows, Risks/Assumptions, DiagramNodes/Edges, MatrixEntries, SDG/SDGTargets, Stakeholders/StakeholderImpactLinks.

## Integration Points
- Identity/SSO: Azure AD or CERN Auth Proxy
- Email (tbd): SMTP
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

# OQI SDG Tool

## Project Description
OQI Impact Tool is a web-based impact assessment platform developed for the Open Quantum Institute (OQI). The tool supports structured Theory of Change modelling and enables projects to align their activities and outcomes with the UN Sustainable Development Goals (SDGs).

The application allows users to define impact hierarchies, associate indicators and baselines, link results to SDGs and SDG Targets, and capture contextual elements such as risks, assumptions, activities, and stakeholders. Based on this structured data, the tool generates interactive Theory of Change diagrams and SDG interlinkage matrices to support analysis, reporting, and decision-making.

The platform is designed for research, policy, and innovation projects that require transparent, evidence-based impact assessment. Authentication in the deployed environment is handled via Single Sign-On (SSO), and the tool is intended to run behind an institutional identity provider.

## Tech Stack
Frontend: Next.js, React, TypeScript
Backend: Node.js, Express, TypeScript, Prisma ORM
Database: PostgreSQL 

## Installation 
This project is designed to run behind an institutional Single Sign-On (SSO) layer in production.

### Prerequisites 
Ensure the following are installed on your system:
-Node.js (v18 or later)
-Docker and Docker Compose
-PostgreSQL (for local development)

### Local Development

### Clone the repository

git clone https://github.com/open-quantum-institute/impact-tool.git
cd impact-tool

### Install dependencies 

cd api
npm install

cd web
npm install

### Configure environment variables
Create environment files based on the provided examples:

cp .env.example .env
cp web/.env.local.example web/.env.local


### Start the application services 

docker-compose up --build

### Run database migrations

cd api
npx prisma migrate dev
npm run seed

## Usage

The OQI Impact Tool is used to structure, visualize, and analyze project impact through a Theory of Change framework aligned with the UN Sustainable Development Goals (SDGs).

### Accessing the Application

-In the deployed environment, users access the application through institutional Single Sign-On (SSO).
-Once authenticated, users are redirected to the project dashboard.
-Local deployments are intended for development only and may rely on a development authentication mode or an SSO proxy.

### Typical Workflow

#### Create or Open a Project
Users start by creating a new project or selecting an existing one from the dashboard.

#### Define Impact Structure
Populate the impact tables with:
-Hierarchy level (Inputs, Activities, Outputs, Outcomes, Impact)
-Result statements and indicators
-Baselines and means of measurement

#### Link SDGs and SDG Targets
Associate each result with one or more SDGs and corresponding SDG Targets.

#### Add Contextual Elements
Capture additional information such as:
-Risks
-Assumptions
-Activities
-Stakeholders

#### Generate Visual Outputs
Use the structured data to generate:
-A Theory of Change diagram
-An SDG interlinkage matrix

#### Review and Export
Review relationships and interactions, then export diagrams and matrices for reporting or further analysis.


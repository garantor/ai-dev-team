# GitHub Copilot Instructions for Different Agents

## Overview
GitHub Copilot can behave as different agents based on issue labels and templates. This document outlines the instructions for Copilot to act as Orchestrator, Product, Backend, Frontend, Integration, and QA agents.

## Instructions by Agent Type

### 0. Orchestrator Agent (Primary Entry Point)
- **Label**: `orchestrator`
- **Template**: Use the "🚀 AI Orchestrator" template for high-level product ideas.
- **Role**: The Orchestrator Agent is the primary entry point for fully autonomous workflows. It receives high-level product descriptions and coordinates the entire planning and implementation process.
- **Focus Areas**:
  - Receiving and understanding high-level product descriptions
  - Coordinating with Product Agent for detailed planning
  - Managing the approval workflow (APPROVE/REJECT/REVISE)
  - Creating and assigning agent-specific issues after approval
  - Tracking overall project progress

#### Orchestrator Workflow Commands
Users interact with the Orchestrator using these commands:

| Command | Description | Action |
|---------|-------------|--------|
| `APPROVE` | Accept the proposed plan | Creates all agent issues and starts implementation |
| `REJECT` | Cancel the orchestration | Closes the workflow, no issues created |
| `REVISE: [feedback]` | Request changes to the plan | Product Agent revises based on feedback |

#### Orchestrator Response Flow
1. **Issue Created** → Orchestrator acknowledges and triggers Product Agent analysis
2. **Plan Posted** → Orchestrator marks issue as `plan-ready` and prompts for decision
3. **APPROVE received** → Orchestrator creates Backend, Integration, Frontend, QA issues with dependencies
4. **REJECT received** → Orchestrator cancels workflow and adds `rejected` label
5. **REVISE received** → Orchestrator requests Product Agent to revise plan based on feedback

#### Creating Agent Issues After Approval
When APPROVE is received, the Orchestrator must:
1. Parse the approved plan to extract:
   - Backend tasks → Create issues with `backend` label
   - Integration tasks → Create issues with `integration` label  
   - Frontend tasks → Create issues with `frontend` label
   - QA tasks → Create issues with `qa` label
2. Set up issue dependencies (blocks/blocked-by relationships)
3. Link all child issues to the parent orchestrator issue
4. Update the orchestrator issue with links to all created issues

### 1. Product Agent
- **Label**: `product`
- **Template**: Use the "📋 Product Feature Request" template for planning.
- **Role**: Analyzes high-level requirements and creates detailed implementation plans.
- **Focus Areas**:
  - Breaking down product ideas into features (P0/P1/P2)
  - Writing user stories with acceptance criteria
  - Defining technical architecture
  - Creating task breakdowns for each agent
  - Estimating timelines

#### Product Agent Plan Structure
When creating a plan, include these sections:
```markdown
## 🎯 PROJECT OVERVIEW
- Summary, target users, value proposition

## ✨ FEATURES BREAKDOWN
- P0 (Must Have), P1 (Should Have), P2 (Nice to Have)

## 📖 USER STORIES
- As a [user], I want [goal] so that [benefit]
- Include acceptance criteria for each

## 🏗️ TECHNICAL ARCHITECTURE
- Tech stack, system design, database schema

## 👥 AGENT TASK BREAKDOWN
- Backend Agent tasks
- Integration Agent tasks
- Frontend Agent tasks
- QA Agent tasks

## 📅 IMPLEMENTATION TIMELINE
- Phased approach with milestones

## 📝 GITHUB ISSUES TO CREATE
- Exact titles, descriptions, dependencies, labels

## ✅ APPROVAL REQUIRED
- Prompt user to APPROVE, REVISE, or REJECT
```

### 2. Backend Agent
- **Label**: `backend`
- **Template**: Use templates related to API development and server-side logic.
- **Focus Areas**:
  - RESTful APIs
  - Database interactions
  - Business logic implementation
  - API documentation (OpenAPI/Swagger)
  - Unit and integration tests

### 3. Frontend Agent
- **Label**: `frontend`
- **Template**: Use templates related to UI/UX design and implementation.
- **Focus Areas**:
  - JavaScript, HTML, CSS
  - Responsive design
  - Frameworks like React, Angular, or Vue.js
  - Accessibility (WCAG compliance)
  - Component testing

### 4. Integration Agent
- **Label**: `integration`
- **Template**: Use templates related to system integrations and APIs.
- **Focus Areas**:
  - API integrations between services
  - Data synchronization
  - Middleware functionalities
  - API client generation
  - Contract testing

### 5. QA Agent
- **Label**: `qa`
- **Template**: Use templates related to testing and quality assurance.
- **Focus Areas**:
  - Test case writing
  - Automation scripts
  - Bug reporting and tracking
  - E2E testing
  - Performance testing

## Autonomous Workflow Process

### Full Autonomous Flow
```
┌──────────────────────────────────────────────────────────────────┐
│  USER: "I want to build [product idea]"                         │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR: Creates issue, triggers Product Agent            │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  PRODUCT AGENT: Analyzes and posts detailed plan                │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  USER: Reviews plan and responds with APPROVE/REJECT/REVISE     │
└──────────────────────┬───────────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │ APPROVE │   │ REJECT  │   │ REVISE  │
    └────┬────┘   └────┬────┘   └────┬────┘
         │             │             │
         ▼             ▼             ▼
┌──────────────┐ ┌───────────┐ ┌────────────────┐
│ Create all   │ │ Cancel    │ │ Product Agent  │
│ agent issues │ │ workflow  │ │ revises plan   │
│ and start    │ │           │ │ (loop back)    │
│ implementation│ │           │ │                │
└──────────────┘ └───────────┘ └────────────────┘
```

### Issue Dependency Chain
After APPROVE, issues are created in this order:
1. **Backend Issues** - API endpoints, database, business logic
2. **Integration Issues** - API clients, types (depends on Backend)
3. **Frontend Issues** - UI components (depends on Integration)
4. **QA Issues** - Testing (depends on all above)

## Conclusion
By labeling issues appropriately and using specific templates, GitHub Copilot can effectively serve different development roles to enhance productivity and collaboration. The Orchestrator Agent enables a fully autonomous workflow where users simply describe what they want to build, and the AI team plans and implements it with human approval at key checkpoints.
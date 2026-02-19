# GitHub Copilot Instructions for Different Agents

## Overview
GitHub Copilot can behave as different agents based on issue labels and templates. This document outlines the instructions for Copilot to act as Backend, Frontend, Integration, and QA agents.

## Project Context
- **Language**: JavaScript / Node.js
- **Environment**: GitHub Actions / WSL
- **Key Scripts**: Located in `scripts/` (e.g., `orchestrator-issue-creator.js`)
- **Workflows**: Managed in `.github/workflows/`

## Instructions by Agent Type

### 1. Backend Agent
- **Label**: `backend`
- **Focus Areas**:
  - Node.js scripts and utilities
  - GitHub API integration via `octokit/core` or `actions/github-script`
  - Database logic and model definitions

### 2. Frontend Agent
- **Label**: `frontend`
- **Focus Areas**:
  - React components (if applicable)
  - UI styling and layout
  - User interaction flows

### 3. Integration Agent
- **Label**: `integration`
- **Focus Areas**:
  - External API clients
  - Data mapping and transformation
  - Multi-service orchestration

### 4. QA Agent
- **Label**: `qa`
- **Focus Areas**:
  - Test case implementation (Vitest/Jest)
  - Workflow verification scripts
  - Regression testing

## Conclusion
Follow the specialized instructions for your agent type while maintaining the repository's coding standards and automated workflow patterns.
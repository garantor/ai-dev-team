# GitHub Labels Guide

This document describes all labels used in the AI Dev Team orchestration system.

## Orchestrator Labels

| Label | Color | Description | Used By |
|-------|-------|-------------|---------|
| `orchestrator` | 🟣 Purple | Main orchestrator issue | User (automatic) |
| `needs-planning` | 🟡 Yellow | Awaiting Product Agent analysis | Automation |
| `awaiting-approval` | 🟠 Orange | Plan generated, needs user review | Automation |
| `approved` | 🟢 Green | Plan approved, creating issues | User comment |
| `processing` | 🔵 Blue | Currently being processed | Automation |
| `creating-issues` | 🟣 Indigo | Auto-creating agent issues | Automation |
| `rejected` | 🔴 Red | Request rejected | User comment |

## Agent Labels

| Label | Color | Description |
|-------|-------|-------------|
| `product` | 🟣 Purple | Product Agent tasks |
| `backend` | 🔴 Red | Backend Agent tasks |
| `frontend` | 🔵 Blue | Frontend Agent tasks |
| `integration` | 🟢 Green | Integration Agent tasks |
| `qa` | 🟠 Orange | QA Agent tasks |

## Priority Labels

| Label | Description | Response Time |
|-------|-------------|---------------|
| `P0` | 🔥 Critical - start immediately | Same day |
| `P1` | 🚀 High - this week | Within 3 days |
| `P2` | 📅 Medium - this month | Within 2 weeks |
| `P3` | 💭 Low - exploratory | When available |

## Status Labels

| Label | Description |
|-------|-------------|
| `blocked` | Blocked by dependencies |
| `ready` | Ready to start work |
| `in-progress` | Work in progress |
| `in-review` | In code review |
| `done` | Completed |

## Type Labels

| Label | Description |
|-------|-------------|
| `feature` | New feature request |
| `bug` | Bug report |
| `enhancement` | Enhancement to existing feature |
| `documentation` | Documentation updates |

## Label Workflow

### Orchestrator Issue Lifecycle

```
orchestrator + needs-planning
    ↓
orchestrator + processing (AI analyzing)
    ↓
orchestrator + awaiting-approval (plan posted)
    ↓
orchestrator + approved (user comments "APPROVE")
    ↓
orchestrator + creating-issues (auto-creating agent issues)
    ↓
orchestrator + in-progress (agents working)
    ↓
orchestrator + done (all issues completed)
```

### Agent Issue Lifecycle

```
[agent-type] + blocked (waiting for dependencies)
    ↓
[agent-type] + ready (dependencies met)
    ↓
[agent-type] + in-progress (agent working)
    ↓
[agent-type] + in-review (PR opened)
    ↓
[agent-type] + done (PR merged, issue closed)
```

## Setup Instructions

### Automatic Setup (Recommended)

Run the workflow:
```bash
gh workflow run setup-labels.yml --repo garantor/ai-dev-team
```

### Manual Setup

Run the script:
```bash
chmod +x scripts/setup-labels.sh
./scripts/setup-labels.sh
```

### Verify Labels

View all labels:
```bash
gh label list --repo garantor/ai-dev-team
```

Or visit: https://github.com/garantor/ai-dev-team/labels

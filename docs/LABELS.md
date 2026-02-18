# GitHub Labels Documentation

This document describes all GitHub labels used in the AI Dev Team orchestration system.

## Overview

The AI Dev Team uses a comprehensive labeling system to automate issue routing, workflow orchestration, and project management. Labels are organized into five main categories:

1. **Orchestrator Labels** - Control the orchestration workflow
2. **Agent Labels** - Route issues to specific AI agents
3. **Priority Labels** - Indicate task priority
4. **Status Labels** - Track task progress
5. **Type Labels** - Categorize issue types

## Label Categories

### Orchestrator Labels

These labels control the AI orchestration workflow and are automatically managed by GitHub Actions.

| Label | Color | Description | Usage |
|-------|-------|-------------|-------|
| `orchestrator` | ![#8B5CF6](https://via.placeholder.com/15/8B5CF6/000000?text=+) `#8B5CF6` | AI Orchestrator issue for automated planning | Automatically applied to issues created with the AI Orchestrator template |
| `needs-planning` | ![#FCD34D](https://via.placeholder.com/15/FCD34D/000000?text=+) `#FCD34D` | Awaiting Product Agent analysis | Applied when orchestrator issue is created; removed when plan is generated |
| `awaiting-approval` | ![#FB923C](https://via.placeholder.com/15/FB923C/000000?text=+) `#FB923C` | Plan generated, waiting for approval | Applied after Product Agent generates plan; removed when approved/rejected |
| `approved` | ![#10B981](https://via.placeholder.com/15/10B981/000000?text=+) `#10B981` | Plan approved, ready for implementation | Applied when user comments "APPROVE" on the plan |
| `processing` | ![#3B82F6](https://via.placeholder.com/15/3B82F6/000000?text=+) `#3B82F6` | Currently being processed | Applied during automated processing steps |
| `creating-issues` | ![#6366F1](https://via.placeholder.com/15/6366F1/000000?text=+) `#6366F1` | Creating agent issues | Applied while automated issue creation is in progress |
| `rejected` | ![#EF4444](https://via.placeholder.com/15/EF4444/000000?text=+) `#EF4444` | Request rejected | Applied when user comments "REJECT" on the plan |

### Agent Labels

These labels route issues to specific AI agents. Each agent has specialized capabilities.

| Label | Color | Description | Agent Capabilities |
|-------|-------|-------------|-------------------|
| `product` | ![#8B5CF6](https://via.placeholder.com/15/8B5CF6/000000?text=+) `#8B5CF6` | Product Agent tasks | Requirements analysis, feature planning, user story creation |
| `backend` | ![#DC2626](https://via.placeholder.com/15/DC2626/000000?text=+) `#DC2626` | Backend Agent tasks | API development, database design, server-side logic |
| `frontend` | ![#2563EB](https://via.placeholder.com/15/2563EB/000000?text=+) `#2563EB` | Frontend Agent tasks | UI/UX implementation, component development, styling |
| `integration` | ![#059669](https://via.placeholder.com/15/059669/000000?text=+) `#059669` | Integration Agent tasks | API clients, third-party integrations, service connections |
| `qa` | ![#D97706](https://via.placeholder.com/15/D97706/000000?text=+) `#D97706` | QA Agent tasks | Test writing, quality assurance, bug verification |

### Priority Labels

Priority labels follow P0-P3 convention where lower numbers indicate higher priority.

| Label | Color | Description | SLA |
|-------|-------|-------------|-----|
| `P0` | ![#DC2626](https://via.placeholder.com/15/DC2626/000000?text=+) `#DC2626` | Critical priority | Immediate attention required |
| `P1` | ![#F59E0B](https://via.placeholder.com/15/F59E0B/000000?text=+) `#F59E0B` | High priority | Start within 24 hours |
| `P2` | ![#3B82F6](https://via.placeholder.com/15/3B82F6/000000?text=+) `#3B82F6` | Medium priority | Start within 1 week |
| `P3` | ![#6B7280](https://via.placeholder.com/15/6B7280/000000?text=+) `#6B7280` | Low priority | Backlog |

### Status Labels

Status labels track the progress of issues through the development lifecycle.

| Label | Color | Description | Next Action |
|-------|-------|-------------|-------------|
| `ready` | ![#10B981](https://via.placeholder.com/15/10B981/000000?text=+) `#10B981` | Ready to start | Agent can begin work |
| `in-progress` | ![#FBBF24](https://via.placeholder.com/15/FBBF24/000000?text=+) `#FBBF24` | Work in progress | Agent is actively working |
| `in-review` | ![#8B5CF6](https://via.placeholder.com/15/8B5CF6/000000?text=+) `#8B5CF6` | In code review | PR awaiting review |
| `blocked` | ![#DC2626](https://via.placeholder.com/15/DC2626/000000?text=+) `#DC2626` | Blocked by dependencies | Waiting on other issues |
| `done` | ![#059669](https://via.placeholder.com/15/059669/000000?text=+) `#059669` | Completed | Issue is closed |

### Type Labels

Type labels categorize the nature of the issue.

| Label | Color | Description | Use Case |
|-------|-------|-------------|----------|
| `feature` | ![#10B981](https://via.placeholder.com/15/10B981/000000?text=+) `#10B981` | New feature | New functionality or capability |
| `bug` | ![#DC2626](https://via.placeholder.com/15/DC2626/000000?text=+) `#DC2626` | Bug report | Defect or error that needs fixing |
| `enhancement` | ![#3B82F6](https://via.placeholder.com/15/3B82F6/000000?text=+) `#3B82F6` | Enhancement | Improvement to existing feature |
| `documentation` | ![#6B7280](https://via.placeholder.com/15/6B7280/000000?text=+) `#6B7280` | Documentation | Documentation updates or additions |

## Setup Instructions

### Automated Setup (GitHub Actions)

Labels are automatically created/updated when you push the setup workflow to the main branch:

```bash
git push origin main
```

Or manually trigger the workflow:
1. Go to **Actions** → **Setup GitHub Labels**
2. Click **Run workflow**
3. Select branch and click **Run workflow**

### Manual Setup (Script)

Use the included setup script with GitHub CLI:

```bash
# From repository root
./scripts/setup-labels.sh

# Or specify a repository
./scripts/setup-labels.sh owner/repo
```

**Prerequisites:**
- [GitHub CLI](https://cli.github.com/) installed
- Authenticated with `gh auth login`
- Write access to the repository

## Label Workflow

### Orchestrator Workflow

1. User creates issue with **AI Orchestrator** template
2. Issue gets labels: `orchestrator`, `needs-planning`
3. Product Agent analyzes → removes `needs-planning`, adds `awaiting-approval`
4. User approves → removes `awaiting-approval`, adds `approved`, `creating-issues`
5. Issues created → removes `creating-issues`, adds `done`

### Agent Task Workflow

1. Issue created with agent label (e.g., `backend`)
2. Agent starts → adds `in-progress`
3. PR created → adds `in-review`
4. PR merged → removes `in-review`, adds `done`, closes issue

## Best Practices

### For Manual Issue Creation

When creating issues manually (not via orchestrator):

1. **Always include one agent label**: `backend`, `frontend`, `integration`, or `qa`
2. **Set priority**: Add `P0`, `P1`, `P2`, or `P3`
3. **Set initial status**: Usually `ready` or `blocked`
4. **Add type**: `feature`, `bug`, `enhancement`, or `documentation`

Example labels for a new feature: `frontend`, `P1`, `ready`, `feature`

### For Dependencies

When an issue depends on others:

1. Add `blocked` label
2. Reference blocking issues in description
3. Remove `blocked` and add `ready` when dependencies complete

### For Priority Changes

- Start with P2 (medium) unless urgent
- Only use P0 for critical production issues
- P1 for important features on current sprint
- P3 for nice-to-have backlog items

## Color Scheme

The color scheme follows a semantic pattern:

- **Purple** (`#8B5CF6`) - Orchestration and review
- **Red** (`#DC2626`, `#EF4444`) - High priority, critical, bugs
- **Orange** (`#FB923C`, `#F59E0B`, `#D97706`) - Warnings, medium-high priority
- **Yellow** (`#FCD34D`, `#FBBF24`) - Pending, in-progress
- **Green** (`#10B981`, `#059669`) - Success, approved, done
- **Blue** (`#3B82F6`, `#2563EB`) - Processing, medium priority, info
- **Indigo** (`#6366F1`) - Special processing states
- **Gray** (`#6B7280`) - Low priority, documentation

## Troubleshooting

### Labels Not Applied to New Issues

Check that your issue template includes the `labels:` field:

```yaml
labels: ["orchestrator", "needs-planning"]
```

### Workflow Not Triggering

Ensure workflows have proper label filters:

```yaml
if: contains(github.event.issue.labels.*.name, 'orchestrator')
```

### Script Fails

Common issues:
- GitHub CLI not installed: Install from https://cli.github.com/
- Not authenticated: Run `gh auth login`
- No permissions: Ensure you have write access to the repository

## Maintenance

### Updating Labels

To modify labels:

1. Edit `.github/workflows/setup-labels.yml`
2. Edit `scripts/setup-labels.sh`
3. Update this documentation
4. Run the workflow or script to apply changes

### Adding New Labels

When adding new labels:

1. Choose appropriate color from the color scheme
2. Write clear, concise description
3. Update all three files (workflow, script, docs)
4. Consider impact on existing workflows
5. Update issue templates if needed

## Related Documentation

- [AI Orchestrator Guide](AI_ORCHESTRATOR_GUIDE.md) - How to use the orchestration system
- [AI Team Guide](AI_TEAM_GUIDE.md) - Overview of AI agents
- [Automation Guide](AUTOMATION.md) - GitHub Actions workflows
- [Issue Templates](../.github/ISSUE_TEMPLATE/) - Available issue templates

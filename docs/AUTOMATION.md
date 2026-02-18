# 🤖 Automation Guide

## Overview

The AI Dev Team system is **fully autonomous**. Submit a product idea and watch as the system automatically:
1. Generates a comprehensive implementation plan
2. Creates all necessary issues with dependencies
3. Triggers agents to start work
4. Tracks progress and resolves dependencies
5. Reports status daily

**You only need to:** Submit an idea, approve the plan, and review PRs!

---

## 🏗️ Architecture

The automation system consists of 5 GitHub Actions workflows:

### 1. **Orchestrator Analyze** (`orchestrator-analyze.yml`)
**Purpose:** Automatically generate implementation plans

**Trigger:**
- Issue created with `orchestrator` + `needs-planning` labels
- Comment starting with `REVISE:` on awaiting-approval issues

**What it does:**
1. Extracts product idea from issue body
2. Calls Google Gemini API (or provides fallback template)
3. Generates comprehensive plan with:
   - Project overview
   - Features breakdown (P0/P1/P2)
   - User stories
   - Technical architecture
   - Agent task breakdown
   - Implementation timeline
   - Exact GitHub issues to create
4. Posts plan as comment
5. Updates labels: `needs-planning` → `awaiting-approval`

**Environment Variables:**
- `GOOGLE_API_KEY` (optional): Google Gemini API key for automated plan generation
- `GITHUB_TOKEN` (automatic): GitHub API access

**Fallback:** If no API key configured, provides instructions for manual planning

---

### 2. **Orchestrator Approval** (`orchestrator-approval.yml`)
**Purpose:** Handle user approval/revision/rejection commands

**Trigger:**
- Comment created on orchestrator issue with `awaiting-approval` label

**Commands:**
- `APPROVE` → Proceeds to issue creation
- `REVISE: [feedback]` → Regenerates plan with feedback
- `REJECT` → Closes orchestrator issue

**Authorization:**
- Only issue creator or repository collaborators can approve/revise/reject
- Other users receive a permission denied message

**What it does:**

**For APPROVE:**
1. Adds `approved` + `creating-issues` labels
2. Removes `awaiting-approval` label
3. Posts confirmation comment
4. Triggers issue creation workflow

**For REVISE:**
1. Posts acknowledgment comment
2. Keeps `awaiting-approval` label
3. Orchestrator-analyze workflow handles regeneration

**For REJECT:**
1. Adds `rejected` label
2. Closes issue
3. Posts thank you message

---

### 3. **Orchestrator Create Issues** (`orchestrator-create-issues.yml`)
**Purpose:** Automatically create all agent issues from approved plan

**Trigger:**
- `creating-issues` label added to orchestrator issue

**What it does:**
1. Extracts approved plan from issue comments
2. Parses the "GITHUB ISSUES TO CREATE" section
3. Creates issues sequentially:
   - Sets proper titles (e.g., `[BACKEND] User Authentication API`)
   - Adds descriptions with deliverables
   - Links to parent orchestrator issue
   - Maps dependencies between issues
   - Adds labels (agent type, P0/P1/P2, ready/blocked)
4. Posts summary to orchestrator issue:
   - List of all created issues
   - Grouped by agent type
   - Status indicators (ready/blocked)
5. Updates orchestrator:
   - Removes `creating-issues` label
   - Adds `in-progress` label
   - Updates title with progress: `[0/12]`

**Rate Limiting:**
- Adds 500ms delay between issue creations
- Handles GitHub API rate limits gracefully

---

### 4. **Agent Coordinator** (`agent-coordinator.yml`)
**Purpose:** Coordinate agent work and resolve dependencies

**Triggers:**
- Issue closed
- Issue labeled/unlabeled
- Pull request opened/closed

**What it does:**

**When an issue is closed:**
1. Finds all issues that depend on the closed issue
2. Checks if all dependencies are now resolved
3. For unblocked issues:
   - Removes `blocked` label
   - Adds `ready` label
   - Posts comment notifying the agent to start
4. Updates orchestrator progress counter

**When issue labeled as `ready`:**
1. Detects agent type (backend/frontend/integration/qa)
2. Posts agent-specific instructions
3. Tags @copilot to start implementation
4. Links to agent guidelines

**When PR is opened:**
1. Adds `in-review` label to linked issues
2. Removes `ready` label
3. Posts comment with PR link

**When PR is merged:**
1. Closes linked issues
2. Posts completion comment
3. Triggers dependency resolution

**Inter-agent communication:**
- Backend completes → notifies Integration and QA agents
- Integration completes → notifies Frontend and QA agents
- Frontend completes → notifies QA agent

---

### 5. **Orchestrator Progress** (`orchestrator-progress.yml`)
**Purpose:** Track and report progress on all active orchestrations

**Triggers:**
- **Scheduled:** Daily at 9 AM UTC (configurable)
- **Manual:** Can be triggered via workflow_dispatch
- **Events:** Issue/PR state changes

**What it does:**
1. Finds all orchestrator issues with `in-progress` label
2. For each orchestrator:
   - Queries all linked child issues
   - Calculates statistics:
     - Total issues
     - Completed count and percentage
     - In review count
     - Ready to start count
     - Blocked count
   - Determines overall status (On Track/At Risk/Blocked)
   - Lists recent activity (last 24 hours)
   - Shows progress by agent type
   - Identifies next actions
3. Posts comprehensive progress report as comment
4. Updates orchestrator issue title with progress

**Progress Report Example:**
```markdown
## 📊 Progress Report - 2024-01-15

**Overall:** 🟢 On Track
Everything is progressing smoothly.

### Summary
| Status      | Count | Percentage |
|-------------|-------|------------|
| ✅ Completed | 5     | 42%        |
| 🔄 In Review | 2     | 17%        |
| 🟢 Ready     | 2     | 17%        |
| ⏳ In Progress | 1   | 8%         |
| 🚫 Blocked   | 2     | 17%        |
| **Total**   | **12**| **100%**   |

**Progress:** [████████░░░░░░░░░░░░] 42%

### 📈 Recent Activity (Last 24 Hours)
...
```

---

## 🔄 Complete Workflow

### Step 1: Submit Idea
```bash
./scripts/orchestrate.sh
# Select option 1
# Enter your product idea
```

**What happens:**
1. Creates orchestrator issue with labels `orchestrator,needs-planning`
2. **Orchestrator Analyze** workflow triggers (within seconds)
3. Plan generated and posted as comment (1-2 minutes)
4. Label changes: `needs-planning` → `awaiting-approval`

### Step 2: Review & Approve
You review the plan in the issue comments.

**Option A: Approve**
```bash
Comment: APPROVE
```

**What happens:**
1. **Orchestrator Approval** workflow triggers immediately
2. Labels: `awaiting-approval` → `approved,creating-issues`
3. **Orchestrator Create Issues** workflow triggers
4. All agent issues created (1-2 minutes)
5. Label changes: `creating-issues` → `in-progress`

**Option B: Request Revision**
```bash
Comment: REVISE: Make it simpler, focus only on core features
```

**What happens:**
1. **Orchestrator Analyze** workflow triggers again
2. Revised plan generated incorporating feedback
3. Posted as new comment
4. Stays in `awaiting-approval` state

**Option C: Cancel**
```bash
Comment: REJECT
```

**What happens:**
1. **Orchestrator Approval** workflow triggers
2. Issue closed
3. Label added: `rejected`

### Step 3: Automatic Execution
After approval, everything is automated!

**Agent work cycle:**
1. Issues with no dependencies get `ready` label
2. **Agent Coordinator** triggers and posts agent instructions
3. Agent implements the code
4. Agent opens PR
5. **Agent Coordinator** adds `in-review` label
6. You review and merge PR
7. **Agent Coordinator** closes issue
8. **Agent Coordinator** unblocks dependent issues
9. Cycle repeats for next issues

**Progress tracking:**
- **Orchestrator Progress** runs daily at 9 AM UTC
- Posts progress report to orchestrator issue
- Updates orchestrator title: `[5/12]` → `[6/12]`

### Step 4: Completion
When all issues are closed:
1. **Agent Coordinator** posts completion message
2. Orchestrator title shows: `[12/12]`
3. **Orchestrator Progress** confirms 100% complete
4. You test, deploy, and close orchestrator issue

---

## 🛠️ Configuration

### Required Secrets

#### `GOOGLE_API_KEY` (Recommended)
For automated plan generation using Google Gemini API.

**To add:**
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key (starts with `AIza...`)
4. Go to repository Settings
5. Secrets and variables → Actions
6. New repository secret
7. Name: `GOOGLE_API_KEY`
8. Value: Your Google Gemini API key

**Via GitHub CLI:**
```bash
gh secret set GOOGLE_API_KEY --repo garantor/ai-dev-team
# Paste your API key when prompted
```

**Cost:** Free tier includes 60 requests per minute

**Verify Setup:**
```bash
# Test your API key locally
export GOOGLE_API_KEY='your-api-key'
./scripts/validate-api-key.sh
```

**Without this secret:**
- Workflows still run
- Provides manual planning instructions
- You copy/paste from ChatGPT/Claude yourself

**Alternative: OpenAI API**
If you prefer OpenAI instead:
1. Get API key from https://platform.openai.com/api-keys
2. Modify `.github/workflows/orchestrator-analyze.yml` to use OpenAI API
3. Add `OPENAI_API_KEY` secret instead

#### `GITHUB_TOKEN` (Automatic)
Automatically provided by GitHub Actions. No configuration needed.

---

### Workflow Customization

#### Change Schedule for Progress Reports
Edit `.github/workflows/orchestrator-progress.yml`:

```yaml
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
    # Change to: '0 */6 * * *'  # Every 6 hours
    # Or: '0 9 * * 1-5'  # Weekdays only at 9 AM
```

#### Change AI Model
Edit `.github/workflows/orchestrator-analyze.yml`:

```bash
# Current: Google Gemini Pro
RESPONSE=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GOOGLE_API_KEY" ...)

# To use other Gemini models:
# gemini-pro-vision - For image analysis
# gemini-ultra - Most capable (when available)
```

**Generation Config:**
```yaml
generationConfig: {
  temperature: 0.7,      # 0.0-1.0: Lower = more focused, Higher = more creative
  topK: 40,              # Consider top 40 tokens
  topP: 0.95,            # Nucleus sampling
  maxOutputTokens: 8192  # Max response length
}
```

#### Adjust Rate Limiting
Edit `.github/workflows/orchestrator-create-issues.yml`:

```javascript
await new Promise(resolve => setTimeout(resolve, 500));
// Change to: 1000 for slower but safer
// Or: 200 for faster but may hit rate limits
```

---

## 🧪 Testing

### Test Orchestrator Analyze
1. Create issue with `orchestrator,needs-planning` labels
2. Check Actions tab for "Orchestrator - Analyze and Generate Plan"
3. Verify plan posted as comment within 2 minutes
4. Verify label changed to `awaiting-approval`

### Test Approval
1. Comment `APPROVE` on awaiting-approval issue
2. Check Actions tab for "Orchestrator - Handle Approval"
3. Verify confirmation comment posted
4. Verify labels: `approved,creating-issues` added

### Test Issue Creation
1. After approval, wait for creating-issues workflow
2. Check Actions tab for "Orchestrator - Create Issues"
3. Verify all child issues created
4. Verify summary posted to orchestrator
5. Verify orchestrator title updated: `[0/N]`

### Test Agent Coordinator
1. Close one of the child issues
2. Check Actions tab for "Agent Coordinator"
3. Verify dependent issues unblocked
4. Verify orchestrator progress updated: `[1/N]`

### Test Progress Tracking
1. Manually trigger from Actions tab
2. Or wait for scheduled run
3. Verify progress report posted
4. Verify report accuracy

---

## 🐛 Troubleshooting

### Plan not generated automatically

**Symptoms:** Issue created but no plan comment after 5 minutes

**Causes:**
1. `GOOGLE_API_KEY` not configured
2. Workflow disabled
3. API error or quota exceeded

**Solutions:**
1. Check Actions tab for workflow runs and errors
2. Configure `GOOGLE_API_KEY` in repository secrets
   - Get key from https://makersuite.google.com/app/apikey
3. Test key: `GOOGLE_API_KEY='your-key' ./scripts/validate-api-key.sh`
4. Check workflow logs for detailed error messages
5. Verify Gemini API is enabled for your project
6. Use manual planning fallback (comment with ChatGPT response)

### Issues not created after approval

**Symptoms:** APPROVE comment posted but no issues created

**Causes:**
1. Plan format not parseable
2. Workflow failed
3. Rate limiting

**Solutions:**
1. Check Actions tab for "Orchestrator - Create Issues" workflow
2. View logs for parsing errors
3. Manually create issues from plan using templates

### Dependencies not resolving

**Symptoms:** Issue closed but dependent issues still blocked

**Causes:**
1. Dependency format not recognized
2. Workflow didn't trigger
3. Issue body doesn't match expected format

**Solutions:**
1. Check issue body has: `Depends on: #X, #Y`
2. Manually remove `blocked` label and add `ready` label
3. Check Actions tab for "Agent Coordinator" workflow errors

### Progress not updating

**Symptoms:** Orchestrator title still shows old progress

**Causes:**
1. Agent coordinator didn't trigger
2. Parent issue reference missing

**Solutions:**
1. Check child issue body has: `Parent Issue: #X`
2. Manually trigger progress workflow from Actions tab
3. Check workflow logs

---

## 📊 Monitoring

### View Workflow Runs
1. Go to Actions tab in repository
2. Filter by workflow name
3. View logs for any failures

### Check Orchestrator Health
```bash
./scripts/orchestrate.sh
# Select option 5 (List all orchestrators)
```

### View Individual Status
```bash
./scripts/orchestrate.sh
# Select option 2 (Check status)
# Enter orchestrator issue number
```

### Daily Progress Reports
- Automatically posted to orchestrator issues
- Viewable via option 6 in script

---

## 🔐 Security

### API Keys
- Store only in GitHub Secrets (never in code)
- Use separate keys for development/production
- Rotate keys periodically

### Permissions
- Workflows use `GITHUB_TOKEN` with minimal permissions
- Only write access to issues
- No access to code or secrets

### Authorization
- Only issue creator and collaborators can approve
- Others receive permission denied
- All commands logged in issue comments

---

## 🚀 Best Practices

### For Users

**DO:**
✅ Provide clear, specific product ideas
✅ Review plans thoroughly before approving
✅ Request revisions if plan doesn't match vision
✅ Test PRs before merging
✅ Monitor progress reports

**DON'T:**
❌ Approve without reading the plan
❌ Skip PR reviews
❌ Merge failing tests
❌ Ignore blocked issues
❌ Close orchestrator issues prematurely

### For Administrators

**DO:**
✅ Configure `GOOGLE_API_KEY` for best experience
✅ Monitor workflow execution regularly
✅ Review failed workflow runs
✅ Keep workflows up to date
✅ Test workflows after updates

**DON'T:**
❌ Expose API keys in logs
❌ Disable workflows without reason
❌ Ignore rate limiting errors
❌ Skip testing after changes

---

## 📈 Metrics

The system tracks:
- **Time to plan generation:** Usually 1-2 minutes
- **Time to issue creation:** Usually 1-2 minutes for 10-15 issues
- **Issues created per orchestrator:** Average 8-12
- **Completion rate:** Track in progress reports
- **Automation success rate:** Monitor in Actions tab

---

## 🆘 Support

### Need Help?

1. **Check this guide** for common issues
2. **View workflow logs** in Actions tab
3. **Create an issue** with `bug` label
4. **Use manual fallback** if automation fails

### Manual Fallback

If automation isn't working:
1. Use ChatGPT/Claude for plan generation
2. Copy prompt from `docs/AI_ORCHESTRATOR_GUIDE.md`
3. Post AI response as comment
4. Create issues manually using templates
5. Use agent instructions from `.github/copilot-instructions.md`

---

## 🔄 Updates

This automation system is continuously improved. Check:
- GitHub releases for new versions
- Actions tab for workflow updates
- This document for latest best practices

---

## 📚 Additional Resources

- [AI Orchestrator Guide](./AI_ORCHESTRATOR_GUIDE.md) - Manual orchestration guide
- [AI Team Guide](./AI_TEAM_GUIDE.md) - How agents work together
- [Issue Templates](../.github/ISSUE_TEMPLATE/) - All available templates
- [Copilot Instructions](../.github/copilot-instructions.md) - Agent behaviors

---

**Questions?** Create an issue with the `question` label!

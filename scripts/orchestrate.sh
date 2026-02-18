#!/bin/bash

# AI Orchestrator Script
# This script helps you use AI to orchestrate the entire development process

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     AI Dev Team Orchestrator          ║${NC}"
echo -e "${BLUE}║        Fully Autonomous Edition        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Default repo (can be overridden)
REPO="garantor/ai-dev-team"

# Function to create orchestrator issue
create_orchestrator_issue() {
    echo -e "${YELLOW}What do you want to build?${NC}"
    echo -e "${BLUE}(Describe your idea in 1-3 sentences)${NC}"
    echo ""
    read -p "Your idea: " IDEA
    
    if [ -z "$IDEA" ]; then
        echo -e "${RED}Error: Idea cannot be empty${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${YELLOW}Any additional context? (Optional, press Enter to skip)${NC}"
    read -p "Context: " CONTEXT
    
    echo ""
    echo -e "${YELLOW}Priority?${NC}"
    echo "1) 🔥 Urgent (start immediately)"
    echo "2) 🚀 High (this week)"
    echo "3) 📅 Medium (this month)"
    echo "4) 💭 Low (exploratory)"
    read -p "Select (1-4): " PRIORITY_NUM
    
    case $PRIORITY_NUM in
        1) PRIORITY="🔥 Urgent" ;; 
        2) PRIORITY="🚀 High" ;; 
        3) PRIORITY="📅 Medium" ;; 
        4) PRIORITY="💭 Low" ;; 
        *) PRIORITY="📅 Medium" ;;
    esac
    
    # Create the issue body
    ISSUE_BODY="### 💡 Your Product Idea

$IDEA

### 📝 Additional Context (Optional)

${CONTEXT:-None}

### ⚡ Priority

$PRIORITY

---

**Status:** ⏳ Waiting for automated Product Agent analysis

**What happens next:**
1. 🤖 The automation workflow will generate a comprehensive implementation plan (1-2 minutes)
2. 📝 You'll receive the plan as a comment on this issue
3. ✅ Review and comment \`APPROVE\` to create all agent issues automatically
4. 🚀 Agents will start working automatically as dependencies are met"
    
    echo ""
    echo -e "${GREEN}Creating orchestrator issue...${NC}"
    
    ISSUE_URL=$(gh issue create \
        --title "[ORCHESTRATE] $IDEA" \
        --body "$ISSUE_BODY" \
        --label "orchestrator,needs-planning" \
        --repo $REPO 2>&1)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Issue created: $ISSUE_URL${NC}"
        echo ""
        echo -e "${BLUE}🎉 Automation in progress!${NC}"
        echo ""
        echo -e "${CYAN}What's happening now:${NC}"
        echo "1. GitHub Actions workflow is triggered"
        echo "2. Plan generation starts automatically"
        echo "3. Plan will be posted as a comment (usually 1-2 minutes)"
        echo ""
        echo -e "${YELLOW}Next steps:${NC}"
        echo "1. Watch for the plan comment on the issue"
        echo "2. Review the comprehensive implementation plan"
        echo "3. Comment 'APPROVE' to proceed with automatic issue creation"
        echo "4. Or comment 'REVISE: [feedback]' to iterate"
        echo ""
        echo -e "${GREEN}View your issue: $ISSUE_URL${NC}"
    else
        echo -e "${RED}✗ Failed to create issue: $ISSUE_URL${NC}"
        return 1
    fi
}

# Function to check status of orchestrator issue
check_status() {
    echo -e "${YELLOW}Enter the orchestrator issue number:${NC}"
    read -p "Issue #: " ISSUE_NUM
    
    if [ -z "$ISSUE_NUM" ]; then
        echo -e "${RED}Error: Issue number required${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${GREEN}Fetching status for issue #$ISSUE_NUM...${NC}"
    echo ""
    
    # Get issue details
    ISSUE_DATA=$(gh issue view $ISSUE_NUM --json title,state,labels,comments,body --repo $REPO 2>&1)
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to fetch issue: $ISSUE_DATA${NC}"
        return 1
    fi
    
    # Parse issue data
    TITLE=$(echo "$ISSUE_DATA" | jq -r '.title')
    STATE=$(echo "$ISSUE_DATA" | jq -r '.state')
    LABELS=$(echo "$ISSUE_DATA" | jq -r '.labels[].name' | tr '\n' ', ' | sed 's/,$//')
    COMMENT_COUNT=$(echo "$ISSUE_DATA" | jq -r '.comments | length')
    
    # Display status
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}📊 Orchestrator Issue #$ISSUE_NUM${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}Title:${NC} $TITLE"
    echo -e "${BLUE}State:${NC} $STATE"
    echo -e "${BLUE}Labels:${NC} $LABELS"
    echo -e "${BLUE}Comments:${NC} $COMMENT_COUNT"
    echo ""
    
    # Determine current phase
    if echo "$LABELS" | grep -q "needs-planning"; then
        echo -e "${YELLOW}📝 Status: Awaiting Plan Generation${NC}"
        echo "The automation is generating a comprehensive plan."
        echo "This usually takes 1-2 minutes."
    elif echo "$LABELS" | grep -q "awaiting-approval"; then
        echo -e "${YELLOW}⏳ Status: Awaiting Your Approval${NC}"
        echo "A plan has been generated. Please review it in the issue comments."
        echo ""
        echo -e "${GREEN}Actions you can take:${NC}"
        echo "  • Comment 'APPROVE' to proceed with issue creation"
        echo "  • Comment 'REVISE: [feedback]' to request changes"
        echo "  • Comment 'REJECT' to cancel"
    elif echo "$LABELS" | grep -q "creating-issues"; then
        echo -e "${CYAN}🔄 Status: Creating Issues${NC}"
        echo "The automation is creating all agent issues."
        echo "This usually takes 1-2 minutes."
    elif echo "$LABELS" | grep -q "in-progress"; then
        echo -e "${GREEN}✨ Status: In Progress${NC}"
        echo "Issues have been created and agents are working!"
        echo ""
        # Try to extract progress from title
        if [[ "$TITLE" =~ \[([0-9]+)/([0-9]+)\] ]]; then
            COMPLETED="${BASH_REMATCH[1]}"
            TOTAL="${BASH_REMATCH[2]}"
            PERCENT=$((COMPLETED * 100 / TOTAL))
            echo -e "${BLUE}Progress:${NC} $COMPLETED/$TOTAL issues completed ($PERCENT%)"
            
            # Progress bar
            FILLED=$((PERCENT / 5))
            EMPTY=$((20 - FILLED))
            BAR=$(printf '█%.0s' $(seq 1 $FILLED))$(printf '░%.0s' $(seq 1 $EMPTY))
            echo "[$BAR] $PERCENT%"
        fi
    elif echo "$LABELS" | grep -q "approved"; then
        echo -e "${GREEN}✅ Status: Approved${NC}"
        echo "Plan approved and issues are being created."
    elif echo "$LABELS" | grep -q "rejected"; then
        echo -e "${RED}❌ Status: Rejected${NC}"
        echo "This orchestration was cancelled."
    else
        echo -e "${YELLOW}Status: Unknown${NC}"
        echo "Labels: $LABELS"
    fi
    
    echo ""
    echo -e "${CYAN}View issue: ${NC}https://github.com/$REPO/issues/$ISSUE_NUM"
    echo ""
}

# Function to list all orchestrator issues
list_orchestrators() {
    echo -e "${GREEN}Fetching all orchestrator issues...${NC}"
    echo ""
    
    # Get all orchestrator issues
    gh issue list --label "orchestrator" --repo $REPO --limit 50 \
        --json number,title,state,labels,createdAt \
        --template '{{range .}}{{printf "#%-5d" .number}}{{if eq .state "OPEN"}}🟢{{else}}⚫{{end}} {{.title}}
  Labels: {{range .labels}}{{.name}}, {{end}}
  Created: {{.createdAt}}
{{end}}'
    
    echo ""
}

# Function to approve orchestrator
approve_orchestrator() {
    echo -e "${YELLOW}Enter the orchestrator issue number to approve:${NC}"
    read -p "Issue #: " ISSUE_NUM
    
    if [ -z "$ISSUE_NUM" ]; then
        echo -e "${RED}Error: Issue number required${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${GREEN}Posting APPROVE comment to issue #$ISSUE_NUM...${NC}"
    
    gh issue comment $ISSUE_NUM --body "APPROVE" --repo $REPO
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Approval posted successfully${NC}"
        echo ""
        echo -e "${CYAN}What happens next:${NC}"
        echo "1. The approval workflow will process your command"
        echo "2. All agent issues will be created automatically (1-2 minutes)"
        echo "3. Issues will be linked with proper dependencies"
        echo "4. Agents will be notified to start work"
        echo ""
        echo -e "${YELLOW}Track progress with option 2 (Check status)${NC}"
    else
        echo -e "${RED}✗ Failed to post approval${NC}"
        return 1
    fi
}

# Function to request revision
request_revision() {
    echo -e "${YELLOW}Enter the orchestrator issue number:${NC}"
    read -p "Issue #: " ISSUE_NUM
    
    if [ -z "$ISSUE_NUM" ]; then
        echo -e "${RED}Error: Issue number required${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${YELLOW}What revisions would you like?${NC}"
    echo -e "${BLUE}(Be specific about what should change)${NC}"
    echo ""
    read -p "Revision feedback: " FEEDBACK
    
    if [ -z "$FEEDBACK" ]; then
        echo -e "${RED}Error: Feedback cannot be empty${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${GREEN}Posting revision request to issue #$ISSUE_NUM...${NC}"
    
    gh issue comment $ISSUE_NUM --body "REVISE: $FEEDBACK" --repo $REPO
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Revision request posted successfully${NC}"
        echo ""
        echo -e "${CYAN}What happens next:${NC}"
        echo "1. The orchestrator will regenerate the plan"
        echo "2. A new revised plan will be posted (1-2 minutes)"
        echo "3. Review the new plan and approve or request more changes"
        echo ""
        echo -e "${YELLOW}View the issue to see the revised plan${NC}"
    else
        echo -e "${RED}✗ Failed to post revision request${NC}"
        return 1
    fi
}

# Function to cancel orchestrator
cancel_orchestrator() {
    echo -e "${YELLOW}Enter the orchestrator issue number to cancel:${NC}"
    read -p "Issue #: " ISSUE_NUM
    
    if [ -z "$ISSUE_NUM" ]; then
        echo -e "${RED}Error: Issue number required${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${RED}Are you sure you want to cancel orchestrator #$ISSUE_NUM?${NC}"
    read -p "Type 'yes' to confirm: " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        echo -e "${YELLOW}Cancellation aborted${NC}"
        return 0
    fi
    
    echo ""
    echo -e "${GREEN}Posting REJECT comment to issue #$ISSUE_NUM...${NC}"
    
    gh issue comment $ISSUE_NUM --body "REJECT" --repo $REPO
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Cancellation posted successfully${NC}"
        echo ""
        echo -e "${CYAN}The orchestrator issue will be closed automatically${NC}"
    else
        echo -e "${RED}✗ Failed to post cancellation${NC}"
        return 1
    fi
}

# Function to view progress report
view_progress() {
    echo -e "${YELLOW}Enter the orchestrator issue number:${NC}"
    read -p "Issue #: " ISSUE_NUM
    
    if [ -z "$ISSUE_NUM" ]; then
        echo -e "${RED}Error: Issue number required${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${GREEN}Fetching latest progress report...${NC}"
    echo ""
    
    # Get the most recent progress report comment
    gh issue view $ISSUE_NUM --repo $REPO --comments | grep -A 50 "Progress Report" | head -60
    
    echo ""
}

# Function to get product agent analysis using AI (deprecated but kept for compatibility)
analyze_with_ai() {
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}⚠️  This function is now automated!${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""
    echo "When you create an orchestrator issue using option 1,"
    echo "the plan is automatically generated by GitHub Actions."
    echo ""
    echo "No manual AI prompting needed! 🎉"
    echo ""
    echo -e "${BLUE}If automation is not working:${NC}"
    echo "1. Check if OpenAI API key is configured in repo secrets"
    echo "2. View the issue to see workflow status"
    echo "3. Or use manual ChatGPT method (see docs)"
    echo ""
}

# Function to approve and create issues (deprecated)
approve_and_create() {
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}⚠️  This function is now automated!${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""
    echo "Use option 3 (Approve a plan) instead."
    echo "Just provide the issue number and the approval"
    echo "will be posted automatically!"
    echo ""
}

# Main menu
main_menu() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║          What would you like to do?    ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo "  ${GREEN}1)${NC} 🚀 Submit a new product idea"
    echo "  ${GREEN}2)${NC} 📊 Check orchestrator status"
    echo "  ${GREEN}3)${NC} ✅ Approve a plan"
    echo "  ${GREEN}4)${NC} 🔄 Request plan revisions"
    echo "  ${GREEN}5)${NC} 📋 List all orchestrators"
    echo "  ${GREEN}6)${NC} 📈 View progress report"
    echo "  ${GREEN}7)${NC} ❌ Cancel an orchestrator"
    echo "  ${GREEN}8)${NC} 🚪 Exit"
    echo ""
    read -p "Select (1-8): " choice
    
    case $choice in
        1) create_orchestrator_issue ;;
        2) check_status ;;
        3) approve_orchestrator ;;
        4) request_revision ;;
        5) list_orchestrators ;;
        6) view_progress ;;
        7) cancel_orchestrator ;;
        8) 
            echo ""
            echo -e "${GREEN}Thank you for using AI Dev Team Orchestrator!${NC}"
            echo -e "${BLUE}🚀 Happy building!${NC}"
            echo ""
            exit 0
            ;;
        *) 
            echo -e "${RED}Invalid option. Please select 1-8.${NC}"
            sleep 1
            main_menu
            ;;
    esac
    
    # Loop back to menu
    echo ""
    read -p "Press Enter to continue..."
    main_menu
}

# Start the script
main_menu

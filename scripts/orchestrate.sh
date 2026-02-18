#!/bin/bash

# AI Orchestrator Script
# This script helps you use AI to orchestrate the entire development process

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     AI Dev Team Orchestrator          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Function to create orchestrator issue
create_orchestrator_issue() {
    echo -e "${YELLOW}What do you want to build?${NC}"
    echo -e "${BLUE}(Describe your idea in 1-3 sentences)${NC}"
echo ""
    read -p "Your idea: " IDEA
    
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
    
    # Create the issue
    ISSUE_BODY="## 💡 Product Idea\n\n$IDEA\n\n## 📝 Additional Context\n\n"+"${CONTEXT:-None}\n\n## ⚡ Priority\n\n$PRIORITY\n\n---\n\n**Status:** ⏳ Waiting for Product Agent analysis\n\n@copilot Please analyze this idea and create a detailed implementation plan following the Product Agent template."
    
    echo ""
    echo -e "${GREEN}Creating orchestrator issue...${NC}"
    
    ISSUE_URL=$(gh issue create \
        --title "[ORCHESTRATE] $IDEA" \
        --body "$ISSUE_BODY" \
        --label "orchestrator,needs-planning" \
        --repo garantor/ai-dev-team)
    
    echo -e "${GREEN}✓ Issue created: $ISSUE_URL${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Wait for Product Agent to analyze (check issue comments)"
    echo "2. Review the implementation plan"
    echo "3. Comment 'APPROVE' to proceed"
    echo ""
}

# Function to get product agent analysis using AI
analyze_with_ai() {
    echo -e "${YELLOW}Enter the issue number you want to analyze:${NC}"
    read -p "Issue #: " ISSUE_NUM
    
    echo -e "${GREEN}Fetching issue details...${NC}"
    ISSUE_DATA=$(gh issue view $ISSUE_NUM --json title,body --repo garantor/ai-dev-team)
    
echo ""
    echo -e "${BLUE}=== Generating Product Agent Analysis ===${NC}"
    echo ""
    echo "Copy this to ChatGPT/Claude/Copilot:" 
    echo "" 
echo "---" 
    cat << 'EOF'
You are the Product Agent AI for an automated development team.

Analyze the following product idea and create a COMPLETE implementation plan.

Provide:
1. PROJECT OVERVIEW (summary, users, value prop)
2. FEATURES BREAKDOWN (P0/P1/P2 prioritization)
3. USER STORIES (with acceptance criteria)
4. TECHNICAL ARCHITECTURE (tech stack, system design, database schema)
5. AGENT TASK BREAKDOWN (specific tasks for Backend, Integration, Frontend, QA agents)
6. IMPLEMENTATION TIMELINE (phased approach)
7. GITHUB ISSUES TO CREATE (exact titles, descriptions, dependencies, labels)

Format as structured markdown that can be directly used to create GitHub issues.

PRODUCT IDEA:
EOF
    echo "$ISSUE_DATA"
    echo "---" 
echo "" 
echo -e "${YELLOW}After getting the AI response:${NC}"
    echo "1. Copy the full response"
    echo "2. Post it as a comment on issue #$ISSUE_NUM"
    echo "3. Tag the requester for approval"
    echo ""
}

# Function to approve and create issues
approve_and_create() {
    echo -e "${YELLOW}Enter the orchestrator issue number to approve:${NC}"
    read -p "Issue #: " ISSUE_NUM
    
echo -e "${YELLOW}Paste the Product Agent's plan (press Ctrl+D when done):${NC}"
    PLAN=$(cat)
    
echo ""
    echo -e "${GREEN}Plan received. Creating issues...${NC}"
    echo ""
    
    # Extract and create issues (simplified version - you'd parse the markdown in practice)
    echo -e "${YELLOW}Manual Issue Creation:${NC}"
    echo "The plan has been saved. Please create issues manually from the plan."
    echo "Or use the GitHub web interface to create issues from the templates."
    echo "" 
echo -e "${BLUE}Quick commands:${NC}"
    echo "gh issue create --template 02-backend-task.yml"
    echo "gh issue create --template 03-frontend-task.yml"
    echo "gh issue create --template 04-integration-task.yml"
    echo "gh issue create --template 05-qa-task.yml"
    echo ""
}

# Main menu
main_menu() {
    echo ""
    echo "What would you like to do?"
    echo ""
    echo "1) 🚀 Submit a new idea (create orchestrator issue)"
    echo "2) 🤖 Generate Product Agent analysis for existing issue"
    echo "3) ✅ Approve plan and create agent issues"
    echo "4) 📊 Check status of all orchestrator issues"
    echo "5) ❌ Exit"
    echo ""
    read -p "Select (1-5): " choice
    
    case $choice in
        1) create_orchestrator_issue ;;
        2) analyze_with_ai ;;
        3) approve_and_create ;;
        4) 
            echo -e "${GREEN}Fetching orchestrator issues...${NC}"
            gh issue list --label "orchestrator" --repo garantor/ai-dev-team
            ;;
        5) 
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *) 
            echo -e "${RED}Invalid option${NC}"
            main_menu
            ;;
    esac
    
    # Loop back to menu
    read -p "Press Enter to continue..."
    main_menu
}

# Start the script
main_menu

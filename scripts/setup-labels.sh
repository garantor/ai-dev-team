#!/bin/bash

# Setup Labels Script
# Creates all necessary labels for AI Dev Team orchestration

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     AI Dev Team - Label Setup         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

REPO="garantor/ai-dev-team"

echo -e "${YELLOW}Creating labels for repository: $REPO${NC}"
echo ""

# Function to create or update label
create_label() {
    local name=$1
    local color=$2
    local description=$3
    
    # Check if label exists
    if gh label list --repo $REPO | grep -q "^$name"; then
        echo -e "${YELLOW}Updating: $name${NC}"
        gh label edit "$name" --repo $REPO --color "$color" --description "$description" 2>/dev/null || true
    else
        echo -e "${GREEN}Creating: $name${NC}"
        gh label create "$name" --repo $REPO --color "$color" --description "$description"
    fi
}

# Orchestrator Labels
echo -e "${BLUE}Creating Orchestrator labels...${NC}"
create_label "orchestrator" "8B5CF6" "AI Orchestrator issue - automated product planning"
create_label "needs-planning" "FCD34D" "Awaiting Product Agent analysis"
create_label "awaiting-approval" "FB923C" "Plan generated, waiting for user approval"
create_label "approved" "10B981" "Plan approved, ready for implementation"
create_label "processing" "3B82F6" "Currently being processed by automation"
create_label "creating-issues" "6366F1" "Automatically creating agent issues"
create_label "rejected" "EF4444" "Request rejected by user"

# Agent Labels
echo -e "${BLUE}Creating Agent labels...${NC}"
create_label "product" "8B5CF6" "Product Agent - requirements and planning"
create_label "backend" "DC2626" "Backend Agent - API and server-side logic"
create_label "frontend" "2563EB" "Frontend Agent - UI components and client-side"
create_label "integration" "059669" "Integration Agent - API clients and contracts"
create_label "qa" "D97706" "QA Agent - testing and quality assurance"

# Priority Labels
echo -e "${BLUE}Creating Priority labels...${NC}"
create_label "P0" "DC2626" "🔥 Critical priority - start immediately"
create_label "P1" "F59E0B" "🚀 High priority - this week"
create_label "P2" "3B82F6" "📅 Medium priority - this month"
create_label "P3" "6B7280" "💭 Low priority - exploratory"

# Status Labels
echo -e "${BLUE}Creating Status labels...${NC}"
create_label "blocked" "DC2626" "Blocked by dependencies"
create_label "ready" "10B981" "Ready to start work"
create_label "in-progress" "FBBF24" "Work in progress"
create_label "in-review" "8B5CF6" "In code review"
create_label "done" "059669" "Completed"

# Type Labels
echo -e "${BLUE}Creating Type labels...${NC}"
create_label "feature" "10B981" "New feature request"
create_label "bug" "DC2626" "Bug report"
create_label "enhancement" "3B82F6" "Enhancement to existing feature"
create_label "documentation" "6B7280" "Documentation updates"

echo ""
echo -e "${GREEN}✅ All labels created successfully!${NC}"
echo ""
echo -e "${BLUE}View labels at: https://github.com/$REPO/labels${NC}"

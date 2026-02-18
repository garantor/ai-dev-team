#!/bin/bash

# GitHub Labels Setup Script
# This script creates all necessary labels for the AI Dev Team orchestration system
# Usage: ./scripts/setup-labels.sh [owner/repo]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

# Get repository (use argument or detect from current directory)
if [ -n "$1" ]; then
    REPO="$1"
else
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
    if [ -z "$REPO" ]; then
        echo -e "${RED}Error: Could not detect repository${NC}"
        echo "Usage: $0 [owner/repo]"
        echo "Example: $0 garantor/ai-dev-team"
        exit 1
    fi
fi

echo -e "${BLUE}Setting up labels for repository: $REPO${NC}"
echo ""

# Function to create or update a label
create_or_update_label() {
    local name="$1"
    local color="$2"
    local description="$3"
    
    # Check if label exists
    if gh label list -R "$REPO" | grep -q "^$name"; then
        # Update existing label
        if gh label edit "$name" -R "$REPO" --color "$color" --description "$description" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Updated: $name"
        else
            echo -e "${YELLOW}⚠${NC} Could not update: $name"
        fi
    else
        # Create new label
        if gh label create "$name" -R "$REPO" --color "$color" --description "$description" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} Created: $name"
        else
            echo -e "${RED}✗${NC} Failed to create: $name"
        fi
    fi
}

# Orchestrator Labels
echo -e "${BLUE}Creating Orchestrator Labels...${NC}"
create_or_update_label "orchestrator" "8B5CF6" "AI Orchestrator issue for automated planning"
create_or_update_label "needs-planning" "FCD34D" "Awaiting Product Agent analysis"
create_or_update_label "awaiting-approval" "FB923C" "Plan generated, waiting for approval"
create_or_update_label "approved" "10B981" "Plan approved, ready for implementation"
create_or_update_label "processing" "3B82F6" "Currently being processed"
create_or_update_label "creating-issues" "6366F1" "Creating agent issues"
create_or_update_label "rejected" "EF4444" "Request rejected"

# Agent Labels
echo ""
echo -e "${BLUE}Creating Agent Labels...${NC}"
create_or_update_label "product" "8B5CF6" "Product Agent tasks"
create_or_update_label "backend" "DC2626" "Backend Agent tasks"
create_or_update_label "frontend" "2563EB" "Frontend Agent tasks"
create_or_update_label "integration" "059669" "Integration Agent tasks"
create_or_update_label "qa" "D97706" "QA Agent tasks"

# Priority Labels
echo ""
echo -e "${BLUE}Creating Priority Labels...${NC}"
create_or_update_label "P0" "DC2626" "Critical priority"
create_or_update_label "P1" "F59E0B" "High priority"
create_or_update_label "P2" "3B82F6" "Medium priority"
create_or_update_label "P3" "6B7280" "Low priority"

# Status Labels
echo ""
echo -e "${BLUE}Creating Status Labels...${NC}"
create_or_update_label "blocked" "DC2626" "Blocked by dependencies"
create_or_update_label "ready" "10B981" "Ready to start"
create_or_update_label "in-progress" "FBBF24" "Work in progress"
create_or_update_label "in-review" "8B5CF6" "In code review"
create_or_update_label "done" "059669" "Completed"

# Type Labels
echo ""
echo -e "${BLUE}Creating Type Labels...${NC}"
create_or_update_label "feature" "10B981" "New feature"
create_or_update_label "bug" "DC2626" "Bug report"
create_or_update_label "enhancement" "3B82F6" "Enhancement"
create_or_update_label "documentation" "6B7280" "Documentation"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Label setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Total labels created/updated: 25"
echo ""
echo "Label categories:"
echo "  - Orchestrator Labels: 7"
echo "  - Agent Labels: 5"
echo "  - Priority Labels: 4"
echo "  - Status Labels: 5"
echo "  - Type Labels: 4"
echo ""
echo "View all labels at:"
echo "  https://github.com/$REPO/labels"

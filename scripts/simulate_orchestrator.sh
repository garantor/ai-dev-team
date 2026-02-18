#!/bin/bash

# Load environment variables from .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

if [ -z "$GOOGLE_API_KEY" ]; then
    echo -e "${RED}Error: GOOGLE_API_KEY not found in .env or environment${NC}"
    exit 1
fi

echo -e "${YELLOW}AI Dev Team Local Simulation${NC}"
echo "--------------------------------"

if [ -z "$1" ]; then
    read -p "Enter your product idea: " PRODUCT_IDEA
else
    PRODUCT_IDEA="$1"
fi

if [ -z "$PRODUCT_IDEA" ]; then
    echo -e "${RED}Error: Idea cannot be empty${NC}"
    exit 1
fi

ADDITIONAL_CONTEXT="N/A (Local Simulation)"
PRIORITY="High"
IS_REVISION="false"

# Build the prompt
if [ "$IS_REVISION" = "true" ]; then
    PROMPT="You are a Product Agent AI for an automated development team.

A user has requested revisions to a previous plan.

ORIGINAL PRODUCT IDEA:
$PRODUCT_IDEA

ADDITIONAL CONTEXT:
$ADDITIONAL_CONTEXT

PREVIOUS PLAN:
$PREVIOUS_PLAN

REVISION FEEDBACK:
$REVISION_FEEDBACK

Generate an IMPROVED plan incorporating the feedback. Keep the same PREMIUM structure but address the concerns."
else
    PROMPT="You are a Product Agent AI for an automated development team.

A user submitted this product idea:

PRODUCT IDEA:
$PRODUCT_IDEA

ADDITIONAL CONTEXT:
$ADDITIONAL_CONTEXT

PRIORITY:
$PRIORITY

Generate a comprehensive, high-quality implementation plan with the following sections (use EXACTLY these headers):

## 🎯 PROJECT OVERVIEW
- **Summary**: (One sentence summary)
- **Target users**: (Specific audience)
- **Core value proposition**: (Key benefits)

## ✨ FEATURES BREAKDOWN
Use a table format for each priority level:
| Feature | Description | Priority |
| :--- | :--- | :--- |
| Feature Name | Short description | P0/P1/P2 |

### P0 - Must Have
### P1 - Should Have
### P2 - Nice to Have

## 📖 USER STORIES
For each major feature, provide:
- **Story**: As a [user type], I want [goal] so that [benefit]
- **Acceptance Criteria**: (As a markdown checklist)

## 🏗️ TECHNICAL ARCHITECTURE
- **Tech Stack**: (Bullet points of specific technologies)
- **System Architecture**: (High-quality ASCII diagram)
- **Schema & API**: (Detailed markdown tables)

## 👥 AGENT TASK BREAKDOWN
Break down tasks for: **Backend**, **Integration**, **Frontend**, and **QA**.
Use markdown tables showing:
| Task | Description | Agent |
| :--- | :--- | :--- |

## 📅 IMPLEMENTATION TIMELINE
Break down into clearly labeled phases (e.g., Week 1, Week 2).

## 📝 GITHUB ISSUES TO CREATE
For each issue, provide a markdown block with:
- **Title**: [AGENT-TYPE] Description
- **Labels**: (e.g., backend, chore, enhancement)
- **Description**: Detailed deliverable checklist.

Format the entire response as PREMIUM structured markdown that looks professional on GitHub."
fi

echo -e "${YELLOW}Generating plan...${NC}"

REQUEST_BODY=$(jq -n \
  --arg text "$PROMPT" \
  '{
    contents: [{
      parts: [{
        text: $text
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192
    }
  }')

RESPONSE=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_BODY")

if echo "$RESPONSE" | jq -e '.error' > /dev/null; then
  echo -e "${RED}Error from Gemini API:${NC}"
  echo "$RESPONSE" | jq -r '.error.message'
  exit 1
fi

PLAN=$(echo "$RESPONSE" | jq -r '.candidates[0].content.parts[0].text')

if [ -z "$PLAN" ]; then
    echo -e "${RED}Failed to extract plan from response.${NC}"
    echo "$RESPONSE"
    exit 1
fi

echo -e "${GREEN}Plan generated successfully!${NC}"
echo "--------------------------------"
echo "$PLAN" > generated_plan.md
echo -e "Plan saved to ${GREEN}generated_plan.md${NC}"

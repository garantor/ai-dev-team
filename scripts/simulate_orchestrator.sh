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
    read -p "Enter your product idea: " IDEA
else
    IDEA="$1"
fi

if [ -z "$IDEA" ]; then
    echo -e "${RED}Error: Idea cannot be empty${NC}"
    exit 1
fi

PROMPT="You are a Product Agent AI for an automated development team.

A user submitted this product idea:

PRODUCT IDEA:
$IDEA

Generate a comprehensive implementation plan with the following sections (use exactly these headers):

## 🎯 PROJECT OVERVIEW
- Summary (one sentence)
- Target users
- Core value proposition

## ✨ FEATURES BREAKDOWN
### P0 - Must Have
(List critical features)

### P1 - Should Have
### P2 - Nice to Have

## 🏗️ TECHNICAL ARCHITECTURE
- Tech Stack
- System Architecture (ASCII diagram)

## 👥 AGENT TASK BREAKDOWN
### Backend Agent Tasks
### Integration Agent Tasks
### Frontend Agent Tasks
### QA Agent Tasks

## 📅 IMPLEMENTATION TIMELINE

## 📝 GITHUB ISSUES TO CREATE
For each issue, provide:
- Issue title (format: [AGENT-TYPE] Description)
- Dependencies
- Description"

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

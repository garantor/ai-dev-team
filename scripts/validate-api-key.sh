#!/bin/bash

# Validate Google Gemini API Key
# Usage: ./scripts/validate-api-key.sh

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Google Gemini API Key Validator${NC}"
echo ""

# Check if API key is provided
if [ -z "$GOOGLE_API_KEY" ]; then
    echo -e "${RED}Error: GOOGLE_API_KEY environment variable not set${NC}"
    echo ""
    echo "Set it with:"
    echo "  export GOOGLE_API_KEY='your-api-key'"
    exit 1
fi

echo -e "${YELLOW}Testing API key...${NC}"

# Test API call
RESPONSE=$(curl -s -w "\n%{http_code}" \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts":[{
        "text": "Hello"
      }]
    }]
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ API key is valid!${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | head -n 10
    exit 0
else
    echo -e "${RED}❌ API key validation failed${NC}"
    echo ""
    echo "HTTP Status: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi

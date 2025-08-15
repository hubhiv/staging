#!/bin/bash

# Xano Authentication Token Fetcher (Bash Version)
# 
# This script logs into the Xano API and returns an authentication token
# that can be used for testing authenticated endpoints.
# 
# Usage:
#   ./scripts/get-auth-token.sh
#   ./scripts/get-auth-token.sh custom@example.com custompass
#   ./scripts/get-auth-token.sh --json
# 
# Environment Variables:
#   XANO_TEST_EMAIL - Override default test email
#   XANO_TEST_PASSWORD - Override default test password

# Default test account (from api-tests.md)
DEFAULT_EMAIL="testuser.final@example.com"
DEFAULT_PASSWORD="securepassword123"
API_BASE_URL="https://x8gd-ip42-19oh.n7e.xano.io/api:9dYqAX_u"

# Parse arguments
EMAIL="${1:-${XANO_TEST_EMAIL:-$DEFAULT_EMAIL}}"
PASSWORD="${2:-${XANO_TEST_PASSWORD:-$DEFAULT_PASSWORD}}"
JSON_OUTPUT=false

if [[ "$1" == "--json" ]] || [[ "$2" == "--json" ]] || [[ "$3" == "--json" ]]; then
    JSON_OUTPUT=true
fi

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    echo "
Xano Authentication Token Fetcher (Bash)

Usage:
  ./scripts/get-auth-token.sh [email] [password] [--json]
  ./scripts/get-auth-token.sh --json
  ./scripts/get-auth-token.sh --help

Arguments:
  email      Override test email (default: $DEFAULT_EMAIL)
  password   Override test password
  --json     Output in JSON format
  --help     Show this help message

Environment Variables:
  XANO_TEST_EMAIL      Override default test email
  XANO_TEST_PASSWORD   Override default test password

Examples:
  ./scripts/get-auth-token.sh
  ./scripts/get-auth-token.sh --json
  ./scripts/get-auth-token.sh user@test.com mypass
  
  # Use in other scripts:
  TOKEN=\$(./scripts/get-auth-token.sh --json | jq -r '.authToken')
  curl -H \"Authorization: Bearer \$TOKEN\" \$API_BASE_URL/auth/me
"
    exit 0
fi

# Check if curl and jq are available
if ! command -v curl &> /dev/null; then
    echo "❌ Error: curl is required but not installed."
    exit 1
fi

if [[ "$JSON_OUTPUT" == true ]] && ! command -v jq &> /dev/null; then
    echo "❌ Error: jq is required for JSON output but not installed."
    echo "💡 Install jq or use the Node.js version: node scripts/get-auth-token.js"
    exit 1
fi

# Make login request
if [[ "$JSON_OUTPUT" != true ]]; then
    echo "🔐 Logging into Xano API..."
    echo "📧 Email: $EMAIL"
    echo "🌐 API: $API_BASE_URL/auth/login"
    echo ""
fi

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Parse response
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [[ "$HTTP_CODE" == "200" ]]; then
    TOKEN=$(echo "$BODY" | jq -r '.authToken' 2>/dev/null)
    
    if [[ "$TOKEN" != "null" ]] && [[ -n "$TOKEN" ]]; then
        if [[ "$JSON_OUTPUT" == true ]]; then
            echo "{
  \"success\": true,
  \"authToken\": \"$TOKEN\",
  \"email\": \"$EMAIL\",
  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)\"
}"
        else
            echo "✅ Login successful!"
            echo ""
            echo "🎫 Auth Token:"
            echo "$TOKEN"
            echo ""
            echo "📋 Usage Examples:"
            echo "curl -H \"Authorization: Bearer $TOKEN\" \\"
            echo "     \"$API_BASE_URL/auth/me\""
            echo ""
            echo "💡 Tip: Use --json flag for script-friendly output"
        fi
        exit 0
    else
        ERROR_MSG="Invalid response format"
    fi
else
    ERROR_MSG=$(echo "$BODY" | jq -r '.message // "Unknown error"' 2>/dev/null || echo "HTTP $HTTP_CODE")
fi

# Handle errors
if [[ "$JSON_OUTPUT" == true ]]; then
    echo "{
  \"success\": false,
  \"error\": \"$ERROR_MSG\",
  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)\"
}"
else
    echo "❌ Login failed: $ERROR_MSG"
    echo ""
    echo "💡 Check your credentials in docs/api-tests.md"
fi

exit 1

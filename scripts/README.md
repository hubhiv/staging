# Authentication Scripts

This directory contains utility scripts for Xano API authentication and testing.

## 🔐 Authentication Scripts

### get-auth-token Scripts
Two versions available for getting authentication tokens:

### Node.js Version (Recommended)
```bash
node scripts/get-auth-token.js
```

**Features:**
- ✅ Works on all platforms (Windows, Mac, Linux)
- ✅ No external dependencies
- ✅ JSON output support
- ✅ Environment variable support
- ✅ Detailed help and error messages

### Bash Version (Unix/Linux/Mac)
```bash
./scripts/get-auth-token.sh
```

**Features:**
- ✅ Fast and lightweight
- ✅ JSON output support (requires `jq`)
- ✅ Environment variable support
- ⚠️ Requires `curl` and `jq` for JSON output

### test-api Script
```bash
node scripts/test-api.js
```

**Features:**
- ✅ Complete end-to-end authentication flow test
- ✅ Tests login → token → authenticated API call
- ✅ Verifies user profile retrieval
- ✅ Clear pass/fail reporting
- ✅ Perfect for CI/CD integration testing

## 📋 Usage Examples

### Basic Usage
```bash
# Get token with default test account
node scripts/get-auth-token.js

# Get token in JSON format (for scripts)
node scripts/get-auth-token.js --json
```

### Custom Credentials
```bash
# Use custom email/password
node scripts/get-auth-token.js --email user@test.com --password mypass

# Use environment variables
export XANO_TEST_EMAIL="user@test.com"
export XANO_TEST_PASSWORD="mypass"
node scripts/get-auth-token.js
```

### Use in Other Scripts
```bash
# Get token and use in API call
TOKEN=$(node scripts/get-auth-token.js --json | jq -r '.authToken')
curl -H "Authorization: Bearer $TOKEN" \
     "https://x8gd-ip42-19oh.n7e.xano.io/api:9dYqAX_u/auth/me"

# One-liner for testing
curl -H "Authorization: Bearer $(node scripts/get-auth-token.js --json | jq -r '.authToken')" \
     "https://x8gd-ip42-19oh.n7e.xano.io/api:9dYqAX_u/auth/me"
```

### Integration Testing
```bash
# Quick end-to-end test (recommended)
node scripts/test-api.js

# Manual test with token
TOKEN=$(node scripts/get-auth-token.js --json | jq -r '.authToken')
echo "Testing user profile..."
curl -H "Authorization: Bearer $TOKEN" \
     "https://x8gd-ip42-19oh.n7e.xano.io/api:9dYqAX_u/auth/me" | jq
```

## 🔧 Environment Variables

Both scripts support these environment variables:

- `XANO_TEST_EMAIL` - Override default test email
- `XANO_TEST_PASSWORD` - Override default test password

## 📖 Default Test Account

The scripts use the test account documented in `docs/api-tests.md`:

- **Email**: `testuser.final@example.com`
- **Password**: `securepassword123`
- **Status**: ✅ Active and verified

## 🚀 Quick Start

1. **Get a token:**
   ```bash
   node scripts/get-auth-token.js
   ```

2. **Copy the token and use it:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
        "https://x8gd-ip42-19oh.n7e.xano.io/api:9dYqAX_u/auth/me"
   ```

3. **Or do it all in one command:**
   ```bash
   TOKEN=$(node scripts/get-auth-token.js --json | jq -r '.authToken')
   curl -H "Authorization: Bearer $TOKEN" \
        "https://x8gd-ip42-19oh.n7e.xano.io/api:9dYqAX_u/auth/me"
   ```

## 🛠️ Requirements

### Node.js Version
- Node.js (any recent version)
- No additional packages required

### Bash Version
- `curl` (for HTTP requests)
- `jq` (for JSON parsing, only needed with --json flag)

## 💡 Tips

- Use `--json` flag when calling from other scripts
- Set environment variables for custom credentials
- Check `docs/api-tests.md` for more testing information
- Tokens may expire - re-run the script if you get 401 errors

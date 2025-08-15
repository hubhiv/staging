#!/usr/bin/env node

/**
 * Xano Authentication Token Fetcher
 * 
 * This script logs into the Xano API and returns an authentication token
 * that can be used for testing authenticated endpoints.
 * 
 * Usage:
 *   node scripts/get-auth-token.js
 *   node scripts/get-auth-token.js --email custom@example.com --password custompass
 *   node scripts/get-auth-token.js --json  # Returns JSON format
 * 
 * Environment Variables:
 *   XANO_TEST_EMAIL - Override default test email
 *   XANO_TEST_PASSWORD - Override default test password
 */

import https from 'https';
import { URL } from 'url';

// Default test account (from api-tests.md)
const DEFAULT_EMAIL = 'testuser.final@example.com';
const DEFAULT_PASSWORD = 'securepassword123';
const API_BASE_URL = 'https://x8gd-ip42-19oh.n7e.xano.io/api:9dYqAX_u';

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (flag) => {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
};
const hasFlag = (flag) => args.includes(flag);

// Get credentials
const email = getArg('--email') || process.env.XANO_TEST_EMAIL || DEFAULT_EMAIL;
const password = getArg('--password') || process.env.XANO_TEST_PASSWORD || DEFAULT_PASSWORD;
const jsonOutput = hasFlag('--json');
const helpFlag = hasFlag('--help') || hasFlag('-h');

if (helpFlag) {
  console.log(`
Xano Authentication Token Fetcher

Usage:
  node scripts/get-auth-token.js [options]

Options:
  --email <email>       Override test email (default: ${DEFAULT_EMAIL})
  --password <password> Override test password
  --json               Output in JSON format
  --help, -h           Show this help message

Environment Variables:
  XANO_TEST_EMAIL      Override default test email
  XANO_TEST_PASSWORD   Override default test password

Examples:
  node scripts/get-auth-token.js
  node scripts/get-auth-token.js --json
  node scripts/get-auth-token.js --email user@test.com --password mypass
  
  # Use in other scripts:
  TOKEN=$(node scripts/get-auth-token.js --json | jq -r '.authToken')
  curl -H "Authorization: Bearer $TOKEN" https://api.example.com/protected
`);
  process.exit(0);
}

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

async function getAuthToken() {
  try {
    if (!jsonOutput) {
      console.log('🔐 Logging into Xano API...');
      console.log(`📧 Email: ${email}`);
      console.log(`🌐 API: ${API_BASE_URL}/auth/login`);
      console.log('');
    }

    const response = await makeRequest(`${API_BASE_URL}/auth/login`, {
      email: email,
      password: password
    });

    if (response.statusCode === 200 && response.data.authToken) {
      const token = response.data.authToken;
      
      if (jsonOutput) {
        console.log(JSON.stringify({
          success: true,
          authToken: token,
          email: email,
          timestamp: new Date().toISOString()
        }));
      } else {
        console.log('✅ Login successful!');
        console.log('');
        console.log('🎫 Auth Token:');
        console.log(token);
        console.log('');
        console.log('📋 Usage Examples:');
        console.log(`curl -H "Authorization: Bearer ${token}" \\`);
        console.log(`     "${API_BASE_URL}/auth/me"`);
        console.log('');
        console.log('💡 Tip: Use --json flag for script-friendly output');
      }
      
      process.exit(0);
    } else {
      throw new Error(`Login failed: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    if (jsonOutput) {
      console.log(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }));
    } else {
      console.error('❌ Login failed:', error.message);
      console.error('');
      console.error('💡 Check your credentials in docs/api-tests.md');
    }
    process.exit(1);
  }
}

// Run the script
getAuthToken();

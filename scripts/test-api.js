#!/usr/bin/env node

/**
 * Quick API Test Script
 * 
 * This script gets an auth token and tests the /auth/me endpoint
 * to verify the authentication flow is working end-to-end.
 * 
 * Usage:
 *   node scripts/test-api.js
 */

import https from 'https';
import { URL } from 'url';

const API_BASE_URL = 'https://x8gd-ip42-19oh.n7e.xano.io/api:9dYqAX_u';
const DEFAULT_EMAIL = 'testuser.final@example.com';
const DEFAULT_PASSWORD = 'securepassword123';

function makeRequest(url, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
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

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing Xano API Authentication Flow');
  console.log('=====================================');
  console.log('');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD
    });

    if (loginResponse.statusCode !== 200 || !loginResponse.data.authToken) {
      throw new Error(`Login failed: ${loginResponse.data.message || 'Unknown error'}`);
    }

    const token = loginResponse.data.authToken;
    console.log('   ✅ Login successful');
    console.log(`   🎫 Token: ${token.substring(0, 50)}...`);
    console.log('');

    // Step 2: Test authenticated endpoint
    console.log('2️⃣ Testing authenticated endpoint...');
    const profileResponse = await makeRequest(`${API_BASE_URL}/auth/me`, null, {
      'Authorization': `Bearer ${token}`
    });

    if (profileResponse.statusCode !== 200) {
      throw new Error(`Profile request failed: ${profileResponse.data.message || 'Unknown error'}`);
    }

    console.log('   ✅ Profile request successful');
    console.log('   👤 User Profile:');
    console.log(`      ID: ${profileResponse.data.id}`);
    console.log(`      Name: ${profileResponse.data.name}`);
    console.log(`      Email: ${profileResponse.data.email}`);
    console.log('');

    // Step 3: Summary
    console.log('🎉 All tests passed!');
    console.log('=====================================');
    console.log('✅ Login endpoint working');
    console.log('✅ Token authentication working');
    console.log('✅ User profile retrieval working');
    console.log('✅ End-to-end authentication flow verified');
    console.log('');
    console.log('💡 The authentication integration is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('💡 Check your credentials in docs/api-tests.md');
    process.exit(1);
  }
}

// Run the test
testAPI();

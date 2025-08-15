#!/usr/bin/env node

/**
 * TEST-HOME-PROFILE-CREATE-001: Create Home Profile API Test
 *
 * This script tests the POST /home_profile endpoint for HOME-PROFILE-CREATE story
 * Tests both successful creation and validation error handling
 */

const https = require('https');

// Prevent any JSON output from other sources
process.env.NODE_ENV = 'test';

// Test configuration
const HOME_API_BASE_URL = 'https://x8gd-ip42-19oh.n7e.xano.io/api:vUhMdCxR';
const TEST_USER_ID = 2; // Test user from api-tests.md

// Test data for home profile creation
const VALID_HOME_PROFILE = {
  address: "123 Test Street, Test City, TC 12345",
  year_built: 2010,
  square_footage: 2500,
  bedrooms: 4,
  bathrooms: 2.5,
  lot_size: "0.3 acres",
  user_id: TEST_USER_ID
};

const INVALID_HOME_PROFILE = {
  address: "", // Invalid: empty address
  year_built: "not_a_number", // Invalid: should be integer
  square_footage: -100, // Invalid: negative value
  bedrooms: 0, // Invalid: should be positive
  bathrooms: "invalid", // Invalid: should be number
  lot_size: "", // Invalid: empty lot size
  user_id: "invalid" // Invalid: should be integer
};

/**
 * Make HTTP request
 */
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
        'Accept': 'application/json',
        ...headers,
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (parseError) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
            parseError: parseError.message
          });
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

/**
 * Test Case 1: Valid Home Profile Creation
 */
async function testValidHomeProfileCreation() {
  console.log('🧪 TEST CASE 1: Valid Home Profile Creation');
  console.log('-'.repeat(50));
  
  try {
    const url = `${HOME_API_BASE_URL}/home_profile`;
    console.log(`📡 POST ${url}`);
    console.log('📋 Request Body:', JSON.stringify(VALID_HOME_PROFILE, null, 2));
    console.log('');
    
    const response = await makeRequest(url, VALID_HOME_PROFILE);
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(response.data, null, 2));
    console.log('');
    
    // Validate response
    if (response.status === 200 || response.status === 201) {
      const profile = response.data;
      
      // Check required fields
      const requiredFields = ['id', 'address', 'year_built', 'square_footage', 'bedrooms', 'bathrooms', 'lot_size', 'user_id'];
      const missingFields = requiredFields.filter(field => !profile.hasOwnProperty(field));
      
      if (missingFields.length === 0) {
        console.log('✅ PASS - Home profile created successfully');
        console.log(`✅ Profile ID: ${profile.id}`);
        console.log('✅ All required fields present');
        return { success: true, profileId: profile.id, profile };
      } else {
        console.log('❌ FAIL - Missing required fields:', missingFields);
        return { success: false, error: 'Missing required fields' };
      }
    } else {
      console.log(`❌ FAIL - Expected 200/201, got ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
  } catch (error) {
    console.log(`❌ FAIL - Request error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test Case 2: Invalid Data Validation
 */
async function testInvalidDataValidation() {
  console.log('🧪 TEST CASE 2: Invalid Data Validation');
  console.log('-'.repeat(50));
  
  try {
    const url = `${HOME_API_BASE_URL}/home_profile`;
    console.log(`📡 POST ${url}`);
    console.log('📋 Request Body (Invalid):', JSON.stringify(INVALID_HOME_PROFILE, null, 2));
    console.log('');
    
    const response = await makeRequest(url, INVALID_HOME_PROFILE);
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(response.data, null, 2));
    console.log('');
    
    // Validate error response
    if (response.status === 400 || response.status === 422) {
      console.log('✅ PASS - API correctly rejected invalid data');
      console.log(`✅ Error status: ${response.status}`);
      return { success: true };
    } else if (response.status === 200 || response.status === 201) {
      console.log('❌ FAIL - API accepted invalid data (should have rejected)');
      return { success: false, error: 'Invalid data was accepted' };
    } else {
      console.log(`❌ FAIL - Unexpected status: ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
  } catch (error) {
    console.log(`❌ FAIL - Request error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test Case 3: Cleanup - Delete Created Profile
 */
async function testCleanupCreatedProfile(profileId) {
  if (!profileId) {
    console.log('⏭️  SKIP - No profile to cleanup');
    return { success: true };
  }
  
  console.log('🧹 TEST CASE 3: Cleanup Created Profile');
  console.log('-'.repeat(50));
  
  try {
    const url = `${HOME_API_BASE_URL}/home_profile/${profileId}`;
    console.log(`📡 DELETE ${url}`);
    console.log('');
    
    const response = await makeRequest(url, null, { 'X-HTTP-Method-Override': 'DELETE' });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(response.data, null, 2));
    console.log('');
    
    if (response.status === 200) {
      console.log('✅ PASS - Profile deleted successfully');
      return { success: true };
    } else {
      console.log(`⚠️  WARNING - Delete failed with status: ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
  } catch (error) {
    console.log(`⚠️  WARNING - Delete error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Main test runner
 */
async function runHomeProfileCreateTests() {
  console.log('🏠 HOME PROFILE CREATE API TESTS');
  console.log('='.repeat(60));
  console.log(`Testing endpoint: POST ${HOME_API_BASE_URL}/home_profile`);
  console.log(`Purpose: Validate HOME-PROFILE-CREATE story prerequisites`);
  console.log('');
  
  const results = {
    validCreation: null,
    invalidValidation: null,
    cleanup: null
  };
  
  // Test 1: Valid creation
  results.validCreation = await testValidHomeProfileCreation();
  console.log('');
  
  // Test 2: Invalid data validation
  results.invalidValidation = await testInvalidDataValidation();
  console.log('');
  
  // Test 3: Cleanup
  if (results.validCreation.success && results.validCreation.profileId) {
    results.cleanup = await testCleanupCreatedProfile(results.validCreation.profileId);
    console.log('');
  }
  
  // Final summary
  console.log('🎯 FINAL TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Valid Creation: ${results.validCreation.success ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Invalid Validation: ${results.invalidValidation.success ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Cleanup: ${results.cleanup ? (results.cleanup.success ? 'PASS' : 'WARNING') : 'SKIPPED'}`);
  console.log('');
  
  const allPassed = results.validCreation.success && results.invalidValidation.success;
  
  if (allPassed) {
    console.log('🎉 OVERALL RESULT: PASS');
    console.log('✅ POST /home_profile endpoint is working correctly');
    console.log('✅ HOME-PROFILE-CREATE story can proceed with implementation');
  } else {
    console.log('❌ OVERALL RESULT: FAIL');
    console.log('❌ Issues found with POST /home_profile endpoint');
    console.log('❌ Fix API issues before implementing HOME-PROFILE-CREATE story');
  }
  
  return allPassed;
}

// Run tests if called directly
if (require.main === module) {
  runHomeProfileCreateTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { runHomeProfileCreateTests };

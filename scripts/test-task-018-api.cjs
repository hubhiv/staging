#!/usr/bin/env node

/**
 * TEST-TASK-018: Task Count API Integration Test
 * 
 * Tests the new /task/count/{userid} endpoint for TASK-018 implementation
 * Validates API response format and data integrity for Kanban column header counts
 */

const https = require('https');

// Test configuration
const API_BASE_URL = 'https://x8gd-ip42-19oh.n7e.xano.io/api:vUhMdCxR';
const TEST_USER_ID = 2; // Test user ID from existing test account
const ENDPOINT = `/task/count/${TEST_USER_ID}`;

// Expected task statuses from YAML specification
const EXPECTED_STATUSES = ['todo', 'scheduled', 'booked', 'complete'];

console.log('🧪 TEST-TASK-018: Task Count API Integration');
console.log('============================================================');
console.log(`Testing endpoint: GET ${ENDPOINT}`);
console.log(`Base URL: ${API_BASE_URL}`);
console.log(`Purpose: Validate task count API for Kanban column headers\n`);

/**
 * Make HTTP GET request to the task count endpoint
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          body: data
        });
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Validate the API response structure and data
 */
function validateResponse(response) {
  const results = {
    statusCode: response.statusCode === 200,
    contentType: false,
    jsonParseable: false,
    isArray: false,
    hasRequiredFields: false,
    statusValues: false,
    countValues: false,
    data: null,
    errors: []
  };

  // Check content type
  const contentType = response.headers['content-type'] || '';
  results.contentType = contentType.includes('application/json');
  if (!results.contentType) {
    results.errors.push(`Expected JSON content-type, got: ${contentType}`);
  }

  // Parse JSON
  try {
    results.data = JSON.parse(response.body);
    results.jsonParseable = true;
  } catch (error) {
    results.errors.push(`JSON parsing failed: ${error.message}`);
    return results;
  }

  // Check if response is array
  results.isArray = Array.isArray(results.data);
  if (!results.isArray) {
    results.errors.push(`Expected array response, got: ${typeof results.data}`);
    return results;
  }

  // Validate array items have required fields
  let hasValidFields = true;
  let hasValidStatuses = true;
  let hasValidCounts = true;

  for (const item of results.data) {
    // Check required fields exist
    if (!item.hasOwnProperty('task_status') || !item.hasOwnProperty('count')) {
      hasValidFields = false;
      results.errors.push(`Missing required fields in item: ${JSON.stringify(item)}`);
    }

    // Check task_status values
    if (typeof item.task_status !== 'string') {
      hasValidStatuses = false;
      results.errors.push(`Invalid task_status type: ${typeof item.task_status}`);
    }

    // Check count values
    if (typeof item.count !== 'number' || item.count < 0) {
      hasValidCounts = false;
      results.errors.push(`Invalid count value: ${item.count} (type: ${typeof item.count})`);
    }
  }

  results.hasRequiredFields = hasValidFields;
  results.statusValues = hasValidStatuses;
  results.countValues = hasValidCounts;

  return results;
}

/**
 * Main test execution
 */
async function runTest() {
  try {
    console.log(`📡 Making request to: ${API_BASE_URL}${ENDPOINT}`);
    
    const response = await makeRequest(`${API_BASE_URL}${ENDPOINT}`);
    
    console.log(`Status: ${response.statusCode}`);
    console.log(`Content-Type: ${response.headers['content-type'] || 'Not specified'}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Request successful (200 OK)');
      
      const validation = validateResponse(response);
      
      console.log('\n🔍 Response Validation:');
      console.log('--------------------------------------------------');
      
      console.log(`✅ Status Code (200): ${validation.statusCode ? 'PASS' : 'FAIL'}`);
      console.log(`${validation.contentType ? '✅' : '❌'} Content-Type (JSON): ${validation.contentType ? 'PASS' : 'FAIL'}`);
      console.log(`${validation.jsonParseable ? '✅' : '❌'} JSON Parseable: ${validation.jsonParseable ? 'PASS' : 'FAIL'}`);
      console.log(`${validation.isArray ? '✅' : '❌'} Response is Array: ${validation.isArray ? 'PASS' : 'FAIL'}`);
      console.log(`${validation.hasRequiredFields ? '✅' : '❌'} Required Fields: ${validation.hasRequiredFields ? 'PASS' : 'FAIL'}`);
      console.log(`${validation.statusValues ? '✅' : '❌'} Status Values: ${validation.statusValues ? 'PASS' : 'FAIL'}`);
      console.log(`${validation.countValues ? '✅' : '❌'} Count Values: ${validation.countValues ? 'PASS' : 'FAIL'}`);
      
      if (validation.data) {
        console.log('\n📊 Task Count Data:');
        console.log('--------------------------------------------------');
        
        let totalTasks = 0;
        const statusCounts = {};
        
        validation.data.forEach(item => {
          console.log(`📋 ${item.task_status}: ${item.count} tasks`);
          totalTasks += item.count;
          statusCounts[item.task_status] = item.count;
        });
        
        console.log(`\n📈 Summary:`);
        console.log(`- Total task count entries: ${validation.data.length}`);
        console.log(`- Total tasks across all statuses: ${totalTasks}`);
        console.log(`- Unique statuses found: [${Object.keys(statusCounts).join(', ')}]`);
        
        // Check for expected statuses
        console.log('\n🎯 Status Coverage Analysis:');
        EXPECTED_STATUSES.forEach(status => {
          const found = statusCounts.hasOwnProperty(status);
          const count = statusCounts[status] || 0;
          console.log(`${found ? '✅' : '⚠️'} ${status}: ${found ? `${count} tasks` : 'Not found in response'}`);
        });
      }
      
      if (validation.errors.length > 0) {
        console.log('\n❌ Validation Errors:');
        validation.errors.forEach(error => console.log(`   - ${error}`));
      }
      
      // Final verdict
      const allPassed = validation.statusCode && validation.contentType && 
                       validation.jsonParseable && validation.isArray && 
                       validation.hasRequiredFields && validation.statusValues && 
                       validation.countValues;
      
      console.log('\n🎯 FINAL TEST VERDICT:');
      console.log(`${allPassed ? '✅ PASS' : '❌ FAIL'} - Task Count API ${allPassed ? 'ready for TASK-018 implementation' : 'needs fixes before implementation'}`);
      
    } else {
      console.log(`❌ Request failed with status: ${response.statusCode}`);
      console.log('Response body:', response.body);
    }
    
  } catch (error) {
    console.log(`❌ Test failed with error: ${error.message}`);
  }
  
  console.log('\n============================================================');
  console.log('🏁 TEST-TASK-018 Complete');
  console.log('\nNext steps:');
  console.log('1. Update docs/backlog.md TASK-018 Pre-Requisite API Validation section');
  console.log('2. If API test passes, proceed with frontend file review');
  console.log('3. If API test fails, investigate endpoint implementation');
}

// Run the test
runTest();

#!/usr/bin/env node

/**
 * Task Detail Editing API Tests
 * Related to TASK-013: Task Detail Editing Modal Integration
 * 
 * This script tests the API endpoints required for the task detail modal:
 * - TEST-TASK-001: Task Update API
 * - TEST-TASK-002: Task Retrieval API  
 * - TEST-TASK-003: Invalid Task Update
 */

import https from 'https';

// Configuration
const AUTH_BASE_URL = 'https://x8gd-ip42-19oh.n7e.xano.io/api:9dYqAX_u';
const HOME_BASE_URL = 'https://x8gd-ip42-19oh.n7e.xano.io/api:vUhMdCxR';

// Test credentials
const TEST_CREDENTIALS = {
  email: 'testuser.final@example.com',
  password: 'securepassword123'
};

let authToken = null;
let testTaskId = null;

// Utility function to make HTTP requests
const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
};

// Step 0: Login to get auth token
const login = async () => {
  console.log('🔐 Step 0: Logging in to get auth token...');
  
  try {
    const response = await makeRequest(`${AUTH_BASE_URL}/auth/login`, {
      method: 'POST',
      body: TEST_CREDENTIALS
    });

    console.log(`Login Status: ${response.status}`);
    
    if (response.status === 200 && response.data.authToken) {
      authToken = response.data.authToken;
      console.log('✅ Login successful, auth token obtained');
      return true;
    } else {
      console.log('❌ Login failed:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
};

// TEST-TASK-001: Task Update API
const testTaskUpdate = async () => {
  console.log('\n📝 TEST-TASK-001: Task Update API');
  
  try {
    // Step 1: Create a test task
    console.log('Creating test task...');
    const createResponse = await makeRequest(`${HOME_BASE_URL}/task`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        title: 'Original Task Title',
        description: 'Original task description',
        status: 'todo',
        priority: 'medium',
        due_date: '2024-12-31T23:59:59Z',
        provider_type: 'general',
        assignee_id: '2'
      }
    });

    console.log(`Create Task Status: ${createResponse.status}`);
    
    if (createResponse.status !== 201) {
      console.log('❌ Failed to create test task:', createResponse.data);
      return false;
    }

    testTaskId = createResponse.data.id;
    console.log(`✅ Test task created with ID: ${testTaskId}`);

    // Step 2: Update the task
    console.log('Updating task properties...');
    const updateResponse = await makeRequest(`${HOME_BASE_URL}/tasks/${testTaskId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        title: 'Updated Task Title',
        description: 'Updated task description with more details',
        priority: 'high',
        due_date: '2024-11-30T23:59:59Z',
        provider_type: 'plumbing'
      }
    });

    console.log(`Update Task Status: ${updateResponse.status}`);
    console.log('Update Response:', JSON.stringify(updateResponse.data, null, 2));

    // Validate the update
    if (updateResponse.status === 200) {
      const task = updateResponse.data;
      const validations = [
        { field: 'title', expected: 'Updated Task Title', actual: task.title },
        { field: 'description', expected: 'Updated task description with more details', actual: task.description },
        { field: 'priority', expected: 'high', actual: task.priority },
        { field: 'due_date', expected: '2024-11-30T23:59:59Z', actual: task.due_date },
        { field: 'provider_type', expected: 'plumbing', actual: task.provider_type },
        { field: 'status', expected: 'todo', actual: task.status } // Should remain unchanged
      ];

      let allValid = true;
      validations.forEach(({ field, expected, actual }) => {
        if (actual === expected) {
          console.log(`✅ ${field}: ${actual}`);
        } else {
          console.log(`❌ ${field}: expected "${expected}", got "${actual}"`);
          allValid = false;
        }
      });

      if (allValid) {
        console.log('✅ TEST-TASK-001: PASSED - Task update working correctly');
        return true;
      } else {
        console.log('❌ TEST-TASK-001: FAILED - Some validations failed');
        return false;
      }
    } else {
      console.log('❌ TEST-TASK-001: FAILED - Update request failed');
      return false;
    }

  } catch (error) {
    console.error('❌ TEST-TASK-001: ERROR -', error.message);
    return false;
  }
};

// TEST-TASK-002: Task Retrieval API
const testTaskRetrieval = async () => {
  console.log('\n📖 TEST-TASK-002: Task Retrieval API');
  
  if (!testTaskId) {
    console.log('❌ No test task ID available, skipping retrieval test');
    return false;
  }

  try {
    const response = await makeRequest(`${HOME_BASE_URL}/tasks/${testTaskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log(`Retrieval Status: ${response.status}`);
    console.log('Retrieval Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      const task = response.data;
      
      // Validate required fields are present
      const requiredFields = [
        'id', 'title', 'description', 'status', 'priority', 
        'due_date', 'created_at', 'updated_at', 'comments_count', 
        'attachments_count', 'rating', 'position'
      ];

      let allFieldsPresent = true;
      requiredFields.forEach(field => {
        if (task.hasOwnProperty(field)) {
          console.log(`✅ ${field}: present (${typeof task[field]})`);
        } else {
          console.log(`❌ ${field}: missing`);
          allFieldsPresent = false;
        }
      });

      if (allFieldsPresent) {
        console.log('✅ TEST-TASK-002: PASSED - Task retrieval working correctly');
        return true;
      } else {
        console.log('❌ TEST-TASK-002: FAILED - Some required fields missing');
        return false;
      }
    } else {
      console.log('❌ TEST-TASK-002: FAILED - Retrieval request failed');
      return false;
    }

  } catch (error) {
    console.error('❌ TEST-TASK-002: ERROR -', error.message);
    return false;
  }
};

// TEST-TASK-003: Invalid Task Update
const testInvalidTaskUpdate = async () => {
  console.log('\n🚫 TEST-TASK-003: Invalid Task Update');
  
  if (!testTaskId) {
    console.log('❌ No test task ID available, skipping invalid update test');
    return false;
  }

  try {
    // Test Case 1: Invalid Priority Value
    console.log('Testing invalid priority value...');
    const invalidPriorityResponse = await makeRequest(`${HOME_BASE_URL}/tasks/${testTaskId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        priority: 'invalid_priority',
        title: 'Valid Title'
      }
    });

    console.log(`Invalid Priority Status: ${invalidPriorityResponse.status}`);
    console.log('Invalid Priority Response:', JSON.stringify(invalidPriorityResponse.data, null, 2));

    // Test Case 2: Title Too Long
    console.log('Testing title too long...');
    const longTitle = 'This is a very long title that exceeds the maximum character limit of 255 characters. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
    
    const longTitleResponse = await makeRequest(`${HOME_BASE_URL}/tasks/${testTaskId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        title: longTitle
      }
    });

    console.log(`Long Title Status: ${longTitleResponse.status}`);
    console.log('Long Title Response:', JSON.stringify(longTitleResponse.data, null, 2));

    // Test Case 3: Non-existent Task ID
    console.log('Testing non-existent task ID...');
    const nonExistentResponse = await makeRequest(`${HOME_BASE_URL}/tasks/99999`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        title: 'Updated Title'
      }
    });

    console.log(`Non-existent Task Status: ${nonExistentResponse.status}`);
    console.log('Non-existent Task Response:', JSON.stringify(nonExistentResponse.data, null, 2));

    // Validate error responses
    const validations = [
      { test: 'Invalid Priority', status: invalidPriorityResponse.status, expectedStatus: [400, 422] },
      { test: 'Long Title', status: longTitleResponse.status, expectedStatus: [400, 422] },
      { test: 'Non-existent Task', status: nonExistentResponse.status, expectedStatus: [404] }
    ];

    let allValid = true;
    validations.forEach(({ test, status, expectedStatus }) => {
      if (expectedStatus.includes(status)) {
        console.log(`✅ ${test}: Correctly returned ${status}`);
      } else {
        console.log(`❌ ${test}: Expected ${expectedStatus.join(' or ')}, got ${status}`);
        allValid = false;
      }
    });

    if (allValid) {
      console.log('✅ TEST-TASK-003: PASSED - Error handling working correctly');
      return true;
    } else {
      console.log('❌ TEST-TASK-003: FAILED - Some error validations failed');
      return false;
    }

  } catch (error) {
    console.error('❌ TEST-TASK-003: ERROR -', error.message);
    return false;
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🧪 Starting Task Detail Editing API Tests...\n');
  
  const results = {
    login: false,
    taskUpdate: false,
    taskRetrieval: false,
    invalidUpdate: false
  };

  // Step 0: Login
  results.login = await login();
  if (!results.login) {
    console.log('\n❌ Cannot proceed without authentication');
    return results;
  }

  // Run tests
  results.taskUpdate = await testTaskUpdate();
  results.taskRetrieval = await testTaskRetrieval();
  results.invalidUpdate = await testInvalidTaskUpdate();

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('================================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const passedCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All tests passed! API is ready for TASK-013 implementation.');
  } else {
    console.log('⚠️  Some tests failed. Review API implementation before proceeding.');
  }

  return results;
};

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests };

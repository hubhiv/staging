#!/usr/bin/env node

/**
 * TEST-TASK-014: Task List API Validation Script
 *
 * This script tests the /tasks/{userid} endpoint for TASK-014
 * Kanban Board Task Loading Integration
 */

import https from 'https';

// Test configuration
const BASE_URL = 'https://x8gd-ip42-19oh.n7e.xano.io/api:vUhMdCxR';
const TEST_USER_ID = 2; // Test user from api-tests.md
const TEST_ASSIGNEE_ID = 2; // Same as user ID

/**
 * Make HTTP GET request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: response.statusCode,
            headers: response.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: response.statusCode,
            headers: response.headers,
            data: data,
            parseError: error.message
          });
        }
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
 * Validate task object structure
 */
function validateTask(task, index) {
  const errors = [];
  const warnings = [];
  
  // Required fields
  const requiredFields = [
    'id', 'title', 'description', 'status', 'priority', 
    'assignee_id', 'created_at', 'due_date', 'comments_count', 
    'attachments_count', 'rating', 'position', 'provider_type'
  ];
  
  requiredFields.forEach(field => {
    if (task[field] === undefined || task[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate status values
  const validStatuses = ['todo', 'scheduled', 'booked', 'complete'];
  if (task.status && !validStatuses.includes(task.status)) {
    errors.push(`Invalid status: ${task.status}. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  // Validate priority values
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  if (task.priority && !validPriorities.includes(task.priority)) {
    errors.push(`Invalid priority: ${task.priority}. Must be one of: ${validPriorities.join(', ')}`);
  }
  
  // Validate numeric fields
  const numericFields = ['id', 'assignee_id', 'created_at', 'due_date', 'comments_count', 'attachments_count', 'rating', 'position'];
  numericFields.forEach(field => {
    if (task[field] !== undefined && typeof task[field] !== 'number') {
      warnings.push(`Field ${field} should be numeric, got: ${typeof task[field]}`);
    }
  });
  
  // Validate rating range
  if (task.rating !== undefined && (task.rating < 0 || task.rating > 5)) {
    errors.push(`Rating must be between 0-5, got: ${task.rating}`);
  }
  
  return { errors, warnings };
}

/**
 * Main test function
 */
async function runTaskListAPITest() {
  console.log('🧪 TEST-TASK-014: Task List API Validation');
  console.log('=' .repeat(50));
  console.log(`Testing endpoint: GET /tasks/${TEST_USER_ID}?assignee_id=${TEST_ASSIGNEE_ID}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log('');
  
  try {
    // Test 1: Valid request with assignee_id
    console.log('📡 Test 1: Valid request with assignee_id parameter');
    const url = `${BASE_URL}/tasks/${TEST_USER_ID}?assignee_id=${TEST_ASSIGNEE_ID}`;
    console.log(`URL: ${url}`);
    
    const response = await makeRequest(url);
    
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);
    
    if (response.parseError) {
      console.error('❌ Failed to parse JSON response:', response.parseError);
      console.log('Raw response:', response.data);
      return;
    }
    
    // Validate response structure
    if (response.status === 200) {
      console.log('✅ Request successful (200 OK)');
      
      if (!response.data.task) {
        console.error('❌ Response missing "task" property');
        console.log('Response structure:', Object.keys(response.data));
        return;
      }
      
      if (!Array.isArray(response.data.task)) {
        console.error('❌ "task" property is not an array');
        console.log('Task property type:', typeof response.data.task);
        return;
      }
      
      const tasks = response.data.task;
      console.log(`✅ Found ${tasks.length} tasks in response`);
      
      if (tasks.length === 0) {
        console.log('ℹ️  No tasks found for this user/assignee combination');
      } else {
        console.log('\n📋 Task Validation Results:');
        console.log('-'.repeat(40));
        
        let totalErrors = 0;
        let totalWarnings = 0;
        
        tasks.forEach((task, index) => {
          console.log(`\nTask ${index + 1} (ID: ${task.id}):`);
          console.log(`  Title: ${task.title}`);
          console.log(`  Status: ${task.status}`);
          console.log(`  Priority: ${task.priority}`);
          console.log(`  Assignee ID: ${task.assignee_id}`);
          console.log(`  Position: ${task.position}`);
          
          const validation = validateTask(task, index);
          
          if (validation.errors.length > 0) {
            console.log('  ❌ Errors:');
            validation.errors.forEach(error => console.log(`    - ${error}`));
            totalErrors += validation.errors.length;
          }
          
          if (validation.warnings.length > 0) {
            console.log('  ⚠️  Warnings:');
            validation.warnings.forEach(warning => console.log(`    - ${warning}`));
            totalWarnings += validation.warnings.length;
          }
          
          if (validation.errors.length === 0 && validation.warnings.length === 0) {
            console.log('  ✅ Task structure valid');
          }
        });
        
        console.log('\n📊 Validation Summary:');
        console.log(`Total tasks: ${tasks.length}`);
        console.log(`Total errors: ${totalErrors}`);
        console.log(`Total warnings: ${totalWarnings}`);
        
        if (totalErrors === 0) {
          console.log('✅ All tasks have valid structure');
        } else {
          console.log('❌ Some tasks have structural issues');
        }
      }
      
    } else {
      console.error(`❌ Request failed with status: ${response.status}`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 TEST-TASK-014 Complete');
  console.log('');
  console.log('Next steps:');
  console.log('1. Update docs/api-tests.md with these results');
  console.log('2. Update docs/backlog.md TASK-014 Pre-Requisite API Validation section');
  console.log('3. If tests pass, proceed with frontend integration tasks');
}

// Run the test
runTaskListAPITest().catch(console.error);

export { runTaskListAPITest, validateTask };

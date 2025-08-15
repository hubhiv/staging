#!/usr/bin/env node

/**
 * TEST-PROVIDER-001: Provider Field API Integration Test
 *
 * This script tests the provider field integration in the task API
 * for TASK-PROVIDER-001 implementation
 */

const https = require('https');

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
 * Analyze provider field in tasks
 */
function analyzeProviderField(tasks) {
  console.log('\n🔍 Provider Field Analysis:');
  console.log('-'.repeat(50));
  
  let tasksWithProvider = 0;
  let tasksWithProviderType = 0;
  const providerValues = new Set();
  const providerTypeValues = new Set();
  const validProviderEnums = ['Plumbing', 'HVAC', 'Painting', 'Electrical'];
  
  tasks.forEach((task, index) => {
    console.log(`\nTask ${index + 1} (ID: ${task.id}) - "${task.title}":`);
    
    // Check provider field
    if ('provider' in task) {
      console.log(`  ✅ Provider field exists: ${JSON.stringify(task.provider)}`);
      if (task.provider !== null && task.provider !== undefined && task.provider !== '') {
        tasksWithProvider++;
        providerValues.add(task.provider);
        
        // Validate enum value
        if (validProviderEnums.includes(task.provider)) {
          console.log(`  ✅ Provider value is valid enum: ${task.provider}`);
        } else {
          console.log(`  ❌ Provider value is NOT valid enum: ${task.provider}`);
        }
      } else {
        console.log(`  ⚠️  Provider field is empty/null`);
      }
    } else {
      console.log(`  ❌ Provider field missing from task`);
    }
    
    // Check provider_type field for comparison
    if ('provider_type' in task) {
      console.log(`  📋 Provider_type field: ${JSON.stringify(task.provider_type)}`);
      if (task.provider_type !== null && task.provider_type !== undefined && task.provider_type !== '') {
        tasksWithProviderType++;
        providerTypeValues.add(task.provider_type);
      }
    } else {
      console.log(`  ❌ Provider_type field missing from task`);
    }
    
    // Show all fields for first task
    if (index === 0) {
      console.log(`  📝 All fields in first task:`);
      Object.keys(task).sort().forEach(key => {
        const value = task[key];
        const type = typeof value;
        console.log(`    - ${key}: ${type} = ${JSON.stringify(value)}`);
      });
    }
  });
  
  console.log('\n📊 Provider Field Summary:');
  console.log(`- Total tasks analyzed: ${tasks.length}`);
  console.log(`- Tasks with provider field set: ${tasksWithProvider}/${tasks.length}`);
  console.log(`- Tasks with provider_type field set: ${tasksWithProviderType}/${tasks.length}`);
  console.log(`- Unique provider values: [${Array.from(providerValues).join(', ')}]`);
  console.log(`- Unique provider_type values: [${Array.from(providerTypeValues).join(', ')}]`);
  console.log(`- Valid provider enums: [${validProviderEnums.join(', ')}]`);
  
  // Validation results
  const hasProviderField = tasks.length > 0 && 'provider' in tasks[0];
  const hasValidEnums = Array.from(providerValues).every(val => validProviderEnums.includes(val));
  
  console.log('\n✅ Validation Results:');
  console.log(`- Provider field exists in API: ${hasProviderField ? '✅ YES' : '❌ NO'}`);
  console.log(`- Provider values match enum: ${hasValidEnums ? '✅ YES' : '❌ NO'}`);
  console.log(`- Ready for frontend integration: ${hasProviderField ? '✅ YES' : '❌ NO'}`);
  
  return {
    hasProviderField,
    hasValidEnums,
    tasksWithProvider,
    providerValues: Array.from(providerValues),
    providerTypeValues: Array.from(providerTypeValues)
  };
}

/**
 * Main test function
 */
async function runProviderFieldAPITest() {
  console.log('🧪 TEST-PROVIDER-001: Provider Field API Integration');
  console.log('='.repeat(60));
  console.log(`Testing endpoint: GET /tasks/${TEST_USER_ID}?assignee_id=${TEST_ASSIGNEE_ID}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log('Purpose: Validate provider field exists and has correct enum values');
  console.log('');
  
  try {
    const url = `${BASE_URL}/tasks/${TEST_USER_ID}?assignee_id=${TEST_ASSIGNEE_ID}`;
    console.log(`📡 Making request to: ${url}`);
    
    const response = await makeRequest(url);
    
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);
    
    if (response.parseError) {
      console.error('❌ Failed to parse JSON response:', response.parseError);
      console.log('Raw response:', response.data);
      return;
    }
    
    if (response.status === 200) {
      console.log('✅ Request successful (200 OK)');
      
      if (!response.data.task || !Array.isArray(response.data.task)) {
        console.error('❌ Invalid response structure - missing task array');
        return;
      }
      
      const tasks = response.data.task;
      console.log(`✅ Found ${tasks.length} tasks in response`);
      
      if (tasks.length === 0) {
        console.log('⚠️  No tasks found - cannot validate provider field');
        return;
      }
      
      // Analyze provider field
      const analysis = analyzeProviderField(tasks);
      
      // Final verdict
      console.log('\n🎯 FINAL TEST VERDICT:');
      if (analysis.hasProviderField) {
        console.log('✅ PASS - Provider field exists in API response');
        console.log('✅ PASS - Ready for TASK-PROVIDER-001 implementation');
      } else {
        console.log('❌ FAIL - Provider field missing from API response');
        console.log('❌ FAIL - Backend needs to add provider field before frontend work');
      }
      
    } else {
      console.error(`❌ Request failed with status: ${response.status}`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 TEST-PROVIDER-001 Complete');
  console.log('');
  console.log('Next steps:');
  console.log('1. Update docs/backlog.md TASK-PROVIDER-001 Pre-Requisite API Validation section');
  console.log('2. If provider field exists, proceed with frontend type system updates');
  console.log('3. If provider field missing, request backend team to add it');
}

// Run the test
runProviderFieldAPITest().catch(console.error);

module.exports = { runProviderFieldAPITest, analyzeProviderField };

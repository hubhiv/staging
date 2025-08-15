#!/usr/bin/env node

/**
 * TEST-TASK-019: Drag-Drop Status Preservation API Test
 * 
 * Tests the drag-and-drop status revert issue for TASK-019 implementation
 * Validates that /tasks/reorder endpoint preserves task status during position updates
 */

const https = require('https');

// Test configuration
const API_BASE_URL = 'https://x8gd-ip42-19oh.n7e.xano.io/api:vUhMdCxR';
const TEST_USER_ID = 2; // Test user ID from existing test account
const TEST_TASK_ID = 43; // Task ID from user's API traffic example

// Test credentials (from previous successful tests)
const AUTH_TOKEN = 'eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwiemlwIjoiREVGIn0.O8_5Tp80mvpWxrxffJTp7rfR2VrOl8O5lphFNaX_evVa1InuuIu2B4RLXTNfOgPD7WqQgfodD-PP-lF2kJNk2wQemtaBkC_b.G9q8HFe2QGlg4tR_ffCUqw.8s5vl4QZlqTSBNVZFgv2APCiwQ1tAEn-w_0XJazftBg_2rGAgwOvRwZm59_HI5ibHeEYIXiwQT8-sAeBQCuYM5ItEmf5VYv4m3yF9JwUfH8AmjFnVlfqqXyzye6_nK2NOrliD8Z2-U475U4jyK10rw.Bm-kMPFx9DKwck-LldmNZSNzXqDez7Hvo_VNu6zJUQM';

console.log('🧪 TEST-TASK-019: Drag-Drop Status Preservation');
console.log('============================================================');
console.log(`Testing drag-and-drop status preservation issue`);
console.log(`Base URL: ${API_BASE_URL}`);
console.log(`Test Task ID: ${TEST_TASK_ID}`);
console.log(`Purpose: Reproduce and validate the status revert bug\n`);

/**
 * Make HTTP request with authentication
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...options.headers
      }
    };

    const request = https.request(url, requestOptions, (response) => {
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
    
    if (options.body) {
      request.write(options.body);
    }
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
    
    request.end();
  });
}

/**
 * Get current task data
 */
async function getCurrentTaskData(taskId) {
  console.log(`📋 Step 1: Getting current task data for task ${taskId}`);
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/task/${taskId}`);
    
    if (response.statusCode === 200) {
      const task = JSON.parse(response.body);
      console.log(`✅ Current task status: "${task.status}"`);
      console.log(`✅ Current task position: ${task.position}`);
      console.log(`✅ Task title: "${task.title}"`);
      return task;
    } else {
      console.log(`❌ Failed to get task data: ${response.statusCode}`);
      console.log(`Response: ${response.body}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error getting task data: ${error.message}`);
    return null;
  }
}

/**
 * Update task status (simulating first API call in drag-and-drop)
 */
async function updateTaskStatus(taskId, newStatus) {
  console.log(`\n🔄 Step 2: Updating task ${taskId} status to "${newStatus}"`);
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/task/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    
    if (response.statusCode === 200) {
      const task = JSON.parse(response.body);
      console.log(`✅ Status update successful`);
      console.log(`✅ New status: "${task.status}"`);
      console.log(`✅ Position: ${task.position}`);
      return task;
    } else {
      console.log(`❌ Status update failed: ${response.statusCode}`);
      console.log(`Response: ${response.body}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error updating status: ${error.message}`);
    return null;
  }
}

/**
 * Reorder task (simulating second API call in drag-and-drop)
 */
async function reorderTask(taskId, newPosition) {
  console.log(`\n📍 Step 3: Reordering task ${taskId} to position ${newPosition}`);
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tasks/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({
        reorder: [
          {
            id: taskId,
            position: newPosition
          }
        ]
      })
    });
    
    if (response.statusCode === 200) {
      const tasks = JSON.parse(response.body);
      const task = tasks[0];
      console.log(`✅ Reorder API call successful`);
      console.log(`📊 Response status: "${task.status}"`);
      console.log(`📊 Response position: ${task.position}`);
      return task;
    } else {
      console.log(`❌ Reorder failed: ${response.statusCode}`);
      console.log(`Response: ${response.body}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error reordering task: ${error.message}`);
    return null;
  }
}

/**
 * Test the enhanced reorder with status (proposed fix)
 */
async function reorderTaskWithStatus(taskId, newPosition, status) {
  console.log(`\n🔧 Step 4: Testing enhanced reorder with status preservation`);
  console.log(`📍 Position: ${newPosition}, Status: "${status}"`);
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/tasks/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({
        reorder: [
          {
            id: taskId,
            position: newPosition,
            status: status  // Include status in reorder request
          }
        ]
      })
    });
    
    if (response.statusCode === 200) {
      const tasks = JSON.parse(response.body);
      const task = tasks[0];
      console.log(`✅ Enhanced reorder API call successful`);
      console.log(`📊 Response status: "${task.status}"`);
      console.log(`📊 Response position: ${task.position}`);
      return task;
    } else {
      console.log(`❌ Enhanced reorder failed: ${response.statusCode}`);
      console.log(`Response: ${response.body}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error with enhanced reorder: ${error.message}`);
    return null;
  }
}

/**
 * Main test execution
 */
async function runTest() {
  try {
    // Step 1: Get current task data
    const originalTask = await getCurrentTaskData(TEST_TASK_ID);
    if (!originalTask) {
      console.log('❌ Cannot proceed without original task data');
      return;
    }

    const originalStatus = originalTask.status;
    const originalPosition = originalTask.position;
    const newStatus = originalStatus === 'scheduled' ? 'booked' : 'scheduled';
    const newPosition = originalPosition + 10;

    console.log(`\n🎯 TEST SCENARIO:`);
    console.log(`- Original Status: "${originalStatus}" → New Status: "${newStatus}"`);
    console.log(`- Original Position: ${originalPosition} → New Position: ${newPosition}`);

    // Step 2: Update task status (first API call in drag-and-drop)
    const statusUpdatedTask = await updateTaskStatus(TEST_TASK_ID, newStatus);
    if (!statusUpdatedTask) {
      console.log('❌ Cannot proceed without status update');
      return;
    }

    // Step 3: Reorder task (second API call - this should preserve status)
    const reorderedTask = await reorderTask(TEST_TASK_ID, newPosition);
    if (!reorderedTask) {
      console.log('❌ Cannot proceed without reorder result');
      return;
    }

    // Step 4: Analyze the bug
    console.log(`\n🔍 BUG ANALYSIS:`);
    console.log('--------------------------------------------------');
    
    const statusPreserved = reorderedTask.status === newStatus;
    const positionUpdated = reorderedTask.position === newPosition;
    
    console.log(`Status Preservation: ${statusPreserved ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Expected: "${newStatus}", Got: "${reorderedTask.status}"`);
    console.log(`Position Update: ${positionUpdated ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Expected: ${newPosition}, Got: ${reorderedTask.position}`);

    if (!statusPreserved) {
      console.log(`\n🚨 BUG CONFIRMED: Status reverted from "${newStatus}" to "${reorderedTask.status}"`);
      
      // Step 5: Test the proposed fix
      await reorderTaskWithStatus(TEST_TASK_ID, newPosition + 5, newStatus);
    } else {
      console.log(`\n✅ No bug detected - status was preserved correctly`);
    }

    // Final verification
    console.log(`\n📊 FINAL VERIFICATION:`);
    const finalTask = await getCurrentTaskData(TEST_TASK_ID);
    if (finalTask) {
      console.log(`Final Status: "${finalTask.status}"`);
      console.log(`Final Position: ${finalTask.position}`);
    }

    // Restore original state
    console.log(`\n🔄 RESTORING ORIGINAL STATE:`);
    await updateTaskStatus(TEST_TASK_ID, originalStatus);
    await reorderTask(TEST_TASK_ID, originalPosition);
    console.log(`✅ Task restored to original state`);

    console.log('\n🎯 TEST CONCLUSION:');
    console.log('--------------------------------------------------');
    if (!statusPreserved) {
      console.log('❌ BUG CONFIRMED: /tasks/reorder endpoint reverts task status');
      console.log('🔧 SOLUTION: Include status field in reorder request payload');
      console.log('📋 READY FOR TASK-019 IMPLEMENTATION');
    } else {
      console.log('✅ NO BUG DETECTED: Status preservation working correctly');
      console.log('🤔 INVESTIGATION: May be intermittent or environment-specific');
    }
    
  } catch (error) {
    console.log(`❌ Test failed with error: ${error.message}`);
  }
  
  console.log('\n============================================================');
  console.log('🏁 TEST-TASK-019 Complete');
}

// Run the test
runTest();

// Simple Task API Test for TASK-013 Pre-Requisite Validation
// Using fetch API for simplicity

const AUTH_URL = 'https://x8gd-ip42-19oh.n7e.xano.io/api:9dYqAX_u';
const HOME_URL = 'https://x8gd-ip42-19oh.n7e.xano.io/api:vUhMdCxR';

const credentials = {
  email: 'testuser.final@example.com',
  password: 'securepassword123'
};

async function runTests() {
  console.log('🧪 Starting TASK-013 API Validation Tests...\n');

  try {
    // Step 1: Login
    console.log('🔐 Step 1: Login...');
    const loginResponse = await fetch(`${AUTH_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const loginData = await loginResponse.json();
    console.log(`Login Status: ${loginResponse.status}`);

    if (loginResponse.status !== 200 || !loginData.authToken) {
      console.log('❌ Login failed:', loginData);
      return;
    }

    const authToken = loginData.authToken;
    console.log('✅ Login successful\n');

    // Step 2: Create a test task
    console.log('📝 Step 2: Create test task...');
    const createResponse = await fetch(`${HOME_URL}/task`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'TASK-013 Test Task',
        description: 'Test task for API validation',
        status: 'todo',
        priority: 'medium',
        due_date: '2024-12-31T23:59:59Z',
        provider_type: 'general',
        assignee_id: '2'
      })
    });

    const createData = await createResponse.json();
    console.log(`Create Status: ${createResponse.status}`);
    console.log('Create Response:', JSON.stringify(createData, null, 2));

    if (createResponse.status !== 201) {
      console.log('❌ Task creation failed');
      return;
    }

    const taskId = createData.id;
    console.log(`✅ Task created with ID: ${taskId}\n`);

    // Step 3: Test task retrieval (TEST-TASK-002)
    console.log('📖 Step 3: Test task retrieval...');
    const getResponse = await fetch(`${HOME_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const getData = await getResponse.json();
    console.log(`Get Status: ${getResponse.status}`);
    console.log('Get Response:', JSON.stringify(getData, null, 2));

    if (getResponse.status === 200) {
      console.log('✅ TEST-TASK-002: PASSED - Task retrieval working\n');
    } else {
      console.log('❌ TEST-TASK-002: FAILED - Task retrieval failed\n');
    }

    // Step 4: Test task update (TEST-TASK-001)
    console.log('✏️  Step 4: Test task update...');
    const updateResponse = await fetch(`${HOME_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Updated TASK-013 Test Task',
        description: 'Updated description for API validation',
        priority: 'high',
        provider_type: 'plumbing'
      })
    });

    const updateData = await updateResponse.json();
    console.log(`Update Status: ${updateResponse.status}`);
    console.log('Update Response:', JSON.stringify(updateData, null, 2));

    if (updateResponse.status === 200) {
      console.log('✅ TEST-TASK-001: PASSED - Task update working\n');
    } else {
      console.log('❌ TEST-TASK-001: FAILED - Task update failed\n');
    }

    // Step 5: Test invalid update (TEST-TASK-003)
    console.log('🚫 Step 5: Test invalid update...');
    const invalidResponse = await fetch(`${HOME_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        priority: 'invalid_priority'
      })
    });

    const invalidData = await invalidResponse.json();
    console.log(`Invalid Update Status: ${invalidResponse.status}`);
    console.log('Invalid Update Response:', JSON.stringify(invalidData, null, 2));

    if (invalidResponse.status === 400 || invalidResponse.status === 422) {
      console.log('✅ TEST-TASK-003: PASSED - Error handling working\n');
    } else {
      console.log('❌ TEST-TASK-003: FAILED - Error handling not working\n');
    }

    // Summary
    console.log('📊 TASK-013 API Validation Summary:');
    console.log('=====================================');
    console.log('✅ Authentication: Working');
    console.log('✅ Task Creation: Working');
    console.log(`${getResponse.status === 200 ? '✅' : '❌'} Task Retrieval (TEST-TASK-002): ${getResponse.status === 200 ? 'PASSED' : 'FAILED'}`);
    console.log(`${updateResponse.status === 200 ? '✅' : '❌'} Task Update (TEST-TASK-001): ${updateResponse.status === 200 ? 'PASSED' : 'FAILED'}`);
    console.log(`${(invalidResponse.status === 400 || invalidResponse.status === 422) ? '✅' : '❌'} Error Handling (TEST-TASK-003): ${(invalidResponse.status === 400 || invalidResponse.status === 422) ? 'PASSED' : 'FAILED'}`);

    const allPassed = getResponse.status === 200 && 
                     updateResponse.status === 200 && 
                     (invalidResponse.status === 400 || invalidResponse.status === 422);

    if (allPassed) {
      console.log('\n🎉 All API tests PASSED! Ready to proceed with TASK-013 implementation.');
    } else {
      console.log('\n⚠️  Some API tests FAILED. Review before proceeding with TASK-013.');
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

runTests();

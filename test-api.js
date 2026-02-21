#!/usr/bin/env node

/**
 * VIF Activity Tracker - API Test Script
 * Tests all API endpoints to verify everything works
 * 
 * Usage: node test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test function
async function test(name, fn) {
  testResults.total++;
  try {
    process.stdout.write(`${colors.yellow}⏳${colors.reset} ${name}... `);
    await fn();
    testResults.passed++;
    console.log(`${colors.green}✅ PASSED${colors.reset}`);
    return true;
  } catch (error) {
    testResults.failed++;
    console.log(`${colors.red}❌ FAILED${colors.reset}`);
    console.log(`   ${colors.red}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

// Assertion helpers
function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertTrue(value, message) {
  if (!value) {
    throw new Error(message || `Expected true, got ${value}`);
  }
}

function assertStatusOk(status) {
  if (status < 200 || status >= 300) {
    throw new Error(`Expected status 2xx, got ${status}`);
  }
}

// Test Suite
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.blue}🧪 VIF Activity Tracker - API Test Suite${colors.reset}`);
  console.log('='.repeat(60) + '\n');

  // Check if server is running
  console.log(`${colors.blue}📡 Checking server connection...${colors.reset}\n`);
  
  try {
    await makeRequest('GET', '/api/health');
  } catch (error) {
    console.log(`${colors.red}❌ Server not running on ${BASE_URL}${colors.reset}`);
    console.log(`${colors.yellow}Please start the server first: npm start${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`${colors.green}✅ Server is running!${colors.reset}\n`);
  console.log(`${colors.blue}Running tests...${colors.reset}\n`);

  // Test 1: Health Check
  await test('Health Check', async () => {
    const res = await makeRequest('GET', '/api/health');
    assertStatusOk(res.status);
    assertEquals(res.data.status, 'ok', 'Health check status should be ok');
  });

  // Test 2: Get All Users
  await test('Get All Users', async () => {
    const res = await makeRequest('GET', '/api/users');
    assertStatusOk(res.status);
    assertTrue(Array.isArray(res.data), 'Should return array of users');
    assertTrue(res.data.length >= 17, 'Should have at least 17 users');
  });

  // Test 3: Get Single User
  await test('Get Single User', async () => {
    const res = await makeRequest('GET', '/api/users/omar@viftraining.com');
    assertStatusOk(res.status);
    assertEquals(res.data.email, 'omar@viftraining.com');
    assertEquals(res.data.name, 'Omar');
  });

  // Test 4: Login - Admin
  await test('Login - Admin Account', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'asadeq@viftraining.com',
      password: 'test'
    });
    assertStatusOk(res.status);
    assertTrue(res.data.success, 'Login should succeed');
    assertEquals(res.data.user.role, 'admin', 'User should be admin');
  });

  // Test 5: Login - Employee
  await test('Login - Employee Account', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'omar@viftraining.com',
      password: 'test'
    });
    assertStatusOk(res.status);
    assertTrue(res.data.success, 'Login should succeed');
    assertEquals(res.data.user.role, 'employee', 'User should be employee');
  });

  // Test 6: Check Authentication
  await test('Check Authentication', async () => {
    const res = await makeRequest('GET', '/api/auth/check?email=omar@viftraining.com');
    assertStatusOk(res.status);
    assertTrue(res.data.authenticated, 'User should be authenticated');
  });

  // Test 7: Create Activity
  let createdActivityId;
  await test('Create Activity', async () => {
    const res = await makeRequest('POST', '/api/activities', {
      email: 'omar@viftraining.com',
      department: 'Consultants',
      activityType: 'Training (Billing Days)',
      unitsCompleted: 8,
      percentageComplete: 100,
      description: 'Test activity from automated test',
      week: '2025-10-03'
    });
    assertStatusOk(res.status);
    assertTrue(res.data.id, 'Activity should have an ID');
    createdActivityId = res.data.id;
  });

  // Test 8: Get Activities
  await test('Get Activities', async () => {
    const res = await makeRequest('GET', '/api/activities?email=omar@viftraining.com&role=employee');
    assertStatusOk(res.status);
    assertTrue(Array.isArray(res.data), 'Should return array of activities');
  });

  // Test 9: Get Single Activity
  if (createdActivityId) {
    await test('Get Single Activity', async () => {
      const res = await makeRequest('GET', `/api/activities/${createdActivityId}`);
      assertStatusOk(res.status);
      assertEquals(res.data.id, createdActivityId);
    });
  }

  // Test 10: Update Activity
  if (createdActivityId) {
    await test('Update Activity', async () => {
      const res = await makeRequest('PUT', `/api/activities/${createdActivityId}`, {
        unitsCompleted: 10,
        percentageComplete: 100,
        description: 'Updated test activity'
      });
      assertStatusOk(res.status);
      assertEquals(res.data.unitsCompleted, 10);
    });
  }

  // Test 11: Submit Week
  await test('Submit Week', async () => {
    const res = await makeRequest('POST', '/api/activities/submit-week', {
      email: 'omar@viftraining.com',
      week: '2025-10-03'
    });
    assertStatusOk(res.status);
    assertTrue(res.data.success, 'Submit should succeed');
  });

  // Test 12: Admin Review
  if (createdActivityId) {
    await test('Admin Review Activity', async () => {
      const res = await makeRequest('POST', `/api/activities/${createdActivityId}/review`, {
        adminEmail: 'asadeq@viftraining.com',
        feedback: 'Great work!',
        status: 'reviewed'
      });
      assertStatusOk(res.status);
      assertEquals(res.data.status, 'reviewed');
    });
  }

  // Test 13: Get Statistics
  await test('Get Statistics', async () => {
    const res = await makeRequest('GET', '/api/activities/stats/summary?week=2025-10-03');
    assertStatusOk(res.status);
    assertTrue(typeof res.data.totalActivities === 'number');
  });

  // Test 14: Get Email Preferences
  await test('Get Email Preferences', async () => {
    const res = await makeRequest('GET', '/api/users/omar@viftraining.com/email-preferences');
    assertStatusOk(res.status);
    assertTrue(typeof res.data.deadlineReminders === 'boolean');
  });

  // Test 15: Update Email Preferences
  await test('Update Email Preferences', async () => {
    const res = await makeRequest('PUT', '/api/users/omar@viftraining.com/email-preferences', {
      deadlineReminders: true,
      submissionConfirmations: true
    });
    assertStatusOk(res.status);
    assertEquals(res.data.deadlineReminders, true);
  });

  // Test 16: Delete Activity (cleanup)
  if (createdActivityId) {
    await test('Delete Activity', async () => {
      const res = await makeRequest('DELETE', `/api/activities/${createdActivityId}`);
      assertStatusOk(res.status);
      assertTrue(res.data.success, 'Delete should succeed');
    });
  }

  // Print Results
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.blue}📊 Test Results${colors.reset}`);
  console.log('='.repeat(60) + '\n');
  
  console.log(`Total Tests:  ${testResults.total}`);
  console.log(`${colors.green}Passed:       ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed:       ${testResults.failed}${colors.reset}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%\n`);

  if (testResults.failed === 0) {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}`);
    console.log(`${colors.green}✅ Your VIF Activity Tracker API is working perfectly!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}❌ Some tests failed. Please check the errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run the tests
console.log(`${colors.blue}Starting VIF Activity Tracker API Tests...${colors.reset}`);
runTests().catch(error => {
  console.error(`${colors.red}Test suite crashed: ${error.message}${colors.reset}`);
  process.exit(1);
});

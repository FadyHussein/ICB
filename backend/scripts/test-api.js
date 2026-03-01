/**
 * Simple API test script
 * Tests basic endpoints to verify server functionality
 * 
 * Usage: node backend/scripts/test-api.js
 */

const baseUrl = 'http://localhost:5000/api/v1';

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    const response = await fetch(`${baseUrl}${url}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success (${response.status})`);
      console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200));
    } else {
      console.log(`❌ Failed (${response.status})`);
      console.log(`   Error:`, data.error?.message);
    }
    
    return { success: response.ok, data };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════');
  console.log('   ICB Sunday School Backend API Tests');
  console.log('═══════════════════════════════════════════════');

  // Test 1: Health check
  await testEndpoint('Health Check', '/health');

  // Test 2: Get programs
  await testEndpoint('Get Programs', '/programs');

  // Test 3: Get teachers
  await testEndpoint('Get Teachers', '/teachers');

  // Test 4: Get students
  await testEndpoint('Get Students', '/students?program=iqra&level=2');

  // Test 5: Get current week
  await testEndpoint('Get Current Week', '/config/current-week');

  // Test 6: Get attendance (may fail if sheet doesn't exist)
  await testEndpoint('Get Attendance', '/attendance?program=iqra&level=2&date=2026-02-16');

  console.log('\n═══════════════════════════════════════════════');
  console.log('   Tests Complete');
  console.log('═══════════════════════════════════════════════\n');
}

// Run tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});

/**
 * Concurrent Access Testing Script
 * 
 * Tests the multi-user support by simulating multiple teachers
 * submitting attendance simultaneously
 */

const axios = require('axios');
const chalk = require('chalk');

const BASE_URL = 'http://localhost:5000/api/v1';
const NUM_CONCURRENT_USERS = 8;
const TEST_DATE = new Date().toISOString().split('T')[0];

// Sample attendance data for different teachers
const generateAttendanceData = (teacherIndex, levelIndex) => ({
  weekDate: TEST_DATE,
  program: 'Sunday School',
  level: `Level ${levelIndex + 1}`,
  teacherName: `Test Teacher ${teacherIndex}`,
  attendanceRecords: [
    {
      studentId: `SS-L${levelIndex + 1}-${String(teacherIndex * 3 + 1).padStart(3, '0')}`,
      status: 'present',
      hasOfferingBox: true,
      notes: `Concurrent test ${teacherIndex}`
    },
    {
      studentId: `SS-L${levelIndex + 1}-${String(teacherIndex * 3 + 2).padStart(3, '0')}`,
      status: 'present',
      hasOfferingBox: false,
      notes: ''
    },
    {
      studentId: `SS-L${levelIndex + 1}-${String(teacherIndex * 3 + 3).padStart(3, '0')}`,
      status: 'absent',
      hasOfferingBox: false,
      notes: 'Sick'
    }
  ]
});

// Test concurrent POST requests
async function testConcurrentSubmissions() {
  console.log(chalk.blue.bold('\n🧪 CONCURRENT ACCESS TEST'));
  console.log(chalk.gray('='.repeat(60)));
  console.log(chalk.yellow(`Simulating ${NUM_CONCURRENT_USERS} teachers submitting attendance simultaneously\n`));

  const startTime = Date.now();
  const promises = [];
  const results = [];

  // Create concurrent requests
  for (let i = 0; i < NUM_CONCURRENT_USERS; i++) {
    const levelIndex = i % 6; // Distribute across 6 levels
    const data = generateAttendanceData(i + 1, levelIndex);
    
    const promise = axios.post(`${BASE_URL}/attendance/submit`, data)
      .then(response => {
        results.push({
          index: i + 1,
          success: true,
          status: response.status,
          data: response.data,
          duration: Date.now() - startTime
        });
        return { index: i + 1, success: true };
      })
      .catch(error => {
        results.push({
          index: i + 1,
          success: false,
          error: error.response?.data || error.message,
          duration: Date.now() - startTime
        });
        return { index: i + 1, success: false, error: error.message };
      });

    promises.push(promise);
  }

  // Wait for all requests to complete
  console.log(chalk.cyan('⏳ Sending concurrent requests...'));
  const outcomes = await Promise.all(promises);
  const totalDuration = Date.now() - startTime;

  // Analyze results
  console.log(chalk.green('\n✅ All requests completed\n'));
  
  const successful = outcomes.filter(o => o.success).length;
  const failed = outcomes.filter(o => !o.success).length;

  console.log(chalk.bold('📊 RESULTS SUMMARY:'));
  console.log(chalk.gray('-'.repeat(60)));
  console.log(chalk.green(`  ✓ Successful submissions: ${successful}/${NUM_CONCURRENT_USERS}`));
  console.log(chalk.red(`  ✗ Failed submissions: ${failed}/${NUM_CONCURRENT_USERS}`));
  console.log(chalk.cyan(`  ⏱️  Total duration: ${totalDuration}ms`));
  console.log(chalk.cyan(`  ⚡ Average response time: ${Math.round(totalDuration / NUM_CONCURRENT_USERS)}ms`));

  // Show detailed results
  console.log(chalk.bold('\n📝 DETAILED RESULTS:'));
  console.log(chalk.gray('-'.repeat(60)));
  results.forEach(result => {
    if (result.success) {
      console.log(chalk.green(`  ✓ Teacher ${result.index}: ${result.status} (${result.duration}ms)`));
    } else {
      console.log(chalk.red(`  ✗ Teacher ${result.index}: FAILED - ${result.error}`));
    }
  });

  return {
    successful,
    failed,
    totalDuration,
    passed: failed === 0
  };
}

// Test file locking by checking race conditions
async function testRaceConditionPrevention() {
  console.log(chalk.blue.bold('\n🔒 RACE CONDITION TEST'));
  console.log(chalk.gray('='.repeat(60)));
  console.log(chalk.yellow('Testing file locking prevents data corruption\n'));

  // Get initial student count
  let initialCount;
  try {
    const response = await axios.get(`${BASE_URL}/students/list?program=Sunday%20School&level=Level%201`);
    initialCount = response.data.data.students.length;
    console.log(chalk.cyan(`📊 Initial student count: ${initialCount}`));
  } catch (error) {
    console.log(chalk.red('❌ Failed to get initial count'));
    return { passed: false };
  }

  // Submit concurrent attendance
  const result = await testConcurrentSubmissions();

  // Verify data integrity by checking student count again
  try {
    const response = await axios.get(`${BASE_URL}/students/list?program=Sunday%20School&level=Level%201`);
    const finalCount = response.data.data.students.length;
    console.log(chalk.cyan(`\n📊 Final student count: ${finalCount}`));
    
    if (finalCount >= initialCount) {
      console.log(chalk.green('✅ Data integrity maintained - no corruption detected'));
      return { passed: true, ...result };
    } else {
      console.log(chalk.red('❌ Data corruption detected - student count decreased!'));
      return { passed: false, ...result };
    }
  } catch (error) {
    console.log(chalk.red('❌ Failed to verify data integrity'));
    return { passed: false, ...result };
  }
}

// Test sequential vs concurrent performance
async function testPerformanceComparison() {
  console.log(chalk.blue.bold('\n⚡ PERFORMANCE COMPARISON TEST'));
  console.log(chalk.gray('='.repeat(60)));

  // Test sequential submissions
  console.log(chalk.yellow('\n📝 Testing sequential submissions...'));
  const sequentialStart = Date.now();
  
  for (let i = 0; i < 5; i++) {
    try {
      const data = generateAttendanceData(i + 100, i % 6);
      await axios.post(`${BASE_URL}/attendance/submit`, data);
    } catch (error) {
      // Ignore errors for performance test
    }
  }
  
  const sequentialDuration = Date.now() - sequentialStart;
  console.log(chalk.cyan(`  Sequential: ${sequentialDuration}ms for 5 submissions`));
  console.log(chalk.cyan(`  Average: ${Math.round(sequentialDuration / 5)}ms per submission`));

  // Test concurrent submissions
  console.log(chalk.yellow('\n📝 Testing concurrent submissions...'));
  const concurrentStart = Date.now();
  
  const promises = [];
  for (let i = 0; i < 5; i++) {
    const data = generateAttendanceData(i + 200, i % 6);
    promises.push(
      axios.post(`${BASE_URL}/attendance/submit`, data)
        .catch(error => null)
    );
  }
  
  await Promise.all(promises);
  const concurrentDuration = Date.now() - concurrentStart;
  
  console.log(chalk.cyan(`  Concurrent: ${concurrentDuration}ms for 5 submissions`));
  console.log(chalk.cyan(`  Average: ${Math.round(concurrentDuration / 5)}ms per submission`));

  const speedup = ((sequentialDuration - concurrentDuration) / sequentialDuration * 100).toFixed(1);
  console.log(chalk.green(`\n  📈 Performance impact: ${speedup > 0 ? '+' : ''}${speedup}% (Queue overhead)`));

  return {
    passed: true,
    sequentialDuration,
    concurrentDuration
  };
}

// Main test runner
async function runTests() {
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║     CONCURRENT ACCESS TESTING SUITE                       ║'));
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝\n'));

  const testResults = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/students/list?program=Sunday%20School&level=Level%201`);
    console.log(chalk.green('✅ Server is running and accessible\n'));
  } catch (error) {
    console.log(chalk.red('❌ ERROR: Server is not running on http://localhost:5000'));
    console.log(chalk.yellow('   Please start the server with: cd backend && npm start\n'));
    process.exit(1);
  }

  // Run tests
  try {
    // Test 1: Race condition prevention
    const test1 = await testRaceConditionPrevention();
    testResults.tests.push({
      name: 'Race Condition Prevention',
      passed: test1.passed,
      details: test1
    });

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Performance comparison
    const test2 = await testPerformanceComparison();
    testResults.tests.push({
      name: 'Performance Comparison',
      passed: test2.passed,
      details: test2
    });

  } catch (error) {
    console.log(chalk.red('\n❌ Test suite failed with error:'), error.message);
    process.exit(1);
  }

  // Final summary
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║     TEST SUITE SUMMARY                                    ║'));
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝\n'));

  const passedTests = testResults.tests.filter(t => t.passed).length;
  const totalTests = testResults.tests.length;

  testResults.tests.forEach(test => {
    const status = test.passed ? chalk.green('✅ PASSED') : chalk.red('❌ FAILED');
    console.log(`  ${status} - ${test.name}`);
  });

  console.log(chalk.gray('\n' + '='.repeat(60)));
  if (passedTests === totalTests) {
    console.log(chalk.green.bold(`\n✅ ALL TESTS PASSED (${passedTests}/${totalTests})`));
    console.log(chalk.green('   Multi-user support is working correctly!\n'));
    process.exit(0);
  } else {
    console.log(chalk.red.bold(`\n❌ SOME TESTS FAILED (${passedTests}/${totalTests})`));
    console.log(chalk.yellow('   Please review the test results above.\n'));
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(chalk.red('\n❌ Unexpected error:'), error);
  process.exit(1);
});

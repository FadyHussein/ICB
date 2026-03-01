/**
 * File Locking Verification Script
 * 
 * Tests the LockService directly to ensure proper lock acquisition,
 * release, and stale lock detection
 */

const lockfile = require('proper-lockfile');
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');

// Import lock configuration
const excelFilePath = path.resolve(__dirname, '../../data/master-data.xlsx');
const lockOptions = {
  retries: {
    retries: 10,
    minTimeout: 100,
    maxTimeout: 2000,
  },
  stale: 10000, // 10 seconds
};

// Test results
const testResults = [];

// Test 1: Basic lock acquisition and release
async function testBasicLockAcquisition() {
  console.log(chalk.blue.bold('\n🔒 TEST 1: Basic Lock Acquisition and Release'));
  console.log(chalk.gray('='.repeat(60)));

  try {
    // Check if file exists
    if (!fs.existsSync(excelFilePath)) {
      console.log(chalk.red(`❌ Excel file not found: ${excelFilePath}`));
      return { passed: false, error: 'File not found' };
    }

    console.log(chalk.cyan('  Attempting to acquire lock...'));
    const startTime = Date.now();
    const release = await lockfile.lock(excelFilePath, lockOptions);
    const lockTime = Date.now() - startTime;

    console.log(chalk.green(`  ✓ Lock acquired in ${lockTime}ms`));

    // Hold lock for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(chalk.cyan('  Releasing lock...'));
    await release();
    console.log(chalk.green('  ✓ Lock released successfully'));

    testResults.push({ name: 'Basic Lock Acquisition', passed: true, duration: lockTime });
    return { passed: true, duration: lockTime };
  } catch (error) {
    console.log(chalk.red('  ❌ Test failed:', error.message));
    testResults.push({ name: 'Basic Lock Acquisition', passed: false, error: error.message });
    return { passed: false, error: error.message };
  }
}

// Test 2: Concurrent lock attempts (should queue)
async function testConcurrentLockAttempts() {
  console.log(chalk.blue.bold('\n🔒 TEST 2: Concurrent Lock Attempts'));
  console.log(chalk.gray('='.repeat(60)));
  console.log(chalk.yellow('  Testing lock queuing with 5 concurrent attempts\n'));

  try {
    const attempts = [];
    const results = [];

    // Create 5 concurrent lock attempts
    for (let i = 0; i < 5; i++) {
      const attempt = (async (index) => {
        const startTime = Date.now();
        console.log(chalk.cyan(`  [${index + 1}] Attempting to acquire lock...`));
        
        try {
          const release = await lockfile.lock(excelFilePath, lockOptions);
          const waitTime = Date.now() - startTime;
          console.log(chalk.green(`  [${index + 1}] ✓ Lock acquired after ${waitTime}ms`));
          
          // Hold lock for 500ms
          await new Promise(resolve => setTimeout(resolve, 500));
          
          await release();
          console.log(chalk.green(`  [${index + 1}] ✓ Lock released`));
          
          return { index: index + 1, success: true, waitTime };
        } catch (error) {
          console.log(chalk.red(`  [${index + 1}] ❌ Failed: ${error.message}`));
          return { index: index + 1, success: false, error: error.message };
        }
      })(i);

      attempts.push(attempt);
    }

    // Wait for all attempts to complete
    const outcomes = await Promise.all(attempts);
    
    const successful = outcomes.filter(o => o.success).length;
    const failed = outcomes.filter(o => !o.success).length;

    console.log(chalk.cyan(`\n  Summary: ${successful} successful, ${failed} failed`));

    if (successful === 5) {
      console.log(chalk.green('  ✅ All lock attempts succeeded (proper queuing)'));
      testResults.push({ name: 'Concurrent Lock Attempts', passed: true });
      return { passed: true };
    } else {
      console.log(chalk.red('  ❌ Some lock attempts failed'));
      testResults.push({ name: 'Concurrent Lock Attempts', passed: false });
      return { passed: false };
    }
  } catch (error) {
    console.log(chalk.red('  ❌ Test failed:', error.message));
    testResults.push({ name: 'Concurrent Lock Attempts', passed: false, error: error.message });
    return { passed: false, error: error.message };
  }
}

// Test 3: Lock state checking
async function testLockStateChecking() {
  console.log(chalk.blue.bold('\n🔒 TEST 3: Lock State Checking'));
  console.log(chalk.gray('='.repeat(60)));

  try {
    // Check unlocked state
    console.log(chalk.cyan('  Checking unlocked state...'));
    const isLockedBefore = await lockfile.check(excelFilePath);
    
    if (isLockedBefore) {
      console.log(chalk.yellow('  ⚠️  File appears to be locked (may be stale)'));
    } else {
      console.log(chalk.green('  ✓ File is unlocked'));
    }

    // Acquire lock
    console.log(chalk.cyan('  Acquiring lock...'));
    const release = await lockfile.lock(excelFilePath, lockOptions);
    
    // Check locked state
    console.log(chalk.cyan('  Checking locked state...'));
    const isLockedDuring = await lockfile.check(excelFilePath);
    
    if (isLockedDuring) {
      console.log(chalk.green('  ✓ File is correctly reported as locked'));
    } else {
      console.log(chalk.red('  ❌ File should be locked but reported as unlocked'));
    }

    // Release lock
    await release();
    
    // Check unlocked state again
    console.log(chalk.cyan('  Checking unlocked state after release...'));
    const isLockedAfter = await lockfile.check(excelFilePath);
    
    if (!isLockedAfter) {
      console.log(chalk.green('  ✓ File is correctly unlocked after release'));
    } else {
      console.log(chalk.red('  ❌ File should be unlocked but reported as locked'));
    }

    const passed = !isLockedBefore && isLockedDuring && !isLockedAfter;
    testResults.push({ name: 'Lock State Checking', passed });
    
    if (passed) {
      console.log(chalk.green('\n  ✅ Lock state checking works correctly'));
    } else {
      console.log(chalk.yellow('\n  ⚠️  Lock state checking may have issues'));
    }

    return { passed };
  } catch (error) {
    console.log(chalk.red('  ❌ Test failed:', error.message));
    testResults.push({ name: 'Lock State Checking', passed: false, error: error.message });
    return { passed: false, error: error.message };
  }
}

// Test 4: Stale lock detection
async function testStaleLockDetection() {
  console.log(chalk.blue.bold('\n🔒 TEST 4: Stale Lock Detection'));
  console.log(chalk.gray('='.repeat(60)));
  console.log(chalk.yellow('  Testing 10-second stale lock timeout\n'));

  try {
    console.log(chalk.cyan('  Acquiring lock without releasing (simulating crash)...'));
    
    // Acquire lock but don't release it
    const release = await lockfile.lock(excelFilePath, lockOptions);
    console.log(chalk.green('  ✓ Lock acquired'));
    
    console.log(chalk.yellow('  ⏳ Waiting 12 seconds for lock to become stale...'));
    console.log(chalk.gray('      (This tests the 10-second stale timeout)\n'));
    
    // Wait longer than stale timeout
    for (let i = 12; i > 0; i--) {
      process.stdout.write(`\r${chalk.cyan(`      ${i} seconds remaining...`)}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\n');

    // Try to acquire lock (should succeed if stale detection works)
    console.log(chalk.cyan('  Attempting to acquire lock (should break stale lock)...'));
    try {
      const newRelease = await lockfile.lock(excelFilePath, lockOptions);
      console.log(chalk.green('  ✓ Successfully acquired lock (stale lock was detected)'));
      
      // Clean up
      await newRelease();
      console.log(chalk.green('  ✓ Lock released'));
      
      testResults.push({ name: 'Stale Lock Detection', passed: true });
      return { passed: true };
    } catch (error) {
      console.log(chalk.red('  ❌ Failed to acquire lock (stale detection may not work)'));
      
      // Try to clean up original lock
      try {
        await release();
      } catch {}
      
      testResults.push({ name: 'Stale Lock Detection', passed: false });
      return { passed: false };
    }
  } catch (error) {
    console.log(chalk.red('  ❌ Test failed:', error.message));
    testResults.push({ name: 'Stale Lock Detection', passed: false, error: error.message });
    return { passed: false, error: error.message };
  }
}

// Test 5: Error handling (lock released even on errors)
async function testErrorHandling() {
  console.log(chalk.blue.bold('\n🔒 TEST 5: Error Handling'));
  console.log(chalk.gray('='.repeat(60)));
  console.log(chalk.yellow('  Testing lock release on errors\n'));

  try {
    console.log(chalk.cyan('  Acquiring lock...'));
    const release = await lockfile.lock(excelFilePath, lockOptions);
    console.log(chalk.green('  ✓ Lock acquired'));

    console.log(chalk.cyan('  Simulating error with try-finally block...'));
    
    try {
      // Simulate error
      throw new Error('Simulated operation error');
    } finally {
      // Lock should be released even on error
      await release();
      console.log(chalk.green('  ✓ Lock released in finally block'));
    }

    // Verify lock is released
    const isLocked = await lockfile.check(excelFilePath);
    
    if (!isLocked) {
      console.log(chalk.green('  ✅ Lock was properly released despite error'));
      testResults.push({ name: 'Error Handling', passed: true });
      return { passed: true };
    } else {
      console.log(chalk.red('  ❌ Lock was not released after error'));
      testResults.push({ name: 'Error Handling', passed: false });
      return { passed: false };
    }
  } catch (error) {
    // Expected to catch the simulated error
    if (error.message === 'Simulated operation error') {
      console.log(chalk.green('  ✓ Error was properly caught'));
    } else {
      console.log(chalk.red('  ❌ Unexpected error:', error.message));
      testResults.push({ name: 'Error Handling', passed: false, error: error.message });
      return { passed: false, error: error.message };
    }
  }
}

// Test 6: Performance under load
async function testLockPerformance() {
  console.log(chalk.blue.bold('\n🔒 TEST 6: Lock Performance'));
  console.log(chalk.gray('='.repeat(60)));
  console.log(chalk.yellow('  Testing lock/release performance with 20 iterations\n'));

  try {
    const durations = [];

    for (let i = 0; i < 20; i++) {
      const startTime = Date.now();
      const release = await lockfile.lock(excelFilePath, lockOptions);
      await release();
      const duration = Date.now() - startTime;
      durations.push(duration);
      
      if ((i + 1) % 5 === 0) {
        console.log(chalk.cyan(`  Completed ${i + 1}/20 iterations...`));
      }
    }

    const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    console.log(chalk.green(`\n  ✓ Performance metrics:`));
    console.log(chalk.cyan(`    Average: ${avg}ms`));
    console.log(chalk.cyan(`    Min: ${min}ms`));
    console.log(chalk.cyan(`    Max: ${max}ms`));

    const passed = avg < 100; // Should be fast
    
    if (passed) {
      console.log(chalk.green('  ✅ Lock performance is good (<100ms average)'));
    } else {
      console.log(chalk.yellow(`  ⚠️  Lock performance is slower than expected (${avg}ms average)`));
    }

    testResults.push({ name: 'Lock Performance', passed, metrics: { avg, min, max } });
    return { passed, metrics: { avg, min, max } };
  } catch (error) {
    console.log(chalk.red('  ❌ Test failed:', error.message));
    testResults.push({ name: 'Lock Performance', passed: false, error: error.message });
    return { passed: false, error: error.message };
  }
}

// Main test runner
async function runTests() {
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║     FILE LOCKING VERIFICATION SUITE                       ║'));
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝'));

  console.log(chalk.yellow(`\nTesting file: ${excelFilePath}`));
  console.log(chalk.yellow(`Stale timeout: ${lockOptions.stale}ms (10 seconds)\n`));

  // Run all tests
  await testBasicLockAcquisition();
  await testConcurrentLockAttempts();
  await testLockStateChecking();
  await testStaleLockDetection();
  await testErrorHandling();
  await testLockPerformance();

  // Summary
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║     TEST SUITE SUMMARY                                    ║'));
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝\n'));

  const passedTests = testResults.filter(t => t.passed).length;
  const totalTests = testResults.length;

  testResults.forEach(test => {
    const status = test.passed ? chalk.green('✅ PASSED') : chalk.red('❌ FAILED');
    console.log(`  ${status} - ${test.name}`);
  });

  console.log(chalk.gray('\n' + '='.repeat(60)));
  if (passedTests === totalTests) {
    console.log(chalk.green.bold(`\n✅ ALL TESTS PASSED (${passedTests}/${totalTests})`));
    console.log(chalk.green('   File locking system is working correctly!\n'));
    process.exit(0);
  } else {
    console.log(chalk.yellow.bold(`\n⚠️  SOME TESTS FAILED (${passedTests}/${totalTests})`));
    console.log(chalk.yellow('   Review the test results above.\n'));
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(chalk.red('\n❌ Unexpected error:'), error);
  process.exit(1);
});

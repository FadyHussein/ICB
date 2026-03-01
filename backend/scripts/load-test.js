/**
 * Load Testing Script
 * 
 * Simulates realistic multi-user load patterns with various endpoints
 * and measures system performance under concurrent access
 */

const axios = require('axios');
const chalk = require('chalk');

const BASE_URL = 'http://localhost:5000/api/v1';
const TEST_DURATION_MS = 30000; // 30 seconds
const CONCURRENT_USERS = 10;

// Performance metrics
const metrics = {
  requests: {
    total: 0,
    successful: 0,
    failed: 0,
    byEndpoint: {}
  },
  responseTimes: [],
  errors: [],
  startTime: null,
  endTime: null
};

// Simulate different user actions
const userActions = [
  {
    name: 'GET Students',
    weight: 40, // 40% of requests
    action: async (userId) => {
      const level = (userId % 6) + 1;
      return axios.get(`${BASE_URL}/students/list?program=Sunday%20School&level=Level%20${level}`);
    }
  },
  {
    name: 'GET Teachers',
    weight: 30, // 30% of requests
    action: async (userId) => {
      const level = (userId % 6) + 1;
      return axios.get(`${BASE_URL}/teachers/list?program=Sunday%20School&level=Level%20${level}`);
    }
  },
  {
    name: 'POST Attendance',
    weight: 25, // 25% of requests
    action: async (userId) => {
      const level = (userId % 6) + 1;
      const data = {
        weekDate: new Date().toISOString().split('T')[0],
        program: 'Sunday School',
        level: `Level ${level}`,
        teacherName: `Load Test Teacher ${userId}`,
        attendanceRecords: [
          {
            studentId: `SS-L${level}-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
            status: Math.random() > 0.2 ? 'present' : 'absent',
            hasOfferingBox: Math.random() > 0.5,
            notes: `Load test ${userId}-${Date.now()}`
          }
        ]
      };
      return axios.post(`${BASE_URL}/attendance/submit`, data);
    }
  },
  {
    name: 'GET Config',
    weight: 5, // 5% of requests
    action: async () => {
      return axios.get(`${BASE_URL}/config/programs`);
    }
  }
];

// Select random action based on weights
function selectRandomAction() {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const action of userActions) {
    cumulative += action.weight;
    if (random <= cumulative) {
      return action;
    }
  }
  
  return userActions[0];
}

// Record metrics for a request
function recordMetric(endpoint, success, duration, error = null) {
  metrics.requests.total++;
  
  if (success) {
    metrics.requests.successful++;
    metrics.responseTimes.push(duration);
  } else {
    metrics.requests.failed++;
    metrics.errors.push({ endpoint, error: error?.message || 'Unknown error', timestamp: Date.now() });
  }
  
  if (!metrics.requests.byEndpoint[endpoint]) {
    metrics.requests.byEndpoint[endpoint] = { total: 0, successful: 0, failed: 0, responseTimes: [] };
  }
  
  metrics.requests.byEndpoint[endpoint].total++;
  if (success) {
    metrics.requests.byEndpoint[endpoint].successful++;
    metrics.requests.byEndpoint[endpoint].responseTimes.push(duration);
  } else {
    metrics.requests.byEndpoint[endpoint].failed++;
  }
}

// Simulate a single user making requests
async function simulateUser(userId, stopSignal) {
  while (!stopSignal.stop) {
    const action = selectRandomAction();
    const startTime = Date.now();
    
    try {
      await action.action(userId);
      const duration = Date.now() - startTime;
      recordMetric(action.name, true, duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      recordMetric(action.name, false, duration, error);
    }
    
    // Random delay between requests (100-500ms)
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
  }
}

// Calculate statistics
function calculateStats(values) {
  if (values.length === 0) return { min: 0, max: 0, avg: 0, median: 0, p95: 0, p99: 0 };
  
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: Math.round(sum / sorted.length),
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };
}

// Display metrics
function displayMetrics() {
  const duration = (metrics.endTime - metrics.startTime) / 1000;
  const stats = calculateStats(metrics.responseTimes);
  const successRate = ((metrics.requests.successful / metrics.requests.total) * 100).toFixed(2);
  const throughput = (metrics.requests.total / duration).toFixed(2);

  console.log(chalk.blue.bold('\n📊 LOAD TEST RESULTS'));
  console.log(chalk.gray('='.repeat(60)));
  
  console.log(chalk.bold('\n⏱️  OVERALL METRICS:'));
  console.log(chalk.cyan(`  Duration: ${duration.toFixed(2)}s`));
  console.log(chalk.cyan(`  Total Requests: ${metrics.requests.total}`));
  console.log(chalk.green(`  ✓ Successful: ${metrics.requests.successful}`));
  console.log(chalk.red(`  ✗ Failed: ${metrics.requests.failed}`));
  console.log(chalk.cyan(`  Success Rate: ${successRate}%`));
  console.log(chalk.cyan(`  Throughput: ${throughput} req/s`));

  console.log(chalk.bold('\n📈 RESPONSE TIME STATISTICS (ms):'));
  console.log(chalk.cyan(`  Min: ${stats.min}ms`));
  console.log(chalk.cyan(`  Max: ${stats.max}ms`));
  console.log(chalk.cyan(`  Average: ${stats.avg}ms`));
  console.log(chalk.cyan(`  Median: ${stats.median}ms`));
  console.log(chalk.cyan(`  95th Percentile: ${stats.p95}ms`));
  console.log(chalk.cyan(`  99th Percentile: ${stats.p99}ms`));

  console.log(chalk.bold('\n🎯 BREAKDOWN BY ENDPOINT:'));
  Object.entries(metrics.requests.byEndpoint).forEach(([endpoint, data]) => {
    const endpointStats = calculateStats(data.responseTimes);
    const endpointSuccessRate = ((data.successful / data.total) * 100).toFixed(1);
    
    console.log(chalk.yellow(`\n  ${endpoint}:`));
    console.log(chalk.gray(`    Requests: ${data.total} (${((data.total / metrics.requests.total) * 100).toFixed(1)}%)`));
    console.log(chalk.gray(`    Success Rate: ${endpointSuccessRate}%`));
    console.log(chalk.gray(`    Avg Response: ${endpointStats.avg}ms`));
    console.log(chalk.gray(`    P95 Response: ${endpointStats.p95}ms`));
  });

  if (metrics.errors.length > 0) {
    console.log(chalk.bold.red('\n⚠️  ERRORS:'));
    const errorGroups = {};
    metrics.errors.forEach(err => {
      const key = `${err.endpoint}: ${err.error}`;
      errorGroups[key] = (errorGroups[key] || 0) + 1;
    });
    
    Object.entries(errorGroups).forEach(([error, count]) => {
      console.log(chalk.red(`  ${error} (${count}x)`));
    });
  }

  // Performance assessment
  console.log(chalk.bold('\n🔍 PERFORMANCE ASSESSMENT:'));
  const assessments = [];
  
  if (successRate >= 99) {
    assessments.push(chalk.green('  ✅ Excellent reliability (99%+ success rate)'));
  } else if (successRate >= 95) {
    assessments.push(chalk.yellow('  ⚠️  Good reliability (95%+ success rate)'));
  } else {
    assessments.push(chalk.red('  ❌ Poor reliability (<95% success rate)'));
  }
  
  if (stats.p95 < 500) {
    assessments.push(chalk.green('  ✅ Excellent response time (P95 < 500ms)'));
  } else if (stats.p95 < 1000) {
    assessments.push(chalk.yellow('  ⚠️  Acceptable response time (P95 < 1000ms)'));
  } else {
    assessments.push(chalk.red('  ❌ Slow response time (P95 > 1000ms)'));
  }
  
  if (throughput >= 10) {
    assessments.push(chalk.green(`  ✅ Good throughput (${throughput} req/s)`));
  } else if (throughput >= 5) {
    assessments.push(chalk.yellow(`  ⚠️  Moderate throughput (${throughput} req/s)`));
  } else {
    assessments.push(chalk.red(`  ❌ Low throughput (${throughput} req/s)`));
  }

  assessments.forEach(a => console.log(a));

  return {
    passed: successRate >= 95 && stats.p95 < 1000,
    metrics: {
      duration,
      totalRequests: metrics.requests.total,
      successRate: parseFloat(successRate),
      throughput: parseFloat(throughput),
      responseTime: stats
    }
  };
}

// Main load test runner
async function runLoadTest() {
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║     MULTI-USER LOAD TEST                                  ║'));
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝\n'));

  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/students/list?program=Sunday%20School&level=Level%201`);
    console.log(chalk.green('✅ Server is running and accessible\n'));
  } catch (error) {
    console.log(chalk.red('❌ ERROR: Server is not running on http://localhost:5000'));
    console.log(chalk.yellow('   Please start the server with: cd backend && npm start\n'));
    process.exit(1);
  }

  console.log(chalk.yellow(`🚀 Starting load test with ${CONCURRENT_USERS} concurrent users...`));
  console.log(chalk.yellow(`⏱️  Duration: ${TEST_DURATION_MS / 1000}s`));
  console.log(chalk.gray('   Users will make random requests to different endpoints\n'));

  // Start metrics collection
  metrics.startTime = Date.now();
  const stopSignal = { stop: false };

  // Launch concurrent users
  const userPromises = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    userPromises.push(simulateUser(i + 1, stopSignal));
  }

  // Progress indicator
  const progressInterval = setInterval(() => {
    const elapsed = ((Date.now() - metrics.startTime) / 1000).toFixed(1);
    const progress = ((elapsed / (TEST_DURATION_MS / 1000)) * 100).toFixed(0);
    process.stdout.write(`\r${chalk.cyan(`⏳ Progress: ${elapsed}s / ${TEST_DURATION_MS / 1000}s (${progress}%) - Requests: ${metrics.requests.total}`)}`);
  }, 1000);

  // Wait for test duration
  await new Promise(resolve => setTimeout(resolve, TEST_DURATION_MS));

  // Stop all users
  stopSignal.stop = true;
  clearInterval(progressInterval);
  console.log('\n');

  // Wait for all users to complete their current requests
  console.log(chalk.yellow('⏳ Waiting for active requests to complete...'));
  await Promise.all(userPromises);

  metrics.endTime = Date.now();

  // Display results
  const result = displayMetrics();

  console.log(chalk.gray('\n' + '='.repeat(60)));
  if (result.passed) {
    console.log(chalk.green.bold('\n✅ LOAD TEST PASSED'));
    console.log(chalk.green('   System performs well under concurrent load\n'));
    process.exit(0);
  } else {
    console.log(chalk.yellow.bold('\n⚠️  LOAD TEST COMPLETED WITH WARNINGS'));
    console.log(chalk.yellow('   Review performance metrics above\n'));
    process.exit(0);
  }
}

// Run the load test
runLoadTest().catch(error => {
  console.error(chalk.red('\n❌ Unexpected error:'), error);
  process.exit(1);
});

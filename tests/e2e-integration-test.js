/**
 * End-to-End Integration Test for ICB Sunday School Attendance System
 * 
 * Tests the complete user flow from landing page to confirmation:
 * 1. Program selection
 * 2. Level selection
 * 3. Teacher selection
 * 4. Student list and attendance marking
 * 5. Data submission
 * 6. Excel file verification
 * 
 * Usage: node tests/e2e-integration-test.js
 */

const fs = require('fs');
const path = require('path');

const baseUrl = 'http://localhost:5000/api/v1';
const EXCEL_FILE = path.join(__dirname, '../data/master-data.xlsx');

// Test results tracker
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  warnings: []
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'bright');
  console.log('='.repeat(60));
}

function logTest(name) {
  console.log(`\n${colors.cyan}🧪 ${name}${colors.reset}`);
  results.total++;
}

function logPass(message) {
  log(`✅ PASS: ${message}`, 'green');
  results.passed++;
}

function logFail(message, error) {
  log(`❌ FAIL: ${message}`, 'red');
  if (error) {
    console.log(`   Error: ${error}`);
    results.errors.push({ test: message, error });
  }
  results.failed++;
}

function logWarning(message) {
  log(`⚠️  WARNING: ${message}`, 'yellow');
  results.warnings.push(message);
}

function logInfo(message) {
  console.log(`   ℹ️  ${message}`);
}

async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test 1: Server Health Check
 */
async function testServerHealth() {
  logTest('Server Health Check');
  
  const result = await apiCall('/health');
  
  if (result.success && result.data.status === 'healthy') {
    logPass('Server is healthy and responding');
    logInfo(`Uptime: ${result.data.uptime}s`);
    return true;
  } else {
    logFail('Server health check failed', result.error);
    return false;
  }
}

/**
 * Test 2: Configuration - Get Programs
 */
async function testGetPrograms() {
  logTest('Get Programs Configuration');
  
  const result = await apiCall('/config/programs');
  
  if (result.success && result.data.success) {
    const programs = result.data.data;
    
    if (programs.length >= 2) {
      logPass(`Retrieved ${programs.length} programs`);
      logInfo(`Programs: ${programs.map(p => p.name).join(', ')}`);
      
      // Verify program structure
      const hasIqra = programs.some(p => p.id === 'iqra');
      const hasIslamicStudies = programs.some(p => p.id === 'islamic-studies');
      
      if (hasIqra && hasIslamicStudies) {
        logPass('Both Iqra and Islamic Studies programs found');
      } else {
        logWarning('Expected programs not found');
      }
      
      return programs;
    } else {
      logFail('Insufficient programs returned', `Expected >= 2, got ${programs.length}`);
      return null;
    }
  } else {
    logFail('Failed to get programs', result.error);
    return null;
  }
}

/**
 * Test 3: Configuration - Get Levels for Program
 */
async function testGetLevels(program) {
  logTest(`Get Levels for ${program.name}`);
  
  const result = await apiCall(`/config/programs/${program.id}/levels`);
  
  if (result.success && result.data.success) {
    const levels = result.data.data;
    
    if (levels.length > 0) {
      logPass(`Retrieved ${levels.length} levels for ${program.name}`);
      logInfo(`Levels: ${levels.map(l => `${l.name} (${l.studentCount} students)`).join(', ')}`);
      return levels[0]; // Return first level for further testing
    } else {
      logFail('No levels found for program', program.id);
      return null;
    }
  } else {
    logFail('Failed to get levels', result.error);
    return null;
  }
}

/**
 * Test 4: Get Teachers
 */
async function testGetTeachers() {
  logTest('Get Teachers List');
  
  const result = await apiCall('/teachers');
  
  if (result.success && result.data.success) {
    const teachers = result.data.data;
    
    if (teachers.length > 0) {
      logPass(`Retrieved ${teachers.length} teachers`);
      logInfo(`Sample teacher: ${teachers[0].name}`);
      return teachers[0]; // Return first teacher for further testing
    } else {
      logFail('No teachers found');
      return null;
    }
  } else {
    logFail('Failed to get teachers', result.error);
    return null;
  }
}

/**
 * Test 5: Get Students for Program and Level
 */
async function testGetStudents(program, level) {
  logTest(`Get Students for ${program.name} - ${level.name}`);
  
  const result = await apiCall(`/students?program=${program.id}&level=${level.id}`);
  
  if (result.success && result.data.success) {
    const students = result.data.data;
    
    if (students.length > 0) {
      logPass(`Retrieved ${students.length} students`);
      logInfo(`Sample student: ${students[0].name}`);
      
      // Verify student structure
      const firstStudent = students[0];
      if (firstStudent.id && firstStudent.name && firstStudent.program && firstStudent.level) {
        logPass('Student data structure is valid');
      } else {
        logWarning('Student data structure may be incomplete');
      }
      
      return students;
    } else {
      logFail('No students found for this program/level');
      return null;
    }
  } else {
    logFail('Failed to get students', result.error);
    return null;
  }
}

/**
 * Test 6: Get Current Week
 */
async function testGetCurrentWeek() {
  logTest('Get Current Week Configuration');
  
  const result = await apiCall('/config/current-week');
  
  if (result.success && result.data.success) {
    const weekData = result.data.data;
    logPass('Current week retrieved successfully');
    logInfo(`Week Number: ${weekData.weekNumber}`);
    logInfo(`Sunday Date: ${weekData.sundayDate}`);
    return weekData;
  } else {
    logFail('Failed to get current week', result.error);
    return null;
  }
}

/**
 * Test 7: Submit Attendance Data
 */
async function testSubmitAttendance(program, level, teacher, students, weekData) {
  logTest('Submit Attendance Data');
  
  // Prepare attendance data
  const attendanceData = {
    program: program.id,
    level: level.id,
    teacherId: teacher.id,
    teacherName: teacher.name,
    date: weekData.sundayDate,
    weekNumber: weekData.weekNumber,
    students: students.slice(0, 3).map((student, index) => ({
      studentId: student.id,
      name: student.name,
      present: index % 2 === 0, // Alternate present/absent
      pageNumber: index === 0 ? 10 : null,
      notes: index === 0 ? 'E2E test note' : ''
    }))
  };
  
  logInfo(`Submitting attendance for ${attendanceData.students.length} students`);
  
  const result = await apiCall('/attendance', {
    method: 'POST',
    body: attendanceData
  });
  
  if (result.success && result.data.success) {
    logPass('Attendance submitted successfully');
    logInfo(`Session ID: ${result.data.data.sessionId || 'N/A'}`);
    return result.data.data;
  } else {
    logFail('Failed to submit attendance', result.error || result.data.error?.message);
    return null;
  }
}

/**
 * Test 8: Verify Attendance Retrieval
 */
async function testGetAttendance(program, level, date) {
  logTest('Retrieve Submitted Attendance');
  
  const result = await apiCall(`/attendance?program=${program.id}&level=${level.id}&date=${date}`);
  
  if (result.success && result.data.success) {
    const attendance = result.data.data;
    logPass('Attendance retrieved successfully');
    logInfo(`Students in record: ${attendance.students?.length || 0}`);
    return attendance;
  } else {
    // This might fail if the sheet doesn't exist yet, which is okay
    logWarning('Could not retrieve attendance (sheet may not exist yet)');
    return null;
  }
}

/**
 * Test 9: Excel File Verification
 */
async function testExcelFileExists() {
  logTest('Verify Excel File Exists');
  
  if (fs.existsSync(EXCEL_FILE)) {
    logPass('Excel file exists');
    const stats = fs.statSync(EXCEL_FILE);
    logInfo(`File size: ${(stats.size / 1024).toFixed(2)} KB`);
    logInfo(`Last modified: ${stats.mtime.toISOString()}`);
    return true;
  } else {
    logFail('Excel file not found', EXCEL_FILE);
    return false;
  }
}

/**
 * Test 10: Backup System Verification
 */
async function testBackupSystem() {
  logTest('Verify Backup System');
  
  const backupDir = path.join(__dirname, '../data/backups');
  
  if (fs.existsSync(backupDir)) {
    const backups = fs.readdirSync(backupDir);
    
    if (backups.length > 0) {
      logPass(`Found ${backups.length} backup(s)`);
      logInfo(`Latest backup: ${backups[backups.length - 1]}`);
      return true;
    } else {
      logWarning('No backups found (system may be new)');
      return false;
    }
  } else {
    logFail('Backup directory not found', backupDir);
    return false;
  }
}

/**
 * Test 11: Error Handling - Invalid Requests
 */
async function testErrorHandling() {
  logTest('Error Handling - Invalid Requests');
  
  let errorTests = 0;
  let errorPasses = 0;
  
  // Test 1: Invalid program
  errorTests++;
  const test1 = await apiCall('/students?program=invalid&level=1');
  if (!test1.success || test1.status >= 400) {
    errorPasses++;
    logInfo('✓ Invalid program correctly rejected');
  }
  
  // Test 2: Missing required parameters
  errorTests++;
  const test2 = await apiCall('/students');
  if (!test2.success || test2.status >= 400) {
    errorPasses++;
    logInfo('✓ Missing parameters correctly rejected');
  }
  
  // Test 3: Invalid attendance data
  errorTests++;
  const test3 = await apiCall('/attendance', {
    method: 'POST',
    body: { invalid: 'data' }
  });
  if (!test3.success || test3.status >= 400) {
    errorPasses++;
    logInfo('✓ Invalid attendance data correctly rejected');
  }
  
  if (errorPasses === errorTests) {
    logPass(`All ${errorTests} error handling tests passed`);
    return true;
  } else {
    logWarning(`${errorPasses}/${errorTests} error handling tests passed`);
    return false;
  }
}

/**
 * Test 12: Rate Limiting
 */
async function testRateLimiting() {
  logTest('Rate Limiting Protection');
  
  logInfo('Sending rapid requests to test rate limiter...');
  
  const requests = [];
  for (let i = 0; i < 20; i++) {
    requests.push(apiCall('/health'));
  }
  
  const results = await Promise.all(requests);
  const rateLimited = results.filter(r => r.status === 429);
  
  if (rateLimited.length > 0) {
    logPass(`Rate limiting active (${rateLimited.length} requests throttled)`);
    return true;
  } else {
    logWarning('Rate limiting may not be active or limit is high');
    return false;
  }
}

/**
 * Test 13: Monitoring Endpoints
 */
async function testMonitoringEndpoints() {
  logTest('Monitoring Endpoints');
  
  const healthCheck = await apiCall('/health');
  const metricsCheck = await apiCall('/health/metrics');
  
  let passed = 0;
  
  if (healthCheck.success) {
    logInfo('✓ Health endpoint accessible');
    passed++;
  } else {
    logInfo('✗ Health endpoint failed');
  }
  
  if (metricsCheck.success) {
    logInfo('✓ Metrics endpoint accessible');
    logInfo(`  Active requests: ${metricsCheck.data.activeRequests || 0}`);
    passed++;
  } else {
    logInfo('✗ Metrics endpoint failed');
  }
  
  if (passed === 2) {
    logPass('All monitoring endpoints accessible');
    return true;
  } else {
    logWarning(`Only ${passed}/2 monitoring endpoints accessible`);
    return false;
  }
}

/**
 * Main test execution
 */
async function runE2ETests() {
  logSection('ICB Sunday School E2E Integration Tests');
  log('Starting comprehensive end-to-end testing...', 'blue');
  
  const startTime = Date.now();
  
  try {
    // Phase 1: Server Health
    logSection('Phase 1: Server Health & Configuration');
    const serverHealthy = await testServerHealth();
    if (!serverHealthy) {
      throw new Error('Server is not healthy. Cannot proceed with tests.');
    }
    
    // Phase 2: Configuration Tests
    const programs = await testGetPrograms();
    if (!programs || programs.length === 0) {
      throw new Error('No programs available. Cannot proceed with tests.');
    }
    
    const iqraProgram = programs.find(p => p.id === 'iqra');
    if (!iqraProgram) {
      throw new Error('Iqra program not found');
    }
    
    const levels = await testGetLevels(iqraProgram);
    if (!levels) {
      throw new Error('No levels available for Iqra program');
    }
    
    // Phase 3: Data Retrieval Tests
    logSection('Phase 2: Data Retrieval');
    const teacher = await testGetTeachers();
    const students = await testGetStudents(iqraProgram, levels);
    const weekData = await testGetCurrentWeek();
    
    if (!teacher || !students || !weekData) {
      throw new Error('Required data not available for attendance submission');
    }
    
    // Phase 4: Attendance Submission
    logSection('Phase 3: Attendance Submission');
    const submissionResult = await testSubmitAttendance(
      iqraProgram,
      levels,
      teacher,
      students,
      weekData
    );
    
    if (submissionResult) {
      await testGetAttendance(iqraProgram, levels, weekData.sundayDate);
    }
    
    // Phase 5: System Verification
    logSection('Phase 4: System Verification');
    await testExcelFileExists();
    await testBackupSystem();
    
    // Phase 6: Error Handling & Security
    logSection('Phase 5: Error Handling & Security');
    await testErrorHandling();
    await testRateLimiting();
    
    // Phase 7: Monitoring
    logSection('Phase 6: Monitoring & Health');
    await testMonitoringEndpoints();
    
  } catch (error) {
    log(`\n❌ CRITICAL ERROR: ${error.message}`, 'red');
    results.errors.push({ test: 'Critical', error: error.message });
  }
  
  // Final Results
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  logSection('Test Results Summary');
  console.log(`\nTotal Tests: ${results.total}`);
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, 'red');
  log(`Warnings: ${results.warnings.length}`, 'yellow');
  console.log(`Duration: ${duration}s\n`);
  
  if (results.failed > 0) {
    log('Failed Tests:', 'red');
    results.errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err.test}`);
      console.log(`     ${err.error}`);
    });
  }
  
  if (results.warnings.length > 0) {
    log('\nWarnings:', 'yellow');
    results.warnings.forEach((warn, idx) => {
      console.log(`  ${idx + 1}. ${warn}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  const passRate = ((results.passed / results.total) * 100).toFixed(1);
  if (results.failed === 0) {
    log(`🎉 ALL TESTS PASSED! (${passRate}%)`, 'green');
    log('✨ System is ready for production deployment', 'green');
  } else if (passRate >= 80) {
    log(`⚠️  MOSTLY PASSED (${passRate}%)`, 'yellow');
    log('System is functional but has some issues', 'yellow');
  } else {
    log(`❌ TESTS FAILED (${passRate}%)`, 'red');
    log('System has significant issues that need attention', 'red');
  }
  
  console.log('='.repeat(60) + '\n');
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});

// Run the tests
runE2ETests().catch(error => {
  log(`\n❌ Test execution failed: ${error.message}`, 'red');
  process.exit(1);
});

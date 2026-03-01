# Multi-User Support Guide

## Overview

The ICB Sunday School attendance tracking system is designed to support concurrent multi-user access through a robust file locking mechanism, operation queuing, and automatic backups. This guide explains how the system handles multiple teachers submitting attendance simultaneously.

## Architecture

### File Locking System

The system uses `proper-lockfile` to implement exclusive file locking with the following characteristics:

- **Lock Type**: Exclusive (only one writer at a time)
- **Stale Timeout**: 10 seconds (automatically breaks stale locks)
- **Retry Strategy**: Up to 10 retries with exponential backoff (100ms - 2000ms)
- **Lock Scope**: Per Excel file (shared data source)

#### How It Works

```typescript
// Lock acquisition flow
1. Request arrives → Operation queued
2. Attempt to acquire lock with retries
3. Lock acquired → Create backup
4. Perform write operation
5. Save workbook
6. Release lock → Next queued operation proceeds
```

### Operation Queuing

All write operations are automatically queued and serialized through the lock mechanism:

- **Read Operations**: Concurrent (cached with 30-second TTL)
- **Write Operations**: Serialized (one at a time)
- **Queue Management**: Automatic via lock retries
- **Timeout**: Operations fail if lock cannot be acquired after ~20 seconds

### Backup System

Every write operation is preceded by an automatic backup:

- **Timing**: Before every write (attendance submission, updates)
- **Storage**: `/data/backups/` directory
- **Naming**: `master-data_YYYYMMDD_HHMMSS.xlsx`
- **Retention**: 50 most recent backups (configurable)
- **Cleanup**: Automatic deletion of old backups

## Expected Behavior

### Concurrent Access Scenarios

#### Scenario 1: Two Teachers Submit Simultaneously

```
Teacher A: Submit attendance → Acquire lock → Write → Release lock
Teacher B: Submit attendance → Wait for lock → Acquire lock → Write → Release lock

Result: Both submissions succeed, Teacher B experiences slight delay (typically 1-3 seconds)
```

#### Scenario 2: Multiple Teachers Reading Students

```
Teacher A: Get students → Read from cache
Teacher B: Get students → Read from cache (concurrent)
Teacher C: Get students → Read from cache (concurrent)

Result: All requests complete simultaneously with minimal delay
```

#### Scenario 3: High Concurrent Load (10+ users)

```
Users 1-10: Submit attendance → Operations queued
Processing: Sequential writes with automatic lock management
Duration: ~1-2 seconds per submission = 10-20 seconds total

Result: All submissions succeed with proportional delays
```

## Performance Characteristics

### Response Times

| Operation Type | Single User | 5 Concurrent | 10 Concurrent |
|----------------|-------------|--------------|---------------|
| Read Students  | 50-100ms    | 50-150ms     | 100-200ms     |
| Submit Attendance | 500-1000ms | 1-3s each    | 2-5s each     |
| Read Teachers  | 50-100ms    | 50-150ms     | 100-200ms     |

### Throughput

- **Read Operations**: 20-50 req/s (cached)
- **Write Operations**: 1-2 req/s (serialized)
- **Mixed Workload**: 5-10 req/s

### Scalability Limits

**Recommended Maximum Concurrent Users**: 10-20 teachers

**Limiting Factors**:
1. File lock serialization (writes are sequential)
2. Excel file I/O performance
3. Network latency (if deployed remotely)

**What Happens at Scale**:
- 10 users: Acceptable delays (1-5s per write)
- 20 users: Noticeable delays (5-10s per write)
- 50+ users: Significant delays (may timeout at 20s)

## Monitoring System Health

### Health Check Endpoint

```bash
GET /api/v1/status/health
```

**Response**:
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2024-02-22T10:30:00.000Z",
  "uptime": 3600,
  "system": {
    "excelFile": {
      "exists": true,
      "size": 45678,
      "modified": "2024-02-22T10:25:00.000Z"
    },
    "lockStatus": {
      "isLocked": false
    },
    "backups": {
      "count": 15,
      "maxBackups": 50,
      "latest": "master-data_20240222_102500.xlsx"
    }
  }
}
```

### Metrics Endpoint

```bash
GET /api/v1/status/metrics
```

Provides system performance metrics including memory usage, uptime, and CPU usage.

### Backup Status

```bash
GET /api/v1/status/backups
```

Lists available backups with size and creation time.

### Log Monitoring

The system logs detailed information about locking operations:

```
[INFO] Excel write operation queued { operationId, sheetName }
[INFO] Lock acquired for write operation { operationId, waitTime }
[INFO] Write operation completed { operationId, totalTime, lockTime, writeTime }
```

**Key Metrics in Logs**:
- `waitTime`: Time spent waiting for lock
- `totalTime`: Total operation duration
- `lockTime`: Time holding the lock
- `operationId`: Unique identifier for tracking

## Troubleshooting

### Issue: Stale Lock

**Symptoms**: All write operations timeout, error message about "file may be in use"

**Cause**: Previous operation crashed without releasing lock

**Solution**: Lock automatically expires after 10 seconds. Wait 15 seconds and retry.

**Prevention**: Enhanced with automatic stale lock detection (already implemented)

### Issue: Slow Response Times

**Symptoms**: Operations taking 10+ seconds

**Possible Causes**:
1. Too many concurrent users (>20)
2. Large Excel file size (>10MB)
3. Network latency
4. System resource constraints

**Solutions**:
1. Limit concurrent access to recommended levels
2. Archive old attendance data periodically
3. Deploy backend closer to users
4. Increase server resources (RAM, CPU)

### Issue: Failed Write Operation

**Symptoms**: 500 error on attendance submission

**Debugging Steps**:
1. Check health endpoint: `GET /api/v1/status/health`
2. Verify Excel file exists and is accessible
3. Check disk space for backups
4. Review server logs for detailed error

**Recovery**:
- Automatic: System continues with next operation
- Manual: Restore from backup if data corruption detected

### Issue: Backup Directory Full

**Symptoms**: Warning about exceeding max backups

**Solution**: Automatic cleanup keeps 50 most recent backups

**Manual Cleanup** (if needed):
```bash
cd data/backups
# Keep only backups from last 7 days
find . -name "master-data_*.xlsx" -mtime +7 -delete
```

## Best Practices

### For Administrators

1. **Monitor Health Regularly**
   - Check `/api/v1/status/health` endpoint
   - Review logs for lock wait times
   - Monitor backup directory size

2. **Capacity Planning**
   - Maximum 10-20 concurrent users
   - Plan for peak usage (Sunday mornings)
   - Consider time-based access patterns

3. **Backup Management**
   - Verify backups are being created
   - Test restoration periodically
   - Archive old backups to external storage

4. **Performance Optimization**
   - Keep Excel file size under 10MB
   - Archive old data annually
   - Run backend on fast SSD storage

### For Teachers

1. **Optimal Usage Times**
   - Submit attendance during class or immediately after
   - Avoid waiting until end of program (all teachers at once)

2. **If System Seems Slow**
   - Wait patiently (delays are normal with concurrent access)
   - Don't refresh or resubmit (duplicates workload)
   - Check with tech team if delays exceed 30 seconds

3. **What to Expect**
   - Slight delays during peak times (1-5 seconds)
   - Immediate response for viewing students/teachers
   - Confirmation message after successful submission

## Testing Multi-User Support

### Manual Testing

**Test Scenario**: 5 Teachers Submit Simultaneously

```bash
# Terminal 1
cd backend/scripts
node test-concurrent-access.js

# Expected Result: All 5 submissions succeed
```

### Load Testing

```bash
# Terminal 1
cd backend/scripts
node load-test.js

# Runs 30-second load test with 10 concurrent users
# Expected: 95%+ success rate, P95 < 1000ms
```

### Lock Verification

```bash
# Terminal 1
cd backend/scripts
node verify-locking.js

# Tests lock acquisition, queuing, and stale detection
# Expected: All 6 tests pass
```

### Backup Testing

```bash
# Terminal 1
cd backend/scripts
node test-backups.js

# Verifies backup creation, integrity, and retention
# Expected: All 6 tests pass
```

## Technical Details

### Lock Configuration

```typescript
// backend/src/config/excel.config.ts
lockOptions: {
  retries: {
    retries: 10,           // Maximum retry attempts
    minTimeout: 100,       // Initial retry delay (ms)
    maxTimeout: 2000,      // Maximum retry delay (ms)
  },
  stale: 10000,           // Stale lock timeout (ms)
}
```

### Cache Configuration

```typescript
// backend/src/services/excel.service.ts
private readonly CACHE_TTL = 30000; // 30 seconds
```

**Why Caching?**
- Reduces lock contention for read operations
- Improves response time for concurrent readers
- Balances freshness with performance

### Rate Limiting

The API includes rate limiting to prevent abuse:

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Applies To**: All endpoints

## Security Considerations

### File Access

- Excel file accessible only by backend server
- No direct file access from frontend
- File locked during writes to prevent corruption

### Backup Security

- Backups stored in protected directory
- Regular cleanup prevents disk exhaustion
- Backups inherit file permissions from original

### Concurrency Safety

- File locking prevents race conditions
- Atomic operations (backup → write → save)
- Automatic rollback on errors (backup remains)

## Deployment Recommendations

### Single-Server Deployment (Current)

**Pros**:
- Simple architecture
- File locking works reliably
- No synchronization issues

**Cons**:
- Single point of failure
- Limited to ~20 concurrent users
- Vertical scaling only

**Recommended For**: 
- Small to medium churches (50-200 students)
- Sunday-only usage
- Limited concurrent teachers (<10)

### Future Scaling Options

If scaling beyond 20 concurrent users is needed:

1. **Database Backend** (PostgreSQL/MySQL)
   - Row-level locking instead of file locking
   - Better concurrency support (100+ users)
   - ACID transactions
   - Requires migration from Excel

2. **Excel + Database Hybrid**
   - Use database for attendance transactions
   - Excel as export/backup format
   - Best of both worlds
   - More complex architecture

3. **Load Balancing** (Not Recommended)
   - Multiple servers cannot share Excel file safely
   - Would require distributed locking (complex)
   - Better to migrate to database first

## Monitoring Checklist

Daily:
- [ ] Check health endpoint status
- [ ] Verify recent backups exist
- [ ] Review error logs

Weekly:
- [ ] Monitor backup directory size
- [ ] Check average response times
- [ ] Review concurrent user patterns

Monthly:
- [ ] Test backup restoration
- [ ] Archive old backups
- [ ] Review capacity planning
- [ ] Run full test suite

## Support and Maintenance

### Getting Help

1. Check health endpoint first
2. Review logs for errors
3. Test with verification scripts
4. Check this guide for common issues
5. Contact system administrator

### System Updates

When updating the system:

1. **Backup First**: Create manual backup of Excel file
2. **Test Scripts**: Run all test scripts after update
3. **Monitor**: Watch logs closely after deployment
4. **Rollback Plan**: Keep previous version ready

### Performance Tuning

If experiencing performance issues:

1. **Measure First**: Run load tests to establish baseline
2. **Identify Bottleneck**: Check logs for slow operations
3. **Tune Configuration**: Adjust cache TTL, retry settings
4. **Test Changes**: Re-run load tests
5. **Monitor Impact**: Watch production metrics

## Summary

The ICB Sunday School system is designed for **10-20 concurrent users** with:

✅ **Reliable** file locking prevents data corruption
✅ **Automatic** backup before every write
✅ **Graceful** handling of concurrent access
✅ **Transparent** queuing and retries
✅ **Monitored** health and performance metrics

**Key Takeaway**: The system trades some write performance (serialized operations) for **data integrity and reliability**, making it ideal for the Sunday School use case where correctness is more important than speed.

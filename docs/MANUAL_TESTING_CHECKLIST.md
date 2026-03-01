# Manual Testing Checklist

## ICB Sunday School Attendance Tracking System

This document provides comprehensive manual testing procedures to validate all functionality of the attendance tracking system before production deployment.

---

## Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Functional Testing](#functional-testing)
3. [User Experience Testing](#user-experience-testing)
4. [Data Validation Testing](#data-validation-testing)
5. [Error Handling Testing](#error-handling-testing)
6. [Multi-User Testing](#multi-user-testing)
7. [Browser Compatibility Testing](#browser-compatibility-testing)
8. [Responsive Design Testing](#responsive-design-testing)
9. [Performance Testing](#performance-testing)
10. [Security Testing](#security-testing)
11. [Final Sign-Off](#final-sign-off)

---

## Pre-Testing Setup

### ✅ Environment Verification

- [ ] Backend server is running on port 5000
- [ ] Frontend server is running on port 5173
- [ ] Excel file exists at `data/master-data.xlsx`
- [ ] Backup directory exists at `data/backups/`
- [ ] All npm dependencies are installed
- [ ] Test data is prepared in Excel file

### ✅ Access Verification

- [ ] Can access backend health endpoint: `http://localhost:5000/api/v1/health`
- [ ] Can access frontend: `http://localhost:5173`
- [ ] Network accessibility tested (if testing from other devices)

### ✅ Data Preparation

- [ ] Excel file contains at least 2 programs (Iqra, Islamic Studies)
- [ ] Each program has multiple levels
- [ ] Teachers sheet is populated
- [ ] Students sheet has students for each program/level
- [ ] Configuration sheet has current week number

---

## Functional Testing

### 1. Landing Page - Program Selection

**Test Procedure:**
1. Open frontend application
2. Observe the landing page

**Expected Behavior:**
- [ ] Page loads within 2 seconds
- [ ] Header displays "ICB Sunday School Attendance"
- [ ] Two program cards are visible: Iqra and Islamic Studies
- [ ] Each card shows:
  - [ ] Program icon/image
  - [ ] Program name
  - [ ] Brief description
  - [ ] "Select Program" button
- [ ] Footer displays "ICB Sunday School © 2026"

**Interaction Tests:**
- [ ] Hover over program card shows visual feedback (shadow, elevation)
- [ ] Click "Select Program" button on Iqra card
- [ ] Verify navigation to level selection page

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

### 2. Level Selection Page

**Test Procedure:**
1. From landing page, select Iqra program
2. Observe level selection page

**Expected Behavior:**
- [ ] Header shows "Select Level - Iqra Program"
- [ ] Back button is visible in header
- [ ] Level cards display correctly
- [ ] Each card shows:
  - [ ] Level number/name (e.g., "Level 1", "Level 2")
  - [ ] Number of students
  - [ ] "Select Level" button
- [ ] Loading state shown briefly while fetching levels

**Interaction Tests:**
- [ ] Click back button returns to landing page
- [ ] Click on a level card
- [ ] Verify navigation to teacher selection page
- [ ] Return and test with Islamic Studies program
- [ ] Verify different levels appear for different programs

**Edge Cases:**
- [ ] Test with program that has no levels (should show appropriate message)
- [ ] Test with program that has many levels (10+) - verify scrolling

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

### 3. Teacher Selection Page

**Test Procedure:**
1. Navigate to teacher selection page (Iqra > Level 1)
2. Observe teacher selection interface

**Expected Behavior:**
- [ ] Header shows "Select Teacher - Iqra Level 1"
- [ ] Search box is visible at top
- [ ] Teacher cards display correctly
- [ ] Each card shows:
  - [ ] Teacher name
  - [ ] Programs they teach
  - [ ] "Select Teacher" button
- [ ] All teachers are visible initially

**Interaction Tests:**
- [ ] Type in search box: verify live filtering works
- [ ] Search for specific teacher name: verify they appear
- [ ] Search for non-existent name: verify "No teachers found" message
- [ ] Clear search: verify all teachers return
- [ ] Click "Select Teacher" button
- [ ] Verify navigation to attendance page

**Filtering Tests:**
- [ ] Search "John": verify only matching teachers shown
- [ ] Search with program filter: verify correct teachers shown
- [ ] Case-insensitive search: "john" vs "JOHN" both work

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

### 4. Attendance Page - Main Interface

**Test Procedure:**
1. Navigate to attendance page with selected program/level/teacher
2. Observe the complete interface

**Expected Behavior:**

**Header Section:**
- [ ] Shows current date (Sunday date)
- [ ] Shows program name
- [ ] Shows level
- [ ] Shows teacher name
- [ ] Shows week number
- [ ] Back button present

**Student List:**
- [ ] Students load and display
- [ ] Loading spinner shown while fetching
- [ ] Each student row shows:
  - [ ] Student number
  - [ ] Student name
  - [ ] Attendance toggle (Present/Absent)
  - [ ] Page number input (if present)
  - [ ] Notes field

**Action Buttons:**
- [ ] "Select All" button visible
- [ ] "Clear All" button visible
- [ ] "Submit Attendance" button visible
- [ ] Submit button initially disabled

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

### 5. Attendance Marking

**Test Procedure:**
Test individual and bulk attendance marking

**Individual Marking:**
- [ ] Click "Present" toggle for a student
- [ ] Verify button changes to green with ✓ icon
- [ ] Click again to toggle to "Absent"
- [ ] Verify button changes to red with ✗ icon
- [ ] Verify submit button becomes enabled after first change

**Page Number Entry:**
- [ ] Mark student as present
- [ ] Enter page number (e.g., "15")
- [ ] Verify number is accepted
- [ ] Try invalid inputs:
  - [ ] Negative number (should be prevented or validated)
  - [ ] Non-numeric characters (should be filtered)
  - [ ] Very large numbers (should be validated)

**Notes Entry:**
- [ ] Click on notes field
- [ ] Enter text: "Test note"
- [ ] Verify text is saved
- [ ] Test with long text (100+ characters)
- [ ] Verify text wraps or shows properly

**Bulk Operations:**
- [ ] Click "Select All" button
- [ ] Verify all students marked as present
- [ ] All toggles turn green
- [ ] Click "Clear All" button
- [ ] Verify all students marked as absent
- [ ] All toggles turn red

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

### 6. Data Submission

**Test Procedure:**
Complete the full submission process

**Preparation:**
- [ ] Mark at least 3 students with varied data:
  - Student 1: Present, Page 10, Note: "Good progress"
  - Student 2: Absent, No page, No note
  - Student 3: Present, Page 15, No note

**Submission:**
- [ ] Click "Submit Attendance" button
- [ ] Verify loading state appears
- [ ] Wait for submission to complete
- [ ] Verify navigation to confirmation page

**Confirmation Page:**
- [ ] Success message displayed
- [ ] Shows summary:
  - [ ] Total students
  - [ ] Present count
  - [ ] Absent count
  - [ ] Date submitted
- [ ] "Submit Another" button visible
- [ ] "Go Home" button visible

**Navigation After Submit:**
- [ ] Click "Submit Another" - returns to landing page
- [ ] Submit another attendance with different data
- [ ] Click "Go Home" - returns to landing page

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

### 7. Excel Data Verification

**Test Procedure:**
Verify data is correctly written to Excel file

**Steps:**
1. After submitting attendance, close all Excel files
2. Open `data/master-data.xlsx`
3. Look for a sheet named with the date (e.g., "2026-02-23")

**Verification Checklist:**
- [ ] Sheet exists with correct date
- [ ] Sheet contains correct columns:
  - [ ] Week Number
  - [ ] Program
  - [ ] Level
  - [ ] Teacher
  - [ ] Student ID
  - [ ] Student Name
  - [ ] Present
  - [ ] Page Number
  - [ ] Notes
- [ ] Data matches what was submitted:
  - [ ] Correct number of rows
  - [ ] Present/Absent values correct (TRUE/FALSE or 1/0)
  - [ ] Page numbers match
  - [ ] Notes match
- [ ] Multiple submissions on same day append to same sheet
- [ ] Different levels/programs can submit to same sheet

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

## User Experience Testing

### 8. Navigation Flow

**Complete User Journey 1: Iqra Program**
- [ ] Start at landing page
- [ ] Select Iqra program
- [ ] Select Level 2
- [ ] Select teacher
- [ ] Mark attendance for 5 students
- [ ] Submit
- [ ] Verify confirmation
- [ ] Return to home

**Time to Complete:** _________ minutes

**Complete User Journey 2: Islamic Studies Program**
- [ ] Start at landing page
- [ ] Select Islamic Studies
- [ ] Select a level
- [ ] Select teacher
- [ ] Use "Select All" feature
- [ ] Modify 2 students to absent
- [ ] Add page numbers to 3 students
- [ ] Submit
- [ ] Verify confirmation

**Time to Complete:** _________ minutes

**Back Navigation:**
- [ ] From level page, back goes to landing
- [ ] From teacher page, back goes to level selection
- [ ] From attendance page, back goes to teacher selection
- [ ] All context preserved when going back

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

### 9. Visual Design & Accessibility

**Visual Elements:**
- [ ] Colors are consistent with theme
- [ ] Green for success/present
- [ ] Red for absent/errors
- [ ] Blue for primary actions
- [ ] Text is readable (sufficient contrast)
- [ ] Icons are clear and meaningful
- [ ] Spacing is appropriate (not cramped)

**Accessibility:**
- [ ] Tab navigation works through all interactive elements
- [ ] Focus indicators are visible
- [ ] Buttons have appropriate labels
- [ ] Form fields have labels
- [ ] Error messages are clear
- [ ] Color is not the only indicator (icons also used)

**Loading States:**
- [ ] Loading spinners shown during data fetch
- [ ] Submit button shows loading during submission
- [ ] User cannot double-submit during loading

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

## Data Validation Testing

### 10. Input Validation

**Page Number Validation:**
- [ ] Can enter valid numbers (1-999)
- [ ] Cannot enter negative numbers
- [ ] Cannot enter letters
- [ ] Cannot enter special characters
- [ ] Decimal numbers handled appropriately

**Notes Validation:**
- [ ] Can enter normal text
- [ ] Can enter special characters
- [ ] Long text (500+ chars) handled appropriately
- [ ] Empty notes allowed
- [ ] Notes with line breaks handled correctly

**Date Validation:**
- [ ] System uses current Sunday date
- [ ] Date cannot be manually changed
- [ ] Date format is consistent (YYYY-MM-DD)

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

### 11. Business Logic Validation

**Attendance Rules:**
- [ ] Can mark student present without page number
- [ ] Can mark student present with page number
- [ ] Page number only relevant for present students
- [ ] Can add notes to any student (present or absent)

**Teacher Assignment:**
- [ ] Teacher is recorded with attendance
- [ ] Cannot submit without selecting teacher
- [ ] Teacher name appears in confirmation

**Week Number:**
- [ ] Current week number is used automatically
- [ ] Week number appears in Excel data
- [ ] Week number appears in confirmation

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

## Error Handling Testing

### 12. Network Error Scenarios

**Test Procedure:**
Simulate various error conditions

**Backend Server Stopped:**
- [ ] Stop backend server
- [ ] Try to load level selection page
- [ ] Verify error message displayed
- [ ] Error is user-friendly (not technical)
- [ ] Option to retry is provided

**Network Delay:**
- [ ] Use browser dev tools to throttle network to "Slow 3G"
- [ ] Navigate through application
- [ ] Verify loading states show appropriately
- [ ] Verify no timeouts or hangs
- [ ] All operations complete successfully

**Failed Submission:**
- [ ] Stop backend during submission
- [ ] Try to submit attendance
- [ ] Verify error message shown
- [ ] Verify user data is not lost
- [ ] User can retry submission after server restart

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

### 13. Data Error Scenarios

**Empty Data Sets:**
- [ ] Program with no levels: appropriate message shown
- [ ] Level with no students: appropriate message shown
- [ ] No teachers available: appropriate message shown

**Invalid Selections:**
- [ ] Try to access attendance page without selecting teacher (via URL manipulation)
- [ ] Verify redirect or error handling

**Concurrent Modifications:**
- [ ] Open two browser tabs
- [ ] Submit attendance from both simultaneously
- [ ] Verify both submissions succeed
- [ ] Verify data integrity in Excel

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

## Multi-User Testing

### 14. Concurrent Access Testing

**Test Procedure:**
Use multiple devices or browser tabs to simulate concurrent users

**Setup:**
- [ ] Device 1: Teacher A submitting Iqra Level 1
- [ ] Device 2: Teacher B submitting Islamic Studies Level 2
- [ ] Both submitting at approximately the same time

**Tests:**
- [ ] Both can access the system simultaneously
- [ ] Both can load their respective student lists
- [ ] Both can submit attendance successfully
- [ ] No data corruption or loss
- [ ] Excel file contains both submissions
- [ ] Backups are created appropriately

**File Locking:**
- [ ] Open Excel file manually (locks it)
- [ ] Try to submit attendance from web app
- [ ] Verify appropriate error message or retry mechanism
- [ ] Close Excel file
- [ ] Retry submission
- [ ] Verify submission succeeds

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

## Browser Compatibility Testing

### 15. Cross-Browser Testing

Test on multiple browsers available:

**Google Chrome:**
- [ ] All features work
- [ ] Visual appearance correct
- [ ] No console errors
- Version tested: _____________

**Microsoft Edge:**
- [ ] All features work
- [ ] Visual appearance correct
- [ ] No console errors
- Version tested: _____________

**Mozilla Firefox:**
- [ ] All features work
- [ ] Visual appearance correct
- [ ] No console errors
- Version tested: _____________

**Safari (if available):**
- [ ] All features work
- [ ] Visual appearance correct
- [ ] No console errors
- Version tested: _____________

**Mobile Browsers (if testing mobile):**
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Visual appearance correct on mobile
- [ ] Touch interactions work properly

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

## Responsive Design Testing

### 16. Device and Screen Size Testing

**Desktop (1920x1080):**
- [ ] Layout is centered and not stretched
- [ ] All elements visible without scrolling (except student list)
- [ ] Cards are appropriately sized
- [ ] Text is readable

**Laptop (1366x768):**
- [ ] Layout adapts appropriately
- [ ] All features accessible
- [ ] No horizontal scrolling

**Tablet - Portrait (768x1024):**
- [ ] Cards stack vertically if needed
- [ ] Touch targets are adequate (min 44x44px)
- [ ] All features accessible
- [ ] Keyboard shows appropriately for inputs

**Tablet - Landscape (1024x768):**
- [ ] Layout uses available space well
- [ ] Student list readable and scrollable
- [ ] All buttons accessible

**Mobile (if supported - 375x667):**
- [ ] Interface scales appropriately
- [ ] Text remains readable
- [ ] Buttons are touch-friendly
- [ ] Navigation works with touch gestures

**Testing Method:**
- Use browser developer tools to test various screen sizes
- Test on actual devices if available

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

## Performance Testing

### 17. Load Time and Responsiveness

**Page Load Times:**
- [ ] Landing page loads in < 2 seconds
- [ ] Level selection loads in < 1 second
- [ ] Teacher selection loads in < 1 second
- [ ] Student list (20 students) loads in < 2 seconds
- [ ] Large student list (50+ students) loads in < 3 seconds

**Interaction Responsiveness:**
- [ ] Attendance toggle responds immediately (< 100ms)
- [ ] Search filtering responds as user types (< 200ms)
- [ ] Form submission completes in < 3 seconds (normal conditions)

**Large Data Sets:**
- [ ] Test with 50+ students in a level
- [ ] Verify page remains responsive
- [ ] Scrolling is smooth
- [ ] No lag when marking attendance

**Memory Usage:**
- [ ] Check browser task manager
- [ ] Memory usage remains stable (< 100MB)
- [ ] No memory leaks after multiple submissions

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

## Security Testing

### 18. Data Security and Privacy

**Local Network Security:**
- [ ] Server only accessible on local network
- [ ] Cannot access from external network (test from outside network)
- [ ] CORS headers properly configured

**Data Validation:**
- [ ] SQL injection not applicable (no SQL database)
- [ ] XSS prevention: try entering `<script>alert('XSS')</script>` in notes
- [ ] Verify script does not execute
- [ ] HTML in inputs is escaped/sanitized

**File System Security:**
- [ ] Excel file cannot be accessed directly via URL
- [ ] Backup files cannot be accessed directly via URL
- [ ] Server files cannot be browsed

**Rate Limiting:**
- [ ] Rapid requests are throttled
- [ ] Appropriate error messages shown
- [ ] System recovers after throttling

**Expected Result:** ✅ PASS / ❌ FAIL

**Notes:**
```
_______________________________________________________
```

---

## Final Sign-Off

### 19. Production Readiness Checklist

**Documentation:**
- [ ] User guide available and reviewed
- [ ] Administrator guide available and reviewed
- [ ] Deployment guide available and reviewed
- [ ] All technical documentation up to date

**Training:**
- [ ] Teachers trained on using the system
- [ ] Administrator trained on maintenance tasks
- [ ] Troubleshooting guide accessible

**Backup and Recovery:**
- [ ] Backup system verified working
- [ ] Recovery process tested and documented
- [ ] Backup retention policy defined

**Monitoring:**
- [ ] Health endpoints accessible
- [ ] Monitoring procedure documented
- [ ] Alert mechanisms in place (if any)

**Support:**
- [ ] Support contact information available
- [ ] Issue reporting procedure defined
- [ ] Escalation process documented

**Expected Result:** ✅ PASS / ❌ FAIL

---

## Testing Summary

**Tester Name:** _________________________________

**Date:** _________________________________

**Environment:** _________________________________

**Overall Result:**
- Total Tests: ______
- Passed: ______
- Failed: ______
- Pass Rate: ______%

**Critical Issues Found:**
```
1. ___________________________________________________
2. ___________________________________________________
3. ___________________________________________________
```

**Recommendations:**
```
_______________________________________________________
_______________________________________________________
_______________________________________________________
```

**Sign-Off:**

**Tested By:** ______________________ Date: __________

**Approved By:** ____________________ Date: __________

**Status:**
- [ ] ✅ Approved for Production
- [ ] ⚠️ Approved with Minor Issues
- [ ] ❌ Not Approved - Major Issues Found

---

## Appendix: Common Issues and Solutions

### Issue: "Cannot connect to server"
**Solution:** Verify backend server is running on port 5000

### Issue: "No students found"
**Solution:** Check Excel file has students for selected program/level

### Issue: "Submission failed"
**Solution:** Check Excel file is not open in another program

### Issue: "Slow page loading"
**Solution:** Check network connection and server resources

### Issue: "Data not appearing in Excel"
**Solution:** Verify Excel file path is correct in backend configuration

---

**Document Version:** 1.0
**Last Updated:** 2026-02-23
**Maintained By:** ICB Technical Team

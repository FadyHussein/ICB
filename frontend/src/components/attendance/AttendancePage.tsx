import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Checkbox,
  TextField,
  Button,
  FormControlLabel,
  Divider,
  Paper,
  Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../layout/Header';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import { useAppState } from '../../context/AppStateContext';
import { useNotification } from '../../context/NotificationContext';
import { studentsService } from '../../services/students.service';
import { attendanceService } from '../../services/attendance.service';
import type { AttendanceRecord } from '../../types/attendance.types';

const AttendancePage: React.FC = () => {
  const { program, level } = useParams<{ program: string; level: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const {
    selectedProgramName,
    selectedLevelName,
    selectedTeacher,
    students,
    setStudents,
    updateAttendance,
    currentWeek,
  } = useAppState();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkPageNumber, setBulkPageNumber] = useState<string>('');
  const [localAttendance, setLocalAttendance] = useState<Map<string, AttendanceRecord>>(new Map());

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const studentsData = await studentsService.getStudents(program || '', level || '');
        setStudents(studentsData);
        
        // Initialize attendance records
        const initialRecords = new Map<string, AttendanceRecord>();
        studentsData.forEach(student => {
          initialRecords.set(student.studentId, {
            studentId: student.studentId,
            status: 'absent',
            pageNumber: null,
          });
        });
        setLocalAttendance(initialRecords);
      } catch (err: any) {
        setError(err?.error?.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, level]);

  const handleAttendanceChange = (studentId: string, checked: boolean) => {
    const newRecord: AttendanceRecord = {
      studentId,
      status: checked ? 'present' : 'absent',
      pageNumber: checked ? localAttendance.get(studentId)?.pageNumber || null : null,
    };
    
    setLocalAttendance(prev => {
      const updated = new Map(prev);
      updated.set(studentId, newRecord);
      return updated;
    });
    updateAttendance(studentId, newRecord);
  };

  const handlePageNumberChange = (studentId: string, value: string) => {
    const pageNum = value === '' ? null : parseInt(value, 10);
    const currentRecord = localAttendance.get(studentId);
    
    if (currentRecord) {
      const newRecord: AttendanceRecord = {
        ...currentRecord,
        pageNumber: pageNum,
      };
      
      setLocalAttendance(prev => {
        const updated = new Map(prev);
        updated.set(studentId, newRecord);
        return updated;
      });
      updateAttendance(studentId, newRecord);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    const updatedRecords = new Map(localAttendance);
    
    students.forEach(student => {
      const currentRecord = updatedRecords.get(student.studentId);
      updatedRecords.set(student.studentId, {
        studentId: student.studentId,
        status: checked ? 'present' : 'absent',
        pageNumber: checked ? (currentRecord?.pageNumber || null) : null,
      });
    });
    
    setLocalAttendance(updatedRecords);
  };

  const handleBulkUpdate = () => {
    if (!bulkPageNumber) {
      showNotification('Please enter a page number', 'warning');
      return;
    }

    const pageNum = parseInt(bulkPageNumber, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      showNotification('Please enter a valid page number', 'error');
      return;
    }

    const updatedRecords = new Map(localAttendance);
    let updateCount = 0;

    localAttendance.forEach((record, studentId) => {
      if (record.status === 'present') {
        updatedRecords.set(studentId, { ...record, pageNumber: pageNum });
        updateAttendance(studentId, { ...record, pageNumber: pageNum });
        updateCount++;
      }
    });

    setLocalAttendance(updatedRecords);
    showNotification(`Updated ${updateCount} students with page ${pageNum}`, 'success');
  };

  const handleSubmit = async () => {
    if (!selectedTeacher) {
      showNotification('Teacher not selected', 'error');
      return;
    }

    const records = Array.from(localAttendance.values());
    const presentCount = records.filter(r => r.status === 'present').length;

    if (presentCount === 0) {
      showNotification('Please mark at least one student as present', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const submission = {
        program: program || '',
        level: level || '',
        teacherId: selectedTeacher.teacherId,
        weekDate: currentWeek,
        records,
      };

      const result = await attendanceService.submitAttendance(submission);
      showNotification('Attendance submitted successfully!', 'success');
      navigate('/confirmation', { state: { result, presentCount, totalCount: students.length } });
    } catch (err: any) {
      showNotification(err?.error?.message || 'Failed to submit attendance', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Array.from(localAttendance.values()).filter(r => r.status === 'present').length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
      <Header
        title="Mark Attendance"
        showBack
        showHome
      />
      
      {loading && <LoadingSpinner message="Loading students..." />}
      {error && <Container maxWidth="lg" sx={{ pt: 4 }}><ErrorAlert message={error} /></Container>}
      
      {!loading && !error && (
        <Container maxWidth="lg" sx={{ pt: 4 }}>
          {/* Session Info */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Program</Typography>
                <Typography variant="h6">{selectedProgramName}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Level</Typography>
                <Typography variant="h6">{selectedLevelName}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Teacher</Typography>
                <Typography variant="h6">{selectedTeacher?.teacherName}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Date</Typography>
                <Typography variant="h6">{new Date().toLocaleDateString()}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Select All */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    color="primary"
                  />
                }
                label={<Typography variant="h6">Select All Students</Typography>}
              />
            </CardContent>
          </Card>

          {/* Students List */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Students ({students.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {students.map((student, index) => {
                const record = localAttendance.get(student.studentId);
                const isPresent = record?.status === 'present';
                
                return (
                  <Box key={student.studentId}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        py: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isPresent}
                            onChange={(e) => handleAttendanceChange(student.studentId, e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body1" sx={{ fontWeight: isPresent ? 600 : 400, minWidth: 200 }}>
                            {student.fullName}
                          </Typography>
                        }
                        sx={{ flex: 1, minWidth: 250 }}
                      />
                      
                      <TextField
                        type="number"
                        label="Page/Lesson"
                        size="small"
                        disabled={!isPresent}
                        value={record?.pageNumber || ''}
                        onChange={(e) => handlePageNumberChange(student.studentId, e.target.value)}
                        inputProps={{ min: 1, max: 999 }}
                        sx={{ width: 150 }}
                      />
                    </Box>
                    {index < students.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </CardContent>
          </Card>

          {/* Bulk Update */}
          <Card elevation={2} sx={{ mb: 3, bgcolor: 'secondary.light' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bulk Update Page Number
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Set the same page number for all students marked present
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <TextField
                  type="number"
                  label="Page/Lesson for all selected"
                  value={bulkPageNumber}
                  onChange={(e) => setBulkPageNumber(e.target.value)}
                  inputProps={{ min: 1, max: 999 }}
                  sx={{ flex: 1, minWidth: 200 }}
                />
                <Button
                  variant="contained"
                  onClick={handleBulkUpdate}
                  disabled={presentCount === 0}
                  sx={{ minWidth: 150 }}
                >
                  Update All ({presentCount})
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Summary Alert */}
          {presentCount > 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {presentCount} student{presentCount !== 1 ? 's' : ''} marked present out of {students.length} total
            </Alert>
          )}

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(-1)}
              sx={{ minWidth: 150 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={submitting || presentCount === 0}
              sx={{ minWidth: 150 }}
            >
              {submitting ? 'Submitting...' : 'Submit Attendance'}
            </Button>
          </Box>
        </Container>
      )}
    </Box>
  );
};

export default AttendancePage;

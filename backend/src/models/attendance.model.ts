/**
 * Attendance data model
 */
export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: 'present' | 'absent';
  pageNumber: number | null;
}

export interface AttendanceSubmission {
  program: string;
  level: string;
  teacherId: string;
  weekDate: string;
  records: AttendanceRecord[];
}

export interface BulkUpdateRequest {
  program: string;
  level: string;
  weekDate: string;
  studentIds: string[];
  pageNumber: number;
}

export interface AttendanceHistory {
  program: string;
  level: string;
  weekDate: string;
  records: AttendanceRecord[];
}

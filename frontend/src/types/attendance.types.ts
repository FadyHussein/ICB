export interface AttendanceRecord {
  studentId: string;
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

export interface AttendanceResponse {
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  weekDate: string;
  timestamp: string;
}

export interface StudentAttendance extends AttendanceRecord {
  studentName: string;
}

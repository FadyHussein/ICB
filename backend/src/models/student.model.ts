/**
 * Student data model
 */
export interface Student {
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  program: 'Iqra' | 'Islamic Studies';
  level: string;
  active: boolean;
  dateEnrolled: string;
  parentName?: string;
  parentPhone?: string;
}

export interface CreateStudentDTO {
  firstName: string;
  lastName: string;
  program: 'Iqra' | 'Islamic Studies';
  level: string;
  active?: boolean;
  parentName?: string;
  parentPhone?: string;
}

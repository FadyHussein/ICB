export interface Student {
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  program: string;
  level: string;
  active: boolean;
  dateEnrolled: string;
  parentName?: string;
  parentPhone?: string;
}

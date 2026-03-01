/**
 * Teacher data model
 */
export interface Teacher {
  teacherId: string;
  teacherName: string;
  program: 'Both' | 'Iqra' | 'Islamic Studies';
  levels: string[];
  active: boolean;
  dateAdded: string;
}

export interface CreateTeacherDTO {
  teacherName: string;
  program: 'Both' | 'Iqra' | 'Islamic Studies';
  levels: string[];
  active?: boolean;
}

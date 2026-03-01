import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Teacher } from '../types/teacher.types';
import type { Student } from '../types/student.types';
import type { AttendanceRecord } from '../types/attendance.types';

interface AppState {
  selectedProgram: string | null;
  selectedProgramName: string | null;
  selectedLevel: string | null;
  selectedLevelName: string | null;
  selectedTeacher: Teacher | null;
  students: Student[];
  attendanceRecords: Map<string, AttendanceRecord>;
  currentWeek: string;
  isLoading: boolean;
  error: string | null;
}

interface AppStateContextType extends AppState {
  setProgram: (program: string, programName: string) => void;
  setLevel: (level: string, levelName: string) => void;
  setTeacher: (teacher: Teacher) => void;
  setStudents: (students: Student[]) => void;
  updateAttendance: (studentId: string, record: AttendanceRecord) => void;
  setCurrentWeek: (week: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
  getAllAttendanceRecords: () => AttendanceRecord[];
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

const initialState: AppState = {
  selectedProgram: null,
  selectedProgramName: null,
  selectedLevel: null,
  selectedLevelName: null,
  selectedTeacher: null,
  students: [],
  attendanceRecords: new Map(),
  currentWeek: new Date().toISOString().split('T')[0],
  isLoading: false,
  error: null,
};

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);

  const setProgram = (program: string, programName: string) => {
    setState(prev => ({
      ...prev,
      selectedProgram: program,
      selectedProgramName: programName,
      selectedLevel: null,
      selectedLevelName: null,
      selectedTeacher: null,
      students: [],
      attendanceRecords: new Map(),
    }));
  };

  const setLevel = (level: string, levelName: string) => {
    setState(prev => ({
      ...prev,
      selectedLevel: level,
      selectedLevelName: levelName,
      selectedTeacher: null,
      students: [],
      attendanceRecords: new Map(),
    }));
  };

  const setTeacher = (teacher: Teacher) => {
    setState(prev => ({ ...prev, selectedTeacher: teacher }));
  };

  const setStudents = (students: Student[]) => {
    setState(prev => ({ ...prev, students }));
  };

  const updateAttendance = (studentId: string, record: AttendanceRecord) => {
    setState(prev => {
      const newRecords = new Map(prev.attendanceRecords);
      newRecords.set(studentId, record);
      return { ...prev, attendanceRecords: newRecords };
    });
  };

  const setCurrentWeek = (week: string) => {
    setState(prev => ({ ...prev, currentWeek: week }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const resetSession = () => {
    setState(initialState);
  };

  const getAllAttendanceRecords = (): AttendanceRecord[] => {
    return Array.from(state.attendanceRecords.values());
  };

  const value: AppStateContextType = {
    ...state,
    setProgram,
    setLevel,
    setTeacher,
    setStudents,
    updateAttendance,
    setCurrentWeek,
    setLoading,
    setError,
    resetSession,
    getAllAttendanceRecords,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

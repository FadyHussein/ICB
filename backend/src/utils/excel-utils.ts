/**
 * Excel utility functions
 */

/**
 * Get sheet name for program and level combination
 * Excel has 31 character limit for sheet names
 */
export function getSheetName(program: string, level: string): string {
  const normalizedProgram = program === 'islamic-studies' ? 'ISlam' : 'Iqra';
  const normalizedLevel = level.toUpperCase() === 'K' ? 'K' : 
                          level.toUpperCase() === 'QURAN' ? 'Quran' : 
                          `L${level}`;
  return `${normalizedProgram}_${normalizedLevel}_Attendance`;
}

/**
 * Normalize program name
 */
export function normalizeProgram(program: string): string {
  const lower = program.toLowerCase();
  if (lower === 'iqra') return 'Iqra';
  if (lower === 'islamic-studies' || lower === 'islamic studies' || lower === 'islamicstudies') {
    return 'Islamic Studies';
  }
  if (lower === 'both') return 'Both';
  return program;
}

/**
 * Normalize level
 */
export function normalizeLevel(level: string): string {
  const upper = level.toUpperCase();
  if (upper === 'K' || upper === 'KINDERGARTEN') return 'K';
  if (upper === 'QURAN') return 'Quran';
  if (/^[1-6]$/.test(level)) return level;
  return level;
}

/**
 * Format attendance value for Excel cell
 */
export function formatAttendanceValue(status: 'present' | 'absent', pageNumber: number | null): string {
  if (status === 'absent') return 'A:-';
  if (status === 'present' && pageNumber !== null) return `P:${pageNumber}`;
  return '';
}

/**
 * Parse attendance value from Excel cell
 */
export function parseAttendanceValue(value: string | null | undefined): {
  status: 'present' | 'absent' | null;
  pageNumber: number | null;
} {
  if (!value || typeof value !== 'string') {
    return { status: null, pageNumber: null };
  }

  const trimmed = value.trim();
  
  if (trimmed === 'A:-') {
    return { status: 'absent', pageNumber: null };
  }
  
  const presentMatch = trimmed.match(/^P:(\d+)$/);
  if (presentMatch) {
    return { status: 'present', pageNumber: parseInt(presentMatch[1], 10) };
  }
  
  return { status: null, pageNumber: null };
}

/**
 * Generate next ID in sequence
 */
export function generateNextId(prefix: string, existingIds: string[]): string {
  const numbers = existingIds
    .filter(id => id.startsWith(prefix))
    .map(id => parseInt(id.substring(prefix.length), 10))
    .filter(num => !isNaN(num));
  
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;
  
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Get column letter for week date
 */
export function getWeekColumnLetter(weekIndex: number): string {
  // Column A = StudentID, B = StudentName, C = first week, D = second week, etc.
  const columnIndex = weekIndex + 2; // +2 to skip StudentID and StudentName columns
  return columnToLetter(columnIndex);
}

/**
 * Convert column number to Excel letter (0-based)
 */
export function columnToLetter(column: number): string {
  let temp: number;
  let letter = '';
  while (column >= 0) {
    temp = column % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = Math.floor(column / 26) - 1;
  }
  return letter;
}

/**
 * ID generation utilities
 */

/**
 * Generate a new teacher ID
 */
export function generateTeacherId(existingIds: string[]): string {
  return generateSequentialId('T', existingIds);
}

/**
 * Generate a new student ID
 */
export function generateStudentId(existingIds: string[]): string {
  return generateSequentialId('S', existingIds);
}

/**
 * Generate sequential ID with prefix
 */
function generateSequentialId(prefix: string, existingIds: string[]): string {
  const numbers = existingIds
    .filter(id => id.startsWith(prefix))
    .map(id => {
      const numPart = id.substring(prefix.length);
      return parseInt(numPart, 10);
    })
    .filter(num => !isNaN(num));

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;

  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Validate ID format
 */
export function isValidId(id: string, prefix: string): boolean {
  const regex = new RegExp(`^${prefix}\\d{3}$`);
  return regex.test(id);
}

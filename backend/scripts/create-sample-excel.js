/**
 * Script to create sample Excel workbook with proper structure
 * Run with: node backend/scripts/create-sample-excel.js
 */

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function createSampleExcel() {
  const workbook = new ExcelJS.Workbook();
  
  // === Teachers Sheet ===
  const teachersSheet = workbook.addWorksheet('Teachers');
  teachersSheet.columns = [
    { header: 'TeacherID', key: 'teacherId', width: 12 },
    { header: 'TeacherName', key: 'teacherName', width: 20 },
    { header: 'Program', key: 'program', width: 18 },
    { header: 'Level', key: 'level', width: 12 },
    { header: 'Active', key: 'active', width: 10 },
    { header: 'DateAdded', key: 'dateAdded', width: 12 },
  ];
  
  // Sample teachers
  teachersSheet.addRows([
    { teacherId: 'T001', teacherName: 'Ahmed Hassan', program: 'Both', level: '1,2', active: true, dateAdded: '2026-01-15' },
    { teacherId: 'T002', teacherName: 'Fatima Ali', program: 'Iqra', level: 'K,1', active: true, dateAdded: '2026-01-15' },
    { teacherId: 'T003', teacherName: 'Omar Abdullah', program: 'Islamic Studies', level: '3,4', active: true, dateAdded: '2026-01-20' },
    { teacherId: 'T004', teacherName: 'Aisha Mohammed', program: 'Iqra', level: 'Quran', active: true, dateAdded: '2026-01-25' },
  ]);
  
  // === Students Sheet ===
  const studentsSheet = workbook.addWorksheet('Students');
  studentsSheet.columns = [
    { header: 'StudentID', key: 'studentId', width: 12 },
    { header: 'FirstName', key: 'firstName', width: 15 },
    { header: 'LastName', key: 'lastName', width: 15 },
    { header: 'Program', key: 'program', width: 18 },
    { header: 'Level', key: 'level', width: 10 },
    { header: 'Active', key: 'active', width: 10 },
    { header: 'DateEnrolled', key: 'dateEnrolled', width: 15 },
    { header: 'ParentName', key: 'parentName', width: 20 },
    { header: 'ParentPhone', key: 'parentPhone', width: 15 },
  ];
  
  // Sample students
  studentsSheet.addRows([
    { studentId: 'S001', firstName: 'Yusuf', lastName: 'Ibrahim', program: 'Iqra', level: '2', active: true, dateEnrolled: '2026-01-15', parentName: 'Ibrahim Ahmed', parentPhone: '208-555-1234' },
    { studentId: 'S002', firstName: 'Zahra', lastName: 'Hassan', program: 'Iqra', level: '2', active: true, dateEnrolled: '2026-01-15', parentName: 'Hassan Ali', parentPhone: '208-555-5678' },
    { studentId: 'S003', firstName: 'Maryam', lastName: 'Omar', program: 'Islamic Studies', level: '3', active: true, dateEnrolled: '2026-01-20', parentName: 'Omar Abdullah', parentPhone: '208-555-9012' },
    { studentId: 'S004', firstName: 'Ali', lastName: 'Mohammed', program: 'Iqra', level: '1', active: true, dateEnrolled: '2026-01-20', parentName: 'Mohammed Ali', parentPhone: '208-555-3456' },
    { studentId: 'S005', firstName: 'Fatima', lastName: 'Ahmed', program: 'Islamic Studies', level: '3', active: true, dateEnrolled: '2026-01-25', parentName: 'Ahmed Hassan', parentPhone: '208-555-7890' },
  ]);
  
  // === Metadata Sheet ===
  const metadataSheet = workbook.addWorksheet('Metadata');
  metadataSheet.columns = [
    { header: 'Key', key: 'key', width: 25 },
    { header: 'Value', key: 'value', width: 25 },
    { header: 'Description', key: 'description', width: 40 },
  ];
  
  metadataSheet.addRows([
    { key: 'SchoolYearStart', value: '2025-09-01', description: 'Academic year start date' },
    { key: 'CurrentWeek', value: '2026-02-16', description: 'Current Sunday date' },
    { key: 'LastBackup', value: '', description: 'Last automatic backup timestamp' },
    { key: 'Version', value: '1.0', description: 'Data schema version' },
  ]);
  
  // === Attendance Sheets ===
  // Using short names to stay under Excel's 31 character limit
  const attendancePrograms = [
    { program: 'Iqra', levels: ['K', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'Quran'] },
    { program: 'ISlam', levels: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'] },
  ];
  
  // Sample week dates
  const sampleWeeks = [
    '2026-02-02', '2026-02-09', '2026-02-16', '2026-02-23',
    '2026-03-01', '2026-03-08', '2026-03-15', '2026-03-22'
  ];
  
  for (const { program, levels } of attendancePrograms) {
    for (const level of levels) {
      const sheetName = `${program}_${level}_Attendance`;
      const sheet = workbook.addWorksheet(sheetName);
      
      // Create headers
      const headers = ['StudentID', 'StudentName', ...sampleWeeks.map(date => `Week_${date}`)];
      sheet.addRow(headers);
      
      // Add sample student rows (empty attendance for now)
      if (program === 'Iqra' && level === 'L2') {
        sheet.addRow(['S001', 'Yusuf Ibrahim', 'P:5', 'P:7', 'P:9', '', '', '', '', '']);
        sheet.addRow(['S002', 'Zahra Hassan', 'P:5', 'A:-', 'P:6', '', '', '', '', '']);
      } else if (program === 'Iqra' && level === 'L1') {
        sheet.addRow(['S004', 'Ali Mohammed', '', '', '', '', '', '', '', '']);
      } else if (program === 'ISlam' && level === 'L3') {
        sheet.addRow(['S003', 'Maryam Omar', '', '', '', '', '', '', '', '']);
        sheet.addRow(['S005', 'Fatima Ahmed', '', '', '', '', '', '', '', '']);
      }
      
      // Format columns
      sheet.getColumn(1).width = 12;
      sheet.getColumn(2).width = 20;
      for (let i = 3; i <= headers.length; i++) {
        sheet.getColumn(i).width = 15;
      }
      
      // Style header row
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };
    }
  }
  
  // Save workbook
  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const filePath = path.join(dataDir, 'master-data.xlsx');
  await workbook.xlsx.writeFile(filePath);
  
  console.log(`✅ Sample Excel file created successfully at: ${filePath}`);
  console.log(`   - Teachers: 4 sample teachers`);
  console.log(`   - Students: 5 sample students`);
  console.log(`   - Attendance sheets: ${attendancePrograms.reduce((acc, p) => acc + p.levels.length, 0)} sheets created`);
}

createSampleExcel().catch(error => {
  console.error('❌ Error creating sample Excel file:', error);
  process.exit(1);
});

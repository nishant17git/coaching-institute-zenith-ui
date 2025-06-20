
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceRecord, FeeTransaction, TestRecordDb } from '@/types';

interface PDFExportData {
  records: AttendanceRecord[];
  studentData: {
    id: string;
    name: string;
    class: number;
    attendancePercentage: number;
  };
  title: string;
  subtitle: string;
  chartImage?: string | null;
}

export interface AttendancePDFOptions {
  records: AttendanceRecord[];
  studentData: any;
  title: string;
  subtitle: string;
  logo?: string;
}

export interface FeeInvoicePDFOptions {
  transaction: FeeTransaction;
  student: any;
  instituteName: string;
  instituteAddress: string;
  institutePhone: string;
  logo?: string;
}

// Legacy test format for PDF export compatibility
interface LegacyTestFormat {
  test_name: string;
  subject: string;
  test_date: string;
  marks: number;
  total_marks: number;
}

// Updated interface for test PDF export
interface TestPDFData {
  test: TestRecordDb | LegacyTestFormat;
  student: any;
  title: string;
  subtitle: string;
  allTests?: LegacyTestFormat[];
}

// Enhanced Institute branding constants
const INSTITUTE_NAME = "INFINITY CLASSES";
const INSTITUTE_TAGLINE = "Excellence in Education Since 2022";
const INSTITUTE_PHONE = "+91 9905880697";
const INSTITUTE_EMAIL = "theinfinityclasses1208@gmail.com";

// Professional color palette - consistent across all PDFs
const COLORS = {
  primary: [13, 33, 84] as [number, number, number],
  primaryLight: [37, 99, 235] as [number, number, number],
  secondary: [59, 130, 246] as [number, number, number],
  accent: [34, 197, 94] as [number, number, number],
  text: [15, 23, 42] as [number, number, number],
  textLight: [71, 85, 105] as [number, number, number],
  textMuted: [148, 163, 184] as [number, number, number],
  background: [248, 250, 252] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  success: [22, 163, 74] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number]
};

// Professional header function with prominent branding
const addProfessionalHeader = (doc: jsPDF, reportType: string = '', subtitle?: string) => {
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Background accent bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 12, 'F');
  
  yPosition += 25;

  // Institute name - highly prominent
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.primary);
  doc.text(INSTITUTE_NAME, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  
  // Tagline
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.text(INSTITUTE_TAGLINE, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 6;
  
  // Contact info - minimal and clean
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text(`${INSTITUTE_PHONE} • ${INSTITUTE_EMAIL}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;
  
  // Thin separator line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(25, yPosition, pageWidth - 25, yPosition);
  
  yPosition += 20;
  
  // Report type - prominent but clean
  if (reportType) {
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(reportType, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    
    if (subtitle) {
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.textLight);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
    }
  }
  
  return yPosition + 20;
};

// Enhanced professional footer
const addProfessionalFooter = (doc: jsPDF) => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  // Footer separator
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(25, pageHeight - 25, pageWidth - 25, pageHeight - 25);
  
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  
  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  doc.text(`Generated on ${currentDate}`, 25, pageHeight - 12);
  
  // Institute name in footer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text(INSTITUTE_NAME, pageWidth - 25, pageHeight - 12, { align: 'right' });
};

// Individual Student Attendance Report
export const exportAttendanceToPDF = (data: PDFExportData) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add professional header
    let yPosition = addProfessionalHeader(doc, 'Student Attendance Report', 'Individual Academic Performance Overview');
    
    // Student profile card - modern and professional
    doc.setFillColor(...COLORS.background);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(1);
    doc.roundedRect(25, yPosition, pageWidth - 50, 55, 8, 8, 'FD');
    
    yPosition += 20;
    
    // Student name - prominent
    doc.setFontSize(18);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(data.studentData.name, 40, yPosition);
    
    yPosition += 12;
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(`Class ${data.studentData.class} • Student ID: ${data.studentData.id.slice(-6)}`, 40, yPosition);
    
    // Attendance percentage - professional badge
    const attendancePercentage = data.studentData.attendancePercentage;
    const badgeColor = attendancePercentage >= 90 ? COLORS.success : 
                      attendancePercentage >= 75 ? COLORS.secondary : 
                      attendancePercentage >= 50 ? COLORS.warning : COLORS.danger;
    
    doc.setFillColor(...badgeColor);
    doc.roundedRect(pageWidth - 80, yPosition - 25, 50, 25, 8, 8, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`${attendancePercentage}%`, pageWidth - 55, yPosition - 12, { align: 'center' });
    doc.setFontSize(9);
    doc.text('ATTENDANCE', pageWidth - 55, yPosition - 5, { align: 'center' });
    
    yPosition += 40;
    
    // Performance metrics - professional cards
    if (data.records.length > 0) {
      const present = data.records.filter(r => r.status === 'Present').length;
      const absent = data.records.filter(r => r.status === 'Absent').length;
      const leave = data.records.filter(r => r.status === 'Leave').length;
      const total = data.records.length;
      
      const metrics = [
        { label: 'Present Days', value: present, color: COLORS.success },
        { label: 'Absent Days', value: absent, color: COLORS.danger },
        { label: 'Leave Days', value: leave, color: COLORS.warning },
        { label: 'Total Days', value: total, color: COLORS.primary }
      ];
      
      const cardWidth = (pageWidth - 80) / 4;
      
      metrics.forEach((metric, index) => {
        const x = 30 + (index * (cardWidth + 10));
        
        // Professional card design
        doc.setFillColor(...COLORS.white);
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(1);
        doc.roundedRect(x, yPosition, cardWidth, 40, 6, 6, 'FD');
        
        // Colored top accent
        doc.setFillColor(...metric.color);
        doc.roundedRect(x, yPosition, cardWidth, 6, 6, 6, 'F');
        
        // Value
        doc.setTextColor(...COLORS.text);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(metric.value.toString(), x + cardWidth/2, yPosition + 22, { align: 'center' });
        
        // Label
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.textLight);
        doc.setFont('helvetica', 'normal');
        doc.text(metric.label, x + cardWidth/2, yPosition + 32, { align: 'center' });
      });
      
      yPosition += 60;
    }
    
    // Attendance Records Table
    if (data.records.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(...COLORS.text);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Attendance Records', 30, yPosition);
      yPosition += 15;
      
      const tableData = data.records.map((record, index) => [
        (index + 1).toString(),
        new Date(record.date).toLocaleDateString('en-IN'),
        new Date(record.date).toLocaleDateString('en-IN', { weekday: 'long' }),
        data.studentData.name,
        record.status
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['S.No', 'Date', 'Day', 'Student', 'Status']],
        body: tableData,
        styles: {
          fontSize: 10,
          cellPadding: 8,
          font: 'helvetica',
          textColor: COLORS.text
        },
        headStyles: {
          fillColor: COLORS.primary,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 11
        },
        alternateRowStyles: {
          fillColor: COLORS.background,
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 35, halign: 'center' },
          2: { cellWidth: 35 },
          3: { cellWidth: 50 },
          4: { cellWidth: 25, halign: 'center' },
        },
        didParseCell: function(data) {
          if (data.column.index === 4 && data.section === 'body') {
            const status = data.cell.text[0];
            switch (status) {
              case 'Present':
                data.cell.styles.textColor = COLORS.success;
                data.cell.styles.fontStyle = 'bold';
                break;
              case 'Absent':
                data.cell.styles.textColor = COLORS.danger;
                data.cell.styles.fontStyle = 'bold';
                break;
              case 'Leave':
                data.cell.styles.textColor = COLORS.warning;
                data.cell.styles.fontStyle = 'bold';
                break;
              case 'Holiday':
                data.cell.styles.textColor = COLORS.secondary;
                data.cell.styles.fontStyle = 'bold';
                break;
            }
          }
        }
      });
    }
    
    addProfessionalFooter(doc);
    
    const fileName = `attendance-${data.studentData.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating attendance PDF:', error);
    throw new Error('Failed to generate attendance PDF');
  }
};

// Class-wise Attendance Summary Report with student names and class info
export const exportClassAttendancePDF = (classData: {
  className: string;
  students: any[];
  dateRange: { start: string; end: string };
  summary: {
    totalStudents: number;
    averageAttendance: number;
    presentToday: number;
    absentToday: number;
  };
}) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add professional header
    let yPosition = addProfessionalHeader(doc, 'Class Attendance Summary', `${classData.className} - Academic Overview`);
    
    // Date range and summary
    doc.setFillColor(...COLORS.background);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(1);
    doc.roundedRect(25, yPosition, pageWidth - 50, 45, 8, 8, 'FD');
    
    yPosition += 18;
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(`Report Period: ${new Date(classData.dateRange.start).toLocaleDateString('en-IN')} to ${new Date(classData.dateRange.end).toLocaleDateString('en-IN')}`, 40, yPosition);
    
    yPosition += 12;
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(`Class: ${classData.className} • Total Students: ${classData.summary.totalStudents}`, 40, yPosition);
    
    yPosition += 10;
    doc.text(`Average Attendance: ${classData.summary.averageAttendance}% • Present Today: ${classData.summary.presentToday}`, 40, yPosition);
    
    yPosition += 55;
    
    // Class statistics with professional design
    const stats = [
      { label: 'Total Students', value: classData.summary.totalStudents, color: COLORS.primary },
      { label: 'Present Today', value: classData.summary.presentToday, color: COLORS.success },
      { label: 'Absent Today', value: classData.summary.absentToday, color: COLORS.danger },
      { label: 'Avg. Attendance', value: `${classData.summary.averageAttendance}%`, color: COLORS.secondary }
    ];
    
    const cardWidth = (pageWidth - 80) / 4;
    
    stats.forEach((stat, index) => {
      const x = 30 + (index * (cardWidth + 10));
      
      doc.setFillColor(...COLORS.white);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(1);
      doc.roundedRect(x, yPosition, cardWidth, 45, 6, 6, 'FD');
      
      doc.setFillColor(...stat.color);
      doc.roundedRect(x, yPosition, cardWidth, 6, 6, 6, 'F');
      
      doc.setTextColor(...COLORS.text);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(stat.value.toString(), x + cardWidth/2, yPosition + 25, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.textLight);
      doc.setFont('helvetica', 'normal');
      doc.text(stat.label, x + cardWidth/2, yPosition + 36, { align: 'center' });
    });
    
    yPosition += 70;
    
    // Student list table with enhanced design
    if (classData.students.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(...COLORS.text);
      doc.setFont('helvetica', 'bold');
      doc.text(`Student Attendance Overview - ${classData.className}`, 30, yPosition);
      yPosition += 15;
      
      const tableData = classData.students.map((student, index) => [
        (index + 1).toString(),
        student.full_name || student.name,
        `Class ${student.class}`,
        student.roll_number || student.id.slice(-4),
        `${student.attendance_percentage || 0}%`,
        student.status || 'Present'
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['S.No', 'Student Name', 'Class', 'Roll No.', 'Attendance %', 'Today Status']],
        body: tableData,
        styles: {
          fontSize: 10,
          cellPadding: 8,
          font: 'helvetica',
          textColor: COLORS.text
        },
        headStyles: {
          fillColor: COLORS.primary,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 11
        },
        alternateRowStyles: {
          fillColor: COLORS.background,
        },
        columnStyles: {
          0: { cellWidth: 18, halign: 'center' },
          1: { cellWidth: 50 },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 28, halign: 'center' },
          5: { cellWidth: 28, halign: 'center' },
        }
      });
    }
    
    addProfessionalFooter(doc);
    
    const fileName = `class-attendance-${classData.className.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating class attendance PDF:', error);
    throw new Error('Failed to generate class attendance PDF');
  }
};

// Enhanced Fee Invoice PDF with payment months and professional design
export const exportFeeInvoicePDF = (options: FeeInvoicePDFOptions) => {
  try {
    const { transaction, student } = options;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add professional header
    let yPosition = addProfessionalHeader(doc, 'Payment Receipt', 'Fee Transaction Confirmation');
    
    // Receipt details card
    doc.setFillColor(...COLORS.background);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(1);
    doc.roundedRect(25, yPosition, pageWidth - 50, 85, 8, 8, 'FD');
    
    yPosition += 20;
    
    // Student & Receipt Information
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Information', 40, yPosition);
    
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Receipt Details', pageWidth - 40, yPosition, { align: 'right' });
    
    yPosition += 15;
    
    // Left column - Student details
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${student.name || student.full_name}`, 40, yPosition);
    yPosition += 8;
    doc.text(`Class: ${student.class}`, 40, yPosition);
    yPosition += 8;
    doc.text(`Student ID: ${student.id?.slice(-6) || 'N/A'}`, 40, yPosition);
    
    // Right column - Receipt details
    yPosition -= 16;
    doc.text(`Receipt No: ${transaction.receiptNumber}`, pageWidth - 40, yPosition, { align: 'right' });
    yPosition += 8;
    doc.text(`Date: ${new Date(transaction.date).toLocaleDateString('en-IN')}`, pageWidth - 40, yPosition, { align: 'right' });
    yPosition += 8;
    doc.text(`Payment Mode: ${transaction.paymentMode}`, pageWidth - 40, yPosition, { align: 'right' });
    
    yPosition += 40;
    
    // Payment details section
    doc.setFillColor(...COLORS.white);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(1);
    doc.roundedRect(25, yPosition, pageWidth - 50, 35, 6, 6, 'FD');
    
    yPosition += 18;
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(`Payment Purpose: ${transaction.purpose}`, 40, yPosition);
    
    // Payment months (if available)
    if (transaction.payment_months && transaction.payment_months.length > 0) {
      yPosition += 10;
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.textLight);
      doc.setFont('helvetica', 'normal');
      doc.text(`Payment Months: ${transaction.payment_months.join(', ')}`, 40, yPosition);
    }
    
    yPosition += 35;
    
    // Amount section - highly prominent
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(25, yPosition, pageWidth - 50, 80, 12, 12, 'F');
    
    yPosition += 25;
    doc.setFontSize(18);
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.text('AMOUNT PAID', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 25;
    doc.setFontSize(40);
    doc.setFont('helvetica', 'bold');
    
    const amount = transaction.amount.toLocaleString('en-IN');
    const rupeeText = `₹ ${amount}`;
    doc.text(rupeeText, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(240, 245, 255);
    doc.text('(Amount in Indian Rupees)', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 40;
    
    // Professional thank you note
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your payment. Please retain this receipt for your records.', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('For any queries, please contact the administration office.', pageWidth / 2, yPosition, { align: 'center' });
    
    addProfessionalFooter(doc);
    
    const fileName = `fee-receipt-${(student.name || student.full_name).replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating fee invoice PDF:', error);
    throw new Error('Failed to generate fee invoice PDF');
  }
};

// Enhanced Test Result PDF - minimal and professional
export const exportTestToPDF = (data: TestPDFData) => {
  try {
    const { test, student, title, subtitle, allTests } = data;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add professional header
    let yPosition = addProfessionalHeader(doc, 'Academic Test Report', 'Performance Analysis & Results');
    
    // Student profile card
    doc.setFillColor(...COLORS.background);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(1);
    doc.roundedRect(25, yPosition, pageWidth - 50, 50, 8, 8, 'FD');
    
    yPosition += 20;
    doc.setFontSize(18);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(`Student: ${student.full_name || student.name}`, 40, yPosition);
    
    yPosition += 12;
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(`Class: ${student.class} • Student ID: ${student.id?.slice(-6) || 'N/A'}`, 40, yPosition);
    
    yPosition += 45;
    
    if (allTests && allTests.length > 0) {
      // Multiple tests - enhanced table design
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...COLORS.text);
      doc.text('Comprehensive Test Performance', 30, yPosition);
      yPosition += 20;
      
      const tableData = allTests.map((testItem, index) => {
        const percentage = Math.round((testItem.marks / testItem.total_marks) * 100);
        const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'F';
        
        return [
          (index + 1).toString(),
          testItem.test_name || 'Test',
          testItem.subject || 'Subject',
          `${testItem.marks}/${testItem.total_marks}`,
          `${percentage}%`,
          grade
        ];
      });
      
      autoTable(doc, {
        startY: yPosition,
        head: [['S.No', 'Test Name', 'Subject', 'Score', 'Percentage', 'Grade']],
        body: tableData,
        styles: {
          fontSize: 11,
          cellPadding: 8,
          font: 'helvetica',
          textColor: COLORS.text
        },
        headStyles: {
          fillColor: COLORS.primary,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 12
        },
        alternateRowStyles: {
          fillColor: COLORS.background,
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 50 },
          2: { cellWidth: 35 },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' },
          5: { cellWidth: 20, halign: 'center' },
        },
        didParseCell: function(data) {
          if (data.column.index === 5 && data.section === 'body') {
            const grade = data.cell.text[0];
            if (grade === 'A+' || grade === 'A') {
              data.cell.styles.textColor = COLORS.success;
              data.cell.styles.fontStyle = 'bold';
            } else if (grade === 'F') {
              data.cell.styles.textColor = COLORS.danger;
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });
    } else {
      // Single test result - enhanced design
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...COLORS.text);
      doc.text('Test Result Details', 30, yPosition);
      
      yPosition += 20;
      
      // Test details card
      doc.setFillColor(...COLORS.white);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(1);
      doc.roundedRect(25, yPosition, pageWidth - 50, 100, 8, 8, 'FD');
      
      yPosition += 25;
      doc.setFontSize(14);
      doc.setTextColor(...COLORS.text);
      doc.setFont('helvetica', 'normal');
      
      // Handle both TestRecordDb and LegacyTestFormat
      let percentage, marks, totalMarks, testDate;
      
      if ('test_id' in test) {
        // TestRecordDb format
        const testName = `Test ${test.test_id}`;
        doc.text(`Test Name: ${testName}`, 40, yPosition);
        yPosition += 12;
        doc.text(`Marks Obtained: ${test.marks_obtained}`, 40, yPosition);
        yPosition += 12;
        doc.text(`Total Marks: ${test.total_marks}`, 40, yPosition);
        
        percentage = test.percentage || Math.round(test.marks_obtained / test.total_marks * 100);
        testDate = new Date(test.created_at || Date.now()).toLocaleDateString('en-IN');
      } else {
        // LegacyTestFormat
        doc.text(`Test Name: ${test.test_name}`, 40, yPosition);
        yPosition += 12;
        doc.text(`Subject: ${test.subject}`, 40, yPosition);
        yPosition += 12;
        doc.text(`Marks: ${test.marks}/${test.total_marks}`, 40, yPosition);
        
        percentage = Math.round((test.marks / test.total_marks) * 100);
        testDate = new Date(test.test_date).toLocaleDateString('en-IN');
      }
      
      yPosition += 20;
      
      // Performance badge - prominent
      const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'F';
      const badgeColor = percentage >= 75 ? COLORS.success : percentage >= 50 ? COLORS.warning : COLORS.danger;
      
      doc.setFillColor(...badgeColor);
      doc.roundedRect(40, yPosition - 5, 80, 25, 6, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...COLORS.white);
      doc.text(`${percentage}% (${grade})`, 80, yPosition + 8, { align: 'center' });
      
      yPosition += 30;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.textLight);
      doc.text(`Test Date: ${testDate}`, 40, yPosition);
    }
    
    addProfessionalFooter(doc);
    
    const studentName = (student.full_name || student.name || 'student').replace(/\s+/g, '-').toLowerCase();
    const fileName = `test-result-${studentName}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating test PDF:', error);
    throw new Error('Failed to generate test PDF');
  }
};

// New Academic Records Report - professional and minimal
export const exportAcademicRecordsPDF = (data: {
  student: any;
  academicYear: string;
  subjects: any[];
  overallGPA: number;
  totalCredits: number;
  attendance: {
    percentage: number;
    totalDays: number;
    presentDays: number;
  };
}) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add modern header
    let yPosition = addProfessionalHeader(doc, 'Academic Records', `Comprehensive Academic Report - ${data.academicYear}`);
    
    // Student profile section
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(1);
    doc.roundedRect(30, yPosition, pageWidth - 60, 55, 8, 8, 'FD');
    
    yPosition += 20;
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.student.full_name || data.student.name}`, 45, yPosition);
    
    yPosition += 12;
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(`Class: ${data.student.class} • Academic Year: ${data.academicYear}`, 45, yPosition);
    
    yPosition += 12;
    doc.text(`Student ID: ${data.student.id?.slice(-6) || 'N/A'} • Overall GPA: ${data.overallGPA.toFixed(2)}`, 45, yPosition);
    
    yPosition += 40;
    
    // Academic summary cards
    const summaryData = [
      { label: 'Overall GPA', value: data.overallGPA.toFixed(2), color: COLORS.primary },
      { label: 'Total Credits', value: data.totalCredits.toString(), color: COLORS.secondary },
      { label: 'Attendance', value: `${data.attendance.percentage}%`, color: COLORS.success },
      { label: 'Present Days', value: `${data.attendance.presentDays}/${data.attendance.totalDays}`, color: COLORS.warning }
    ];
    
    const cardWidth = (pageWidth - 100) / 4;
    
    summaryData.forEach((item, index) => {
      const x = 40 + (index * (cardWidth + 10));
      
      doc.setFillColor(...COLORS.white);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(1);
      doc.roundedRect(x, yPosition, cardWidth, 40, 6, 6, 'FD');
      
      doc.setFillColor(...item.color);
      doc.rect(x, yPosition, cardWidth, 4, 'F');
      
      doc.setTextColor(...COLORS.text);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(item.value, x + cardWidth/2, yPosition + 22, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.textLight);
      doc.setFont('helvetica', 'normal');
      doc.text(item.label, x + cardWidth/2, yPosition + 32, { align: 'center' });
    });
    
    yPosition += 60;
    
    // Subject performance table
    if (data.subjects && data.subjects.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(...COLORS.text);
      doc.setFont('helvetica', 'bold');
      doc.text('Subject-wise Performance', 40, yPosition);
      yPosition += 15;
      
      const tableData = data.subjects.map((subject, index) => [
        (index + 1).toString(),
        subject.name || 'Subject',
        subject.totalMarks?.toString() || '100',
        subject.obtainedMarks?.toString() || '0',
        `${Math.round((subject.obtainedMarks / subject.totalMarks) * 100)}%`,
        subject.grade || 'N/A'
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['S.No', 'Subject', 'Total Marks', 'Obtained', 'Percentage', 'Grade']],
        body: tableData,
        styles: {
          fontSize: 11,
          cellPadding: 8,
          font: 'helvetica',
          textColor: COLORS.text
        },
        headStyles: {
          fillColor: COLORS.primary,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 12
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252] as [number, number, number],
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 50 },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' },
          5: { cellWidth: 20, halign: 'center' },
        }
      });
    }
    
    addProfessionalFooter(doc);
    
    const studentName = (data.student.full_name || data.student.name || 'student').replace(/\s+/g, '-').toLowerCase();
    const fileName = `academic-records-${studentName}-${data.academicYear.replace(/\s+/g, '-')}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating academic records PDF:', error);
    throw new Error('Failed to generate academic records PDF');
  }
};

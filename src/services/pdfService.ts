
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

// Institute branding constants
const INSTITUTE_NAME = "INFINITY CLASSES";
const INSTITUTE_PHONE = "+91 9905880697";
const INSTITUTE_EMAIL = "theinfinityclasses1208@gmail.com";

// Enhanced color palette for professional design
const COLORS = {
  primary: [13, 33, 84] as [number, number, number],
  secondary: [59, 130, 246] as [number, number, number],
  accent: [34, 197, 94] as [number, number, number],
  text: [15, 23, 42] as [number, number, number],
  textLight: [71, 85, 105] as [number, number, number],
  background: [248, 250, 252] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number]
};

// Enhanced header function
const addInstituteHeader = (doc: jsPDF, reportType: string = '') => {
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 25;

  // Institute name with bold styling
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.primary);
  doc.text(INSTITUTE_NAME, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  
  // Contact details
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  doc.text(`${INSTITUTE_PHONE} | ${INSTITUTE_EMAIL}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;
  
  // Separator line
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(2);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  
  // Report type indicator
  if (reportType) {
    yPosition += 18;
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text(reportType.toUpperCase(), pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  }
  
  return yPosition + 20;
};

// Enhanced footer
const addFooter = (doc: jsPDF) => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  // Footer separator
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(1);
  doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  
  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.text(`Generated on ${currentDate}`, 30, pageHeight - 15);
  
  // Institute name in footer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.primary);
  doc.text(INSTITUTE_NAME, pageWidth - 30, pageHeight - 15, { align: 'right' });
};

// Attendance export function
export const exportAttendanceToPDF = (data: PDFExportData) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add institute header
    let yPosition = addInstituteHeader(doc, 'Student Attendance Report');
    
    // Document title
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(data.title, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 12;
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(data.subtitle, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 30;
    
    // Student information card
    doc.setFillColor(...COLORS.background);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(1);
    doc.roundedRect(25, yPosition, pageWidth - 50, 40, 6, 6, 'FD');
    
    yPosition += 15;
    doc.setFontSize(18);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.studentData.name}`, 35, yPosition);
    
    yPosition += 12;
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'normal');
    doc.text(`Class ${data.studentData.class}`, 35, yPosition);
    
    // Attendance percentage badge
    const attendancePercentage = data.studentData.attendancePercentage;
    const badgeColor = attendancePercentage >= 90 ? COLORS.accent : 
                      attendancePercentage >= 75 ? COLORS.secondary : 
                      attendancePercentage >= 50 ? COLORS.amber : COLORS.red;
    
    doc.setFillColor(...badgeColor);
    doc.roundedRect(pageWidth - 95, yPosition - 25, 60, 25, 4, 4, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`${attendancePercentage}%`, pageWidth - 65, yPosition - 10, { align: 'center' });
    
    yPosition += 30;
    
    // Summary Statistics
    if (data.records.length > 0) {
      const present = data.records.filter(r => r.status === 'Present').length;
      const absent = data.records.filter(r => r.status === 'Absent').length;
      const leave = data.records.filter(r => r.status === 'Leave').length;
      const total = data.records.length;
      
      // Statistics cards
      const cardWidth = (pageWidth - 80) / 4;
      const cardHeight = 45;
      const startX = 30;
      
      const stats = [
        { label: 'Present', value: present, color: COLORS.accent },
        { label: 'Absent', value: absent, color: COLORS.red },
        { label: 'Leave', value: leave, color: COLORS.amber },
        { label: 'Total', value: total, color: COLORS.secondary }
      ];
      
      stats.forEach((stat, index) => {
        const x = startX + (index * (cardWidth + 10));
        
        // Card background
        doc.setFillColor(...COLORS.white);
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(1);
        doc.roundedRect(x, yPosition, cardWidth, cardHeight, 4, 4, 'FD');
        
        // Colored top bar
        doc.setFillColor(...stat.color);
        doc.roundedRect(x, yPosition, cardWidth, 6, 4, 4, 'F');
        
        // Value
        doc.setTextColor(...COLORS.text);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text(stat.value.toString(), x + cardWidth/2, yPosition + 23, { align: 'center' });
        
        // Label
        doc.setFontSize(11);
        doc.setTextColor(...COLORS.textLight);
        doc.setFont('helvetica', 'normal');
        doc.text(stat.label, x + cardWidth/2, yPosition + 37, { align: 'center' });
      });
      
      yPosition += 65;
    }
    
    // Attendance Table
    if (data.records.length > 0) {
      const tableData = data.records.map((record, index) => [
        (index + 1).toString(),
        new Date(record.date).toLocaleDateString('en-IN'),
        new Date(record.date).toLocaleDateString('en-IN', { weekday: 'long' }),
        record.status
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['S.No', 'Date', 'Day', 'Status']],
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
          fillColor: [252, 252, 252] as [number, number, number],
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' },
          1: { cellWidth: 55, halign: 'center' },
          2: { cellWidth: 60 },
          3: { cellWidth: 35, halign: 'center' },
        },
        didParseCell: function(data) {
          if (data.column.index === 3 && data.section === 'body') {
            const status = data.cell.text[0];
            switch (status) {
              case 'Present':
                data.cell.styles.textColor = COLORS.accent;
                data.cell.styles.fontStyle = 'bold';
                break;
              case 'Absent':
                data.cell.styles.textColor = COLORS.red;
                data.cell.styles.fontStyle = 'bold';
                break;
              case 'Leave':
                data.cell.styles.textColor = COLORS.amber;
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
    } else {
      // No data message
      doc.setFontSize(16);
      doc.setTextColor(...COLORS.textLight);
      doc.text('No attendance records found for the selected period.', pageWidth / 2, yPosition + 40, { align: 'center' });
    }
    
    // Add footer
    addFooter(doc);
    
    // Save the PDF
    const fileName = `attendance-${data.studentData.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating attendance PDF:', error);
    throw new Error('Failed to generate attendance PDF');
  }
};

// Fee invoice export - Fixed property names to match FeeTransaction interface
export const exportFeeInvoicePDF = (options: FeeInvoicePDFOptions) => {
  try {
    const { transaction, student } = options;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add institute header
    let yPosition = addInstituteHeader(doc, 'Fee Invoice');
    
    // Invoice title
    doc.setFontSize(26);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT RECEIPT', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 30;
    
    // Invoice details card
    doc.setFillColor(...COLORS.background);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(1);
    doc.roundedRect(25, yPosition, pageWidth - 50, 85, 8, 8, 'FD');
    
    yPosition += 18;
    
    // Student Information
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT DETAILS', 35, yPosition);
    
    yPosition += 15;
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${student.name || student.full_name}`, 35, yPosition);
    yPosition += 10;
    doc.text(`Class: ${student.class}`, 35, yPosition);
    yPosition += 10;
    doc.text(`Receipt No: ${transaction.receiptNumber}`, 35, yPosition);
    
    // Payment Details (right side)
    yPosition -= 35;
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT DETAILS', pageWidth - 35, yPosition, { align: 'right' });
    
    yPosition += 15;
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(transaction.date).toLocaleDateString('en-IN')}`, pageWidth - 35, yPosition, { align: 'right' });
    yPosition += 10;
    doc.text(`Mode: ${transaction.paymentMode}`, pageWidth - 35, yPosition, { align: 'right' });
    yPosition += 10;
    doc.text(`Purpose: ${transaction.purpose}`, pageWidth - 35, yPosition, { align: 'right' });
    
    yPosition += 45;
    
    // Amount section
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(25, yPosition, pageWidth - 50, 50, 8, 8, 'F');
    
    yPosition += 18;
    doc.setFontSize(18);
    doc.setTextColor(...COLORS.white);
    doc.setFont('helvetica', 'bold');
    doc.text('AMOUNT PAID', 35, yPosition);
    
    yPosition += 25;
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    
    // Format amount with rupee symbol
    const amount = transaction.amount.toLocaleString('en-IN');
    const rupeeText = `Rs. ${amount}`;
    doc.text(rupeeText, pageWidth - 35, yPosition, { align: 'right' });
    
    yPosition += 40;
    
    // Thank you note
    doc.setFontSize(15);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your payment. Please keep this receipt for your records.', pageWidth / 2, yPosition, { align: 'center' });
    
    // Add footer
    addFooter(doc);
    
    // Save the PDF
    const fileName = `fee-receipt-${(student.name || student.full_name).replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating fee invoice PDF:', error);
    throw new Error('Failed to generate fee invoice PDF');
  }
};

// Test result export
export const exportTestToPDF = (data: TestPDFData) => {
  try {
    const { test, student, title, subtitle, allTests } = data;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add institute header
    let yPosition = addInstituteHeader(doc, 'Test Result Report');
    
    // Report title
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 12;
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 30;
    
    // Student information card
    doc.setFillColor(...COLORS.background);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(1);
    doc.roundedRect(25, yPosition, pageWidth - 50, 40, 6, 6, 'FD');
    
    yPosition += 15;
    doc.setFontSize(18);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text(`Student: ${student.full_name || student.name}`, 35, yPosition);
    
    yPosition += 12;
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'normal');
    doc.text(`Class: ${student.class}`, 35, yPosition);
    
    yPosition += 35;
    
    if (allTests && allTests.length > 0) {
      // Multiple tests - show table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...COLORS.primary);
      doc.text('TEST PERFORMANCE SUMMARY', 35, yPosition);
      yPosition += 25;
      
      const tableData = allTests.map((testItem, index) => [
        (index + 1).toString(),
        testItem.test_name || 'Test',
        testItem.subject || 'Subject',
        `${testItem.marks}/${testItem.total_marks}`,
        `${Math.round((testItem.marks / testItem.total_marks) * 100)}%`
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['S.No', 'Test Name', 'Subject', 'Score', 'Percentage']],
        body: tableData,
        styles: {
          fontSize: 12,
          cellPadding: 8,
          font: 'helvetica',
          textColor: COLORS.text
        },
        headStyles: {
          fillColor: COLORS.primary,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 13
        },
        alternateRowStyles: {
          fillColor: [252, 252, 252] as [number, number, number],
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' },
          1: { cellWidth: 65 },
          2: { cellWidth: 45 },
          3: { cellWidth: 35, halign: 'center' },
          4: { cellWidth: 35, halign: 'center' },
        }
      });
    } else {
      // Single test result
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...COLORS.primary);
      doc.text('TEST RESULT', 35, yPosition);
      
      yPosition += 25;
      
      // Test details card
      doc.setFillColor(...COLORS.background);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(1);
      doc.roundedRect(25, yPosition, pageWidth - 50, 80, 6, 6, 'FD');
      
      yPosition += 18;
      doc.setFontSize(14);
      doc.setTextColor(...COLORS.text);
      doc.setFont('helvetica', 'normal');
      
      // Handle both TestRecordDb and LegacyTestFormat
      if ('test_id' in test) {
        // TestRecordDb format
        const testName = `Test ${test.test_id}`;
        doc.text(`Test Name: ${testName}`, 35, yPosition);
        yPosition += 12;
        doc.text(`Marks Obtained: ${test.marks_obtained}`, 35, yPosition);
        yPosition += 12;
        doc.text(`Total Marks: ${test.total_marks}`, 35, yPosition);
        yPosition += 18;
        
        const percentage = test.percentage || Math.round(test.marks_obtained / test.total_marks * 100);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        const textColor = percentage >= 75 ? COLORS.accent : percentage >= 50 ? COLORS.amber : COLORS.red;
        doc.setTextColor(...textColor);
        doc.text(`Percentage: ${percentage}%`, 35, yPosition);
        
        yPosition += 18;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(...COLORS.textLight);
        doc.text(`Date: ${new Date(test.created_at || Date.now()).toLocaleDateString('en-IN')}`, 35, yPosition);
      } else {
        // LegacyTestFormat
        doc.text(`Test Name: ${test.test_name}`, 35, yPosition);
        yPosition += 12;
        doc.text(`Subject: ${test.subject}`, 35, yPosition);
        yPosition += 12;
        doc.text(`Marks: ${test.marks}/${test.total_marks}`, 35, yPosition);
        yPosition += 18;
        
        const percentage = Math.round((test.marks / test.total_marks) * 100);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        const textColor = percentage >= 75 ? COLORS.accent : percentage >= 50 ? COLORS.amber : COLORS.red;
        doc.setTextColor(...textColor);
        doc.text(`Percentage: ${percentage}%`, 35, yPosition);
        
        yPosition += 18;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(...COLORS.textLight);
        doc.text(`Date: ${new Date(test.test_date).toLocaleDateString('en-IN')}`, 35, yPosition);
      }
    }
    
    // Add footer
    addFooter(doc);
    
    // Save the PDF
    const studentName = (student.full_name || student.name || 'student').replace(/\s+/g, '-').toLowerCase();
    const fileName = `test-result-${studentName}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating test PDF:', error);
    throw new Error('Failed to generate test PDF');
  }
};

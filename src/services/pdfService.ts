import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, FeeTransaction, AttendanceRecord } from '@/types';
import { format } from 'date-fns';

// Institute details
const INSTITUTE_DETAILS = {
  name: "INFINITY CLASSES",
  address: "Kandri, Mandar, Ranchi",
  phone: "+91 9905880697",
  email: "theinfinityclasses1208@gmail.com",
  logo: "/icon.png"
};

// Modern color palette with proper tuple typing
const COLORS = {
  primary: [79, 70, 229] as [number, number, number], // Indigo
  secondary: [99, 102, 241] as [number, number, number], // Light indigo
  accent: [34, 197, 94] as [number, number, number], // Green
  warning: [251, 191, 36] as [number, number, number], // Amber
  danger: [239, 68, 68] as [number, number, number], // Red
  success: [34, 197, 94] as [number, number, number], // Green
  text: [31, 41, 55] as [number, number, number], // Gray-800
  muted: [107, 114, 128] as [number, number, number], // Gray-500
  light: [249, 250, 251] as [number, number, number], // Gray-50
  white: [255, 255, 255] as [number, number, number]
};

// Add modern header with branding
const addModernHeader = (doc: jsPDF, title: string, subtitle?: string) => {
  // Header background gradient effect
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, 210, 45, 'F');
  
  // Add logo placeholder (since we can't load external files in this context)
  doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.roundedRect(15, 10, 25, 25, 3, 3, 'F');
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.setFontSize(10);
  doc.text('LOGO', 27.5, 25, { align: 'center' });
  
  // Institute name (using regular font since we can't load custom fonts in jsPDF easily)
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(INSTITUTE_DETAILS.name, 50, 20);
  
  // Contact details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(INSTITUTE_DETAILS.address, 50, 28);
  doc.text(`Phone: ${INSTITUTE_DETAILS.phone} | Email: ${INSTITUTE_DETAILS.email}`, 50, 35);
  
  // Document title
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 15, 60);
  
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.text(subtitle, 15, 70);
    return 80;
  }
  
  return 70;
};

// Add modern footer
const addModernFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
  const pageHeight = doc.internal.pageSize.height;
  
  // Footer line
  doc.setLineWidth(0.5);
  doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.line(15, pageHeight - 25, 195, pageHeight - 25);
  
  // Footer content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy')} | ${INSTITUTE_DETAILS.name}`, 15, pageHeight - 18);
  doc.text(`Page ${pageNum} of ${totalPages}`, 195, pageHeight - 18, { align: 'right' });
  
  // Watermark
  doc.setTextColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.setFontSize(40);
  doc.text(INSTITUTE_DETAILS.name, 105, pageHeight / 2, { 
    align: 'center', 
    angle: 45,
    renderingMode: 'stroke'
  });
};

// PDF export for fee records
export const exportFeesToPDF = (transactions: FeeTransaction[], student: Student) => {
  const doc = new jsPDF();
  
  const startY = addModernHeader(doc, 'Fee Transaction Report', `Complete fee history for ${student.name}`);
  
  // Student info card
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(15, startY + 10, 180, 25, 5, 5, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.text(`Student: ${student.name}`, 20, startY + 20);
  doc.text(`Class: ${student.class}`, 20, startY + 28);
  
  const totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0);
  doc.setTextColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
  doc.text(`Total Paid: ₹${totalPaid.toLocaleString()}`, 130, startY + 20);
  doc.text(`Transactions: ${transactions.length}`, 130, startY + 28);

  const tableColumn = ["Date", "Amount", "Payment Mode", "Receipt No.", "Purpose"];
  const tableRows: string[][] = [];

  transactions.forEach(transaction => {
    const transactionData = [
      format(new Date(transaction.date), 'dd MMM yyyy'),
      `₹${transaction.amount.toLocaleString()}`,
      transaction.paymentMode,
      transaction.receiptNumber || 'N/A',
      transaction.purpose || 'School Fees'
    ];
    tableRows.push(transactionData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: startY + 45,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.text
    },
    alternateRowStyles: {
      fillColor: COLORS.light
    },
    styles: {
      cellPadding: 8,
      lineWidth: 0.1,
      lineColor: COLORS.muted
    }
  });

  // Add footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addModernFooter(doc, i, pageCount);
  }

  doc.save(`fee_transactions_${student.name.replace(/\s+/g, "_")}.pdf`);
};

// PDF export for attendance records
export interface AttendancePDFOptions {
  records: AttendanceRecord[];
  studentData: any;
  title: string;
  subtitle: string;
  logo?: string;
  chartImage?: string | null;
}

export const exportAttendanceToPDF = (options: AttendancePDFOptions) => {
  const { records, studentData, title, subtitle, chartImage } = options;
  const doc = new jsPDF();
  
  const startY = addModernHeader(doc, title, subtitle);
  
  // Student summary card
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(15, startY + 10, 180, 30, 5, 5, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  if (studentData.id) {
    doc.text(`Student: ${studentData.name}`, 20, startY + 22);
    doc.text(`Class: ${studentData.class}`, 20, startY + 30);
  } else {
    doc.text(`Class: ${studentData.name}`, 20, startY + 22);
  }
  
  // Attendance percentage with color coding
  const percentage = studentData.attendancePercentage;
  const percentageColor = percentage >= 90 ? COLORS.success : 
                         percentage >= 75 ? COLORS.primary : 
                         percentage >= 60 ? COLORS.warning : COLORS.danger;
  
  doc.setTextColor(percentageColor[0], percentageColor[1], percentageColor[2]);
  doc.setFontSize(16);
  doc.text(`${percentage}%`, 150, startY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Attendance', 150, startY + 30);
  
  let currentY = startY + 55;
  
  // Add chart if provided
  if (chartImage) {
    doc.addImage(chartImage, 'PNG', 55, currentY, 100, 60);
    currentY += 75;
  }
  
  // Attendance records table
  const tableRows = records.map(record => [
    record.id.toString(),
    record.studentId,
    format(new Date(record.date), 'dd MMM yyyy'),
    record.status
  ]);
  
  autoTable(doc, {
    head: [['ID', 'Student ID', 'Date', 'Status']],
    body: tableRows,
    startY: currentY,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.text
    },
    alternateRowStyles: {
      fillColor: COLORS.light
    },
    styles: {
      cellPadding: 6
    }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addModernFooter(doc, i, pageCount);
  }
  
  doc.save(`attendance-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

// PDF export for student records
export interface StudentPDFOptions {
  students: Student[];
  title: string;
  subtitle?: string;
  logo?: string;
}

export const exportStudentsToPDF = (options: StudentPDFOptions) => {
  const { students, title, subtitle } = options;
  const doc = new jsPDF();

  const startY = addModernHeader(doc, title, subtitle);

  // Summary cards
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(15, startY + 10, 85, 20, 5, 5, 'F');
  doc.roundedRect(110, startY + 10, 85, 20, 5, 5, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(`Total Students: ${students.length}`, 20, startY + 22);
  
  const totalFees = students.reduce((sum, s) => sum + (s.totalFees || 0), 0);
  doc.text(`Total Fees: ₹${totalFees.toLocaleString()}`, 115, startY + 22);

  const tableColumn = ["Name", "Class", "Father's Name", "Phone", "Fee Status", "Total Fees", "Paid Fees", "Attendance %"];
  const tableRows: string[][] = [];

  students.forEach(student => {
    const studentData = [
      student.name,
      student.class,
      student.fatherName || 'N/A',
      student.phoneNumber || 'N/A',
      student.feeStatus,
      `₹${(student.totalFees || 0).toLocaleString()}`,
      `₹${(student.paidFees || 0).toLocaleString()}`,
      `${student.attendancePercentage || 0}%`
    ];
    tableRows.push(studentData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: startY + 45,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.text
    },
    alternateRowStyles: {
      fillColor: COLORS.light
    },
    styles: {
      cellPadding: 4,
      fontSize: 8
    }
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addModernFooter(doc, i, pageCount);
  }

  doc.save("student_records.pdf");
};

// PDF export for fee invoice
export interface FeeInvoicePDFOptions {
  transaction: FeeTransaction;
  student: Student;
  instituteName: string;
  instituteAddress: string;
  institutePhone: string;
  logo?: string;
}

export const exportFeeInvoicePDF = (options: FeeInvoicePDFOptions) => {
  const { transaction, student } = options;
  const doc = new jsPDF();
  
  const startY = addModernHeader(doc, 'FEE RECEIPT', `Receipt No: ${transaction.receiptNumber || transaction.id}`);
  
  // Receipt details in modern cards
  doc.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2]);
  doc.roundedRect(15, startY + 10, 180, 35, 8, 8, 'F');
  
  // Amount section
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(`₹${transaction.amount.toLocaleString()}`, 105, startY + 25, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Amount Paid', 105, startY + 35, { align: 'center' });
  
  // Student and payment details
  const detailsY = startY + 60;
  
  // Student details card
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(15, detailsY, 85, 40, 5, 5, 'F');
  
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('STUDENT DETAILS', 20, detailsY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name: ${student.name}`, 20, detailsY + 16);
  doc.text(`Class: ${student.class}`, 20, detailsY + 23);
  doc.text(`Purpose: ${transaction.purpose || 'School Fees'}`, 20, detailsY + 30);
  
  // Payment details card
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(110, detailsY, 85, 40, 5, 5, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PAYMENT DETAILS', 115, detailsY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Date: ${format(new Date(transaction.date), 'dd MMM yyyy')}`, 115, detailsY + 16);
  doc.text(`Method: ${transaction.paymentMode}`, 115, detailsY + 23);
  doc.text(`Receipt: ${transaction.receiptNumber || 'N/A'}`, 115, detailsY + 30);
  
  // Fee breakdown table
  autoTable(doc, {
    head: [['Description', 'Amount']],
    body: [[transaction.purpose || 'School Fees', `₹${transaction.amount.toLocaleString()}`]],
    startY: detailsY + 50,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 11,
      textColor: COLORS.text
    },
    styles: {
      cellPadding: 8
    }
  });
  
  // Total amount highlight
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.roundedRect(130, finalY, 65, 15, 3, 3, 'F');
  doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Total: ₹${transaction.amount.toLocaleString()}`, 162.5, finalY + 10, { align: 'center' });
  
  // Signature section
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text("Authorized Signature", 150, finalY + 35);
  doc.line(150, finalY + 40, 190, finalY + 40);
  
  addModernFooter(doc, 1, 1);
  
  doc.save(`fee_receipt_${student.name.replace(/\s+/g, "_")}_${transaction.id}.pdf`);
};

// PDF export for reports
export interface ReportPDFOptions {
  title: string;
  chartImages: string[];
  summary: { label: string; value: string }[];
  instituteName: string;
  logo?: string;
}

export const exportReportToPDF = (options: ReportPDFOptions) => {
  const { title, chartImages, summary } = options;
  const doc = new jsPDF();
  
  const startY = addModernHeader(doc, title, 'Comprehensive Analytics Report');
  
  // Summary cards
  let cardY = startY + 15;
  const cardWidth = 85;
  const cardHeight = 20;
  
  summary.forEach((item, index) => {
    const x = 15 + (index % 2) * (cardWidth + 10);
    const y = cardY + Math.floor(index / 2) * (cardHeight + 5);
    
    doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text(item.label, x + 5, y + 8);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text(item.value, x + 5, y + 16);
  });
  
  let yPos = cardY + Math.ceil(summary.length / 2) * (cardHeight + 5) + 20;
  
  // Charts section
  if (chartImages.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.text("Visual Analytics", 15, yPos);
    yPos += 15;
    
    chartImages.forEach((chartImage, index) => {
      if (yPos > 220) {
        doc.addPage();
        yPos = 30;
      }
      
      doc.addImage(chartImage, 'PNG', 20, yPos, 170, 80);
      yPos += 90;
    });
  }
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addModernFooter(doc, i, pageCount);
  }
  
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

// Export the new questions PDF function
export { exportQuestionsToPDF } from './questionsPdfService';

// Test PDF export
export interface TestPDFOptions {
  test: any;
  student: any;
  title?: string;
  subtitle?: string;
  logo?: string;
  chartImage?: string;
  allTests?: any[];
}

export const exportTestToPDF = (options: TestPDFOptions) => {
  const { test, student, title = "Test Results", subtitle, chartImage, allTests } = options;
  const doc = new jsPDF();
  
  const startY = addModernHeader(doc, title, subtitle || `Performance Report for ${student.full_name || "Student"}`);
  
  // Student info card
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(15, startY + 10, 180, 25, 5, 5, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.text(`Student: ${student.full_name || "Unknown"}`, 20, startY + 22);
  doc.text(`Class: ${student.class || "N/A"}`, 20, startY + 30);
  
  let yPosition = startY + 50;
  
  if (allTests && allTests.length > 0) {
    // Multiple tests summary
    const totalPercent = allTests.reduce((sum, test) => sum + ((test.marks / test.total_marks) * 100), 0);
    const averagePercent = Math.round(totalPercent / allTests.length);
    
    // Summary cards
    doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.roundedRect(15, yPosition, 85, 30, 5, 5, 'F');
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`${averagePercent}%`, 57.5, yPosition + 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Average Score', 57.5, yPosition + 23, { align: 'center' });
    
    doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.roundedRect(110, yPosition, 85, 30, 5, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`${allTests.length}`, 152.5, yPosition + 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Total Tests', 152.5, yPosition + 23, { align: 'center' });
    
    yPosition += 45;
    
    // Tests table
    const tableRows = allTests.map(test => {
      const percent = Math.round((test.marks / test.total_marks) * 100);
      let grade = "F";
      if (percent >= 90) grade = "A";
      else if (percent >= 75) grade = "B";
      else if (percent >= 60) grade = "C";
      else if (percent >= 40) grade = "D";
      
      return [
        format(new Date(test.test_date), 'dd MMM yyyy'),
        test.subject,
        test.test_name,
        `${test.marks}/${test.total_marks}`,
        `${percent}%`,
        grade
      ];
    });
    
    autoTable(doc, {
      head: [["Date", "Subject", "Test Name", "Score", "Percentage", "Grade"]],
      body: tableRows,
      startY: yPosition,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: COLORS.text
      },
      alternateRowStyles: {
        fillColor: COLORS.light
      },
      styles: {
        cellPadding: 6
      }
    });
  } else {
    // Single test details
    const percentage = Math.round((test.marks / test.total_marks) * 100);
    
    // Score card
    const scoreColor = percentage >= 90 ? COLORS.success : 
                      percentage >= 75 ? COLORS.primary : 
                      percentage >= 60 ? COLORS.warning : COLORS.danger;
    
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.roundedRect(15, yPosition, 180, 40, 8, 8, 'F');
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(`${percentage}%`, 105, yPosition + 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`${test.marks}/${test.total_marks} Marks`, 105, yPosition + 30, { align: 'center' });
    
    yPosition += 55;
    
    // Test details
    doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
    doc.roundedRect(15, yPosition, 180, 30, 5, 5, 'F');
    
    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TEST DETAILS', 20, yPosition + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Subject: ${test.subject}`, 20, yPosition + 18);
    doc.text(`Test Name: ${test.test_name}`, 20, yPosition + 25);
    doc.text(`Date: ${format(new Date(test.test_date), 'dd MMM yyyy')}`, 115, yPosition + 18);
    
    // Grade calculation
    let grade = "F";
    if (percentage >= 90) grade = "A";
    else if (percentage >= 75) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 40) grade = "D";
    
    doc.text(`Grade: ${grade}`, 115, yPosition + 25);
    
    if (chartImage) {
      doc.addImage(chartImage, 'PNG', 50, yPosition + 40, 100, 60);
    }
  }
  
  addModernFooter(doc, 1, 1);
  
  const studentName = student.full_name ? student.full_name.replace(/\s+/g, "_") : "student";
  const fileName = allTests && allTests.length > 1 
    ? `test_history_${studentName}.pdf` 
    : `test_report_${studentName}_${test.subject}.pdf`;
    
  doc.save(fileName);
};

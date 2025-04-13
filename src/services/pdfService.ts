
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, FeeTransaction, AttendanceRecord } from '@/types';
import { format } from 'date-fns';

// PDF export for fee records
export const exportFeesToPDF = (transactions: FeeTransaction[], student: Student) => {
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.text(`Fee Transactions for ${student.name}`, 20, 20);

  const tableColumn = ["ID", "Amount", "Date", "Payment Mode", "Receipt Number", "Purpose"];
  const tableRows: string[][] = [];

  transactions.forEach(transaction => {
    const transactionData = [
      transaction.id,
      `₹${transaction.amount}`,
      format(new Date(transaction.date), 'dd/MM/yyyy'),
      transaction.paymentMode,
      transaction.receiptNumber,
      transaction.purpose
    ];
    tableRows.push(transactionData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
  });

  doc.save(`fee_transactions_${student.name.replace(" ", "_")}.pdf`);
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
  const { records, studentData, title, subtitle, logo, chartImage } = options;
  const doc = new jsPDF();
  
  // Add logo if provided
  if (logo) {
    doc.addImage(logo, 'PNG', 10, 10, 20, 20);
  }
  
  // Title
  doc.setFontSize(20);
  doc.text(title, 40, 20);
  
  // Subtitle
  doc.setFontSize(12);
  doc.text(subtitle, 40, 30);
  
  // Add a line below header
  doc.setLineWidth(0.5);
  doc.line(10, 35, 200, 35);
  
  // Student details if specific student
  if (studentData.id) {
    doc.setFontSize(12);
    doc.text(`Student: ${studentData.name}`, 10, 45);
    doc.text(`Class: ${studentData.class}`, 10, 52);
    doc.text(`Attendance: ${studentData.attendancePercentage}%`, 10, 59);
  } else {
    doc.text(`Class: ${studentData.name}`, 10, 45);
    doc.text(`Attendance: ${studentData.attendancePercentage}%`, 10, 52);
  }
  
  // Add chart if provided
  let yPosition = 70;
  if (chartImage) {
    doc.addImage(chartImage, 'PNG', 50, yPosition, 100, 60);
    yPosition += 75;
  }
  
  // Attendance records
  const tableRows = records.map(record => [
    record.id,
    record.studentId,
    format(new Date(record.date), 'dd/MM/yyyy'),
    record.status
  ]);
  
  autoTable(doc, {
    head: [['ID', 'Student ID', 'Date', 'Status']],
    body: tableRows,
    startY: yPosition,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: [240, 240, 250]
    }
  });
  
  // Save the PDF
  doc.save(`attendance-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

// PDF export for student records
export interface StudentPDFOptions {
  students: Student[];
  title: string;
  subtitle?: string;
  logo?: string;
}

export const exportStudentsToPDF = (options: StudentPDFOptions) => {
  const { students, title, subtitle, logo } = options;
  const doc = new jsPDF();

  // Add logo if provided
  if (logo) {
    doc.addImage(logo, 'PNG', 10, 10, 20, 20);
  }

  doc.setFontSize(22);
  doc.text(title, 20, 20);
  
  if (subtitle) {
    doc.setFontSize(14);
    doc.text(subtitle, 20, 30);
  }

  const tableColumn = ["ID", "Name", "Class", "Father's Name", "Mother's Name", "Phone Number", "Whatsapp Number", "Address", "Fee Status", "Total Fees", "Paid Fees", "Attendance Percentage", "Join Date"];
  const tableRows: string[][] = [];

  students.forEach(student => {
    const studentData = [
      student.id,
      student.name,
      student.class,
      student.fatherName,
      student.motherName,
      student.phoneNumber,
      student.whatsappNumber,
      student.address,
      student.feeStatus,
      `₹${student.totalFees}`,
      `₹${student.paidFees}`,
      `${student.attendancePercentage}%`,
      format(new Date(student.joinDate), 'dd/MM/yyyy')
    ];
    tableRows.push(studentData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: subtitle ? 35 : 30,
  });

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
  const { transaction, student, instituteName, instituteAddress, institutePhone, logo } = options;
  const doc = new jsPDF();
  
  // Add logo if provided
  if (logo) {
    doc.addImage(logo, 'PNG', 10, 10, 20, 20);
  }
  
  // Title and institute info
  doc.setFontSize(20);
  doc.text(instituteName, logo ? 40 : 10, 20);
  
  doc.setFontSize(12);
  doc.text(instituteAddress, logo ? 40 : 10, 30);
  doc.text(`Phone: ${institutePhone}`, logo ? 40 : 10, 38);
  
  // Invoice title
  doc.setFontSize(16);
  doc.text("FEE RECEIPT", 80, 50);
  
  // Add a line below header
  doc.setLineWidth(0.5);
  doc.line(10, 55, 200, 55);
  
  // Receipt details
  doc.setFontSize(12);
  doc.text(`Receipt No: ${transaction.receiptNumber || transaction.id}`, 10, 65);
  doc.text(`Date: ${format(new Date(transaction.date), 'dd/MM/yyyy')}`, 150, 65);
  
  // Student details
  doc.text(`Student Name: ${student.name}`, 10, 80);
  doc.text(`Class: ${student.class}`, 10, 88);
  doc.text(`Fee Purpose: ${transaction.purpose}`, 10, 96);
  
  // Payment details
  doc.text(`Payment Method: ${transaction.paymentMode}`, 120, 80);
  
  // Add a line below details
  doc.line(10, 105, 200, 105);
  
  // Fee details
  doc.setFontSize(14);
  doc.text("Fee Details", 90, 115);
  
  // Fee table
  const tableColumn = ["Description", "Amount"];
  const tableRows = [
    [transaction.purpose, `₹${transaction.amount}`]
  ];
  
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 120,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255]
    }
  });
  
  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text("Total Amount:", 130, finalY);
  doc.text(`₹${transaction.amount}`, 180, finalY);
  
  // Signature
  doc.text("Authorized Signature", 150, finalY + 30);
  
  // Footer
  doc.setFontSize(10);
  doc.text("This is a computer generated receipt and does not require physical signature.", 10, 280);
  
  // Save the PDF
  doc.save(`fee_receipt_${student.name.replace(" ", "_")}_${transaction.id}.pdf`);
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
  const { title, chartImages, summary, instituteName, logo } = options;
  const doc = new jsPDF();
  
  // Add logo if provided
  if (logo) {
    doc.addImage(logo, 'PNG', 10, 10, 20, 20);
  }
  
  // Title
  doc.setFontSize(20);
  doc.text(title, logo ? 40 : 10, 20);
  
  // Institute name
  doc.setFontSize(12);
  doc.text(instituteName, logo ? 40 : 10, 30);
  
  // Date
  doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy')}`, 130, 30);
  
  // Add a line below header
  doc.setLineWidth(0.5);
  doc.line(10, 35, 200, 35);
  
  // Summary section
  doc.setFontSize(14);
  doc.text("Report Summary", 10, 45);
  
  let yPos = 55;
  summary.forEach(item => {
    doc.setFontSize(12);
    doc.text(`${item.label}:`, 20, yPos);
    doc.text(item.value, 100, yPos);
    yPos += 8;
  });
  
  yPos += 10;
  
  // Charts section
  if (chartImages.length > 0) {
    doc.setFontSize(14);
    doc.text("Visual Analytics", 10, yPos);
    yPos += 10;
    
    chartImages.forEach((chartImage, index) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.addImage(chartImage, 'PNG', 20, yPos, 170, 80);
      yPos += 90;
    });
  }
  
  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};


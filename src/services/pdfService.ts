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
export const exportStudentsToPDF = (students: Student[], title: string) => {
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.text(title, 20, 20);

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
    startY: 30,
  });

  doc.save("student_records.pdf");
};

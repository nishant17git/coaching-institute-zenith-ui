
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, FeeTransaction, AttendanceRecord } from '@/types';

// Common header styling
const addHeader = (
  doc: jsPDF, 
  title: string,
  logo?: string,
  subtitle?: string
) => {
  // Add logo if available
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', 15, 10, 25, 25);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
  // Add title and subtitle
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Infinity Classes', logo ? 45 : 15, 20);
  
  doc.setFontSize(16);
  doc.text(title, logo ? 45 : 15, 30);
  
  if (subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(subtitle, logo ? 45 : 15, 38);
  }
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 45);
  
  doc.setLineWidth(0.5);
  doc.line(15, 48, 195, 48);
  
  // Return the Y position after the header
  return 55;
};

// Export student list to PDF
export const exportStudentsToPDF = (
  students: Student[],
  title = 'Student List',
  subtitle?: string,
  logo?: string
): void => {
  const doc = new jsPDF();
  const startY = addHeader(doc, title, logo, subtitle);
  
  const studentData = students.map(student => [
    student.name,
    student.class,
    student.fatherName,
    student.motherName,
    `${student.attendancePercentage}%`,
    `₹${student.paidFees.toLocaleString()} / ₹${student.totalFees.toLocaleString()}`
  ]);
  
  autoTable(doc, {
    head: [['Name', 'Class', 'Father\'s Name', 'Mother\'s Name', 'Attendance', 'Fees (Paid/Total)']],
    body: studentData,
    startY,
    theme: 'grid',
    headStyles: { fillColor: [10, 132, 255] },
    styles: {
      fontSize: 10
    }
  });
  
  doc.save('students-list.pdf');
};

// Export fee transactions to PDF
export const exportFeesToPDF = (
  transactions: FeeTransaction[],
  students: Student[],
  title = 'Fee Transactions',
  subtitle?: string,
  logo?: string
): void => {
  const doc = new jsPDF();
  const startY = addHeader(doc, title, logo, subtitle);
  
  const transactionData = transactions.map(transaction => {
    const student = students.find(s => s.id === transaction.studentId);
    return [
      student?.name || 'Unknown Student',
      student?.class || 'N/A',
      new Date(transaction.date).toLocaleDateString(),
      transaction.purpose,
      `₹${transaction.amount.toLocaleString()}`,
      transaction.paymentMode || 'Pending'
    ];
  });
  
  autoTable(doc, {
    head: [['Student Name', 'Class', 'Date', 'Purpose', 'Amount', 'Payment Mode']],
    body: transactionData,
    startY,
    theme: 'grid',
    headStyles: { fillColor: [48, 209, 88] },
    styles: {
      fontSize: 10
    }
  });
  
  doc.save('fee-transactions.pdf');
};

// Export a single fee invoice
export const exportFeeInvoicePDF = (
  transaction: FeeTransaction,
  student: Student,
  instituteName = 'Infinity Classes',
  instituteAddress = '123 Education Lane, Knowledge City',
  instituteContact = '+91 9876543210',
  logo?: string
): void => {
  const doc = new jsPDF();
  
  // Add logo if available
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', 15, 15, 25, 25);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
  // Add institute details
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(instituteName, logo ? 45 : 15, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(instituteAddress, logo ? 45 : 15, 27);
  doc.text(`Contact: ${instituteContact}`, logo ? 45 : 15, 33);
  
  // Add invoice header
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('RECEIPT', 15, 50);
  
  doc.setLineWidth(0.5);
  doc.line(15, 52, 195, 52);
  
  // Add invoice and student details
  doc.setFontSize(12);
  const receiptNo = transaction.id.substring(0, 8).toUpperCase();
  
  doc.text(`Receipt No: ${receiptNo}`, 15, 62);
  doc.text(`Date: ${new Date(transaction.date).toLocaleDateString()}`, 130, 62);
  
  doc.text(`Student Name: ${student.name}`, 15, 72);
  doc.text(`Class: ${student.class}`, 130, 72);
  
  doc.text(`Father's Name: ${student.fatherName}`, 15, 82);
  
  // Add payment details
  doc.setLineWidth(0.5);
  doc.line(15, 92, 195, 92);
  
  autoTable(doc, {
    head: [['Description', 'Amount']],
    body: [
      [transaction.purpose, `₹${transaction.amount.toLocaleString()}`],
      ['Total', `₹${transaction.amount.toLocaleString()}`]
    ],
    startY: 100,
    theme: 'grid',
    headStyles: { fillColor: [10, 132, 255] }
  });
  
  // Add payment method
  const tableHeight = 30; // Approximate height of the table
  doc.text(`Payment Method: ${transaction.paymentMode || 'Pending'}`, 15, 105 + tableHeight);
  
  // Add signature
  doc.text('Authorized Signature', 130, 145);
  doc.setLineWidth(0.2);
  doc.line(130, 160, 190, 160);
  
  // Add footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('This is a computer-generated receipt and does not require a physical signature.', 15, 180);
  
  doc.save(`fee-receipt-${student.name.replace(/\s+/g, '-')}.pdf`);
};

// Export student attendance to PDF
export const exportAttendanceToPDF = (
  records: AttendanceRecord[],
  student: Student,
  title = 'Attendance Report',
  subtitle?: string,
  logo?: string
): void => {
  const doc = new jsPDF();
  const startY = addHeader(doc, title, logo, subtitle);
  
  // Add student details
  doc.setFontSize(12);
  doc.text(`Student: ${student.name}`, 15, startY);
  doc.text(`Class: ${student.class}`, 15, startY + 7);
  doc.text(`Attendance: ${student.attendancePercentage}%`, 15, startY + 14);
  
  // Prepare attendance data
  const sortedRecords = [...records].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  const attendanceData = sortedRecords.map(record => [
    new Date(record.date).toLocaleDateString(),
    record.status,
    record.status === 'Present' ? 'Yes' : record.status === 'Absent' ? 'No' : '-'
  ]);
  
  autoTable(doc, {
    head: [['Date', 'Status', 'Present']],
    body: attendanceData,
    startY: startY + 20,
    theme: 'grid',
    headStyles: { fillColor: [255, 159, 10] }
  });
  
  doc.save(`attendance-report-${student.name.replace(/\s+/g, '-')}.pdf`);
};

// Export reports to PDF
export const exportReportToPDF = (
  title: string,
  chartDataUrls: string[], // Base64 URLs of chart images
  summary: { label: string, value: string }[],
  subtitle?: string,
  logo?: string
): void => {
  const doc = new jsPDF();
  const startY = addHeader(doc, title, logo, subtitle);
  
  // Add summary data
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text('Summary', 15, startY);
  
  let currentY = startY + 10;
  
  summary.forEach((item, index) => {
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`${item.label}: ${item.value}`, 15, currentY);
    currentY += 7;
  });
  
  currentY += 10;
  
  // Add charts
  if (chartDataUrls.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text('Charts', 15, currentY);
    currentY += 10;
    
    chartDataUrls.forEach((chartUrl, index) => {
      try {
        // Add page if needed
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
        
        // Add the chart
        doc.addImage(chartUrl, 'PNG', 15, currentY, 180, 80);
        currentY += 90;
      } catch (error) {
        console.error(`Error adding chart ${index} to PDF:`, error);
      }
    });
  }
  
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

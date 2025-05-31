import { jsPDF } from 'jspdf';
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

// Export the new questions PDF function
export { exportQuestionsToPDF } from './questionsPdfService';

// Add the new function to export test results to PDF
export interface TestPDFOptions {
  test: any;
  student: any;
  title?: string;
  subtitle?: string;
  logo?: string;
  chartImage?: string;
  allTests?: any[]; // New property for exporting multiple tests
}

export const exportTestToPDF = (options: TestPDFOptions) => {
  const { test, student, title = "Test Results", subtitle, logo, chartImage, allTests } = options;
  const doc = new jsPDF();
  
  // Add logo if provided
  if (logo) {
    doc.addImage(logo, 'PNG', 10, 10, 20, 20);
  }
  
  // Title
  doc.setFontSize(20);
  doc.text(title, logo ? 40 : 10, 20);
  
  // Subtitle
  if (subtitle) {
    doc.setFontSize(12);
    doc.text(subtitle, logo ? 40 : 10, 30);
  }
  
  // Date
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy')}`, 130, 20);
  
  // Add a line below header
  doc.setLineWidth(0.5);
  doc.line(10, 35, 200, 35);
  
  // Student details
  doc.setFontSize(14);
  doc.text("Student Details", 10, 45);
  
  doc.setFontSize(12);
  doc.text(`Name: ${student.full_name || "Unknown"}`, 10, 55);
  doc.text(`Class: ${student.class || "N/A"}`, 10, 63);
  
  let yPosition = 75;
  
  // Handle single test or multiple tests
  if (allTests && allTests.length > 0) {
    // Test summary
    doc.setFontSize(14);
    doc.text("Test Summary", 10, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`Total Tests: ${allTests.length}`, 10, yPosition);
    yPosition += 8;
    
    // Calculate average score
    const totalPercent = allTests.reduce((sum, test) => sum + ((test.marks / test.total_marks) * 100), 0);
    const averagePercent = Math.round(totalPercent / allTests.length);
    
    doc.text(`Average Score: ${averagePercent}%`, 10, yPosition);
    yPosition += 15;
    
    // Test records table
    doc.setFontSize(14);
    doc.text("Test Records", 10, yPosition);
    yPosition += 10;
    
    const tableColumn = ["Date", "Subject", "Test Name", "Score", "Grade"];
    const tableRows = allTests.map(test => {
      const percent = Math.round((test.marks / test.total_marks) * 100);
      let grade = "F";
      
      if (percent >= 90) grade = "A";
      else if (percent >= 75) grade = "B";
      else if (percent >= 60) grade = "C";
      else if (percent >= 40) grade = "D";
      
      return [
        format(new Date(test.test_date), 'dd/MM/yyyy'),
        test.subject,
        test.test_name,
        `${test.marks}/${test.total_marks} (${percent}%)`,
        grade
      ];
    });
    
    autoTable(doc, {
      head: [tableColumn],
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
    
    // Subject performance summary if there are more than 1 test
    if (allTests.length > 1) {
      // Get unique subjects
      const subjects = Array.from(new Set(allTests.map(test => test.subject)));
      
      // Add a new page if needed
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      if (finalY > 250) {
        doc.addPage();
        yPosition = 20;
      } else {
        yPosition = finalY;
      }
      
      doc.setFontSize(14);
      doc.text("Subject Performance", 10, yPosition);
      yPosition += 10;
      
      const subjectData = subjects.map(subject => {
        const subjectTests = allTests.filter(test => test.subject === subject);
        const totalPercent = subjectTests.reduce((sum, test) => sum + ((test.marks / test.total_marks) * 100), 0);
        const averagePercent = Math.round(totalPercent / subjectTests.length);
        
        return [
          subject,
          `${subjectTests.length}`,
          `${averagePercent}%`
        ];
      });
      
      autoTable(doc, {
        head: [["Subject", "Tests", "Average Score"]],
        body: subjectData,
        startY: yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: [255, 255, 255]
        }
      });
    }
    
  } else {
    // Single test details
    doc.setFontSize(14);
    doc.text("Test Details", 10, yPosition);
    
    doc.setFontSize(12);
    doc.text(`Test Name: ${test.test_name}`, 10, yPosition + 10);
    doc.text(`Subject: ${test.subject}`, 10, yPosition + 18);
    doc.text(`Date: ${format(new Date(test.test_date), 'dd/MM/yyyy')}`, 10, yPosition + 26);
    
    // Test score
    doc.setFontSize(14);
    doc.text("Score", 10, yPosition + 40);
    
    const percentage = Math.round((test.marks / test.total_marks) * 100);
    doc.setFontSize(12);
    doc.text(`Marks Obtained: ${test.marks}/${test.total_marks}`, 10, yPosition + 50);
    doc.text(`Percentage: ${percentage}%`, 10, yPosition + 58);
    
    // Grade calculation
    let grade = "F";
    let gradeColor = "#EF4444";
    
    if (percentage >= 90) {
      grade = "A";
      gradeColor = "#22c55e";
    } else if (percentage >= 75) {
      grade = "B";
      gradeColor = "#0EA5E9";
    } else if (percentage >= 60) {
      grade = "C";
      gradeColor = "#EAB308";
    } else if (percentage >= 40) {
      grade = "D";
      gradeColor = "#F97316";
    }
    
    doc.text(`Grade: ${grade}`, 10, yPosition + 66);
    
    // Add chart if provided
    if (chartImage) {
      doc.addImage(chartImage, 'PNG', 50, yPosition + 75, 100, 60);
    }
    
    // Comments section
    doc.setFontSize(14);
    doc.text("Teacher's Comments", 10, yPosition + 140);
    
    doc.setFontSize(12);
    doc.text("This is an automatically generated test report.", 10, yPosition + 150);
    
    // Signature line
    doc.line(10, 250, 70, 250);
    doc.text("Teacher's Signature", 15, 258);
    
    doc.line(140, 250, 190, 250);
    doc.text("Principal's Signature", 145, 258);
  }
  
  // Footer
  doc.setFontSize(10);
  doc.text("This is a computer generated report and does not require physical signature.", 10, 280);
  
  // Save the PDF
  const studentName = student.full_name ? student.full_name.replace(/\s+/g, "_") : "student";
  const fileName = allTests && allTests.length > 1 
    ? `test_history_${studentName}.pdf` 
    : `test_report_${studentName}_${test.subject}.pdf`;
    
  doc.save(fileName);
};

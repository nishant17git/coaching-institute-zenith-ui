
import { Student, FeeTransaction, AttendanceRecord, Class } from "@/types";

export const classes: Class[] = [
  { id: "c1", name: "Class 9", totalStudents: 25 },
  { id: "c2", name: "Class 10", totalStudents: 32 },
  { id: "c3", name: "Class 11 - Science", totalStudents: 18 },
  { id: "c4", name: "Class 12 - Science", totalStudents: 22 },
  { id: "c5", name: "Class 11 - Commerce", totalStudents: 12 },
  { id: "c6", name: "Class 12 - Commerce", totalStudents: 15 },
];

export const students: Student[] = [
  {
    id: "s1",
    name: "Rahul Sharma",
    class: "Class 10",
    fatherName: "Rajesh Sharma",
    motherName: "Sunita Sharma",
    phoneNumber: "+91 9876543210",
    whatsappNumber: "+91 9876543210",
    address: "123, Sector 15, Gandhinagar",
    feeStatus: "Paid",
    totalFees: 24000,
    paidFees: 24000,
    attendancePercentage: 95,
    joinDate: "2023-04-12",
  },
  {
    id: "s2",
    name: "Priya Patel",
    class: "Class 11 - Science",
    fatherName: "Kiran Patel",
    motherName: "Meena Patel",
    phoneNumber: "+91 8765432109",
    whatsappNumber: "+91 8765432109",
    address: "45, New Colony, Ahmedabad",
    feeStatus: "Partial",
    totalFees: 30000,
    paidFees: 20000,
    attendancePercentage: 88,
    joinDate: "2023-04-05",
  },
  {
    id: "s3",
    name: "Amit Singh",
    class: "Class 12 - Science",
    fatherName: "Vikram Singh",
    motherName: "Radha Singh",
    phoneNumber: "+91 7654321098",
    whatsappNumber: "+91 7654321098",
    address: "78, Lake View, Vadodara",
    feeStatus: "Pending",
    totalFees: 32000,
    paidFees: 8000,
    attendancePercentage: 72,
    joinDate: "2023-03-22",
  },
  {
    id: "s4",
    name: "Neha Verma",
    class: "Class 9",
    fatherName: "Deepak Verma",
    motherName: "Seema Verma",
    phoneNumber: "+91 6543210987",
    whatsappNumber: "+91 6543210987",
    address: "34, Green Park, Surat",
    feeStatus: "Paid",
    totalFees: 22000,
    paidFees: 22000,
    attendancePercentage: 98,
    joinDate: "2023-04-15",
  },
  {
    id: "s5",
    name: "Rohit Agarwal",
    class: "Class 12 - Commerce",
    fatherName: "Suresh Agarwal",
    motherName: "Kavita Agarwal",
    phoneNumber: "+91 5432109876",
    whatsappNumber: "+91 5432109876",
    address: "56, Sunshine Apartments, Rajkot",
    feeStatus: "Partial",
    totalFees: 28000,
    paidFees: 14000,
    attendancePercentage: 85,
    joinDate: "2023-03-28",
  },
  {
    id: "s6",
    name: "Ananya Mehta",
    class: "Class 11 - Commerce",
    fatherName: "Prakash Mehta",
    motherName: "Rekha Mehta",
    phoneNumber: "+91 4321098765",
    whatsappNumber: "+91 4321098765",
    address: "89, Silver Heights, Gandhinagar",
    feeStatus: "Pending",
    totalFees: 26000,
    paidFees: 5000,
    attendancePercentage: 80,
    joinDate: "2023-04-02",
  },
];

export const feeTransactions: FeeTransaction[] = [
  {
    id: "f1",
    studentId: "s1",
    amount: 12000,
    date: "2023-04-15",
    paymentMode: "Online",
    receiptNumber: "REC001",
    purpose: "First Installment",
  },
  {
    id: "f2",
    studentId: "s1",
    amount: 12000,
    date: "2023-07-10",
    paymentMode: "Online",
    receiptNumber: "REC002",
    purpose: "Second Installment",
  },
  {
    id: "f3",
    studentId: "s2",
    amount: 10000,
    date: "2023-04-08",
    paymentMode: "Cash",
    receiptNumber: "REC003",
    purpose: "First Installment",
  },
  {
    id: "f4",
    studentId: "s2",
    amount: 10000,
    date: "2023-08-05",
    paymentMode: "Cash",
    receiptNumber: "REC004",
    purpose: "Second Installment",
  },
  {
    id: "f5",
    studentId: "s3",
    amount: 8000,
    date: "2023-03-25",
    paymentMode: "Cheque",
    receiptNumber: "REC005",
    purpose: "Registration Fee",
  },
  {
    id: "f6",
    studentId: "s4",
    amount: 11000,
    date: "2023-04-18",
    paymentMode: "Online",
    receiptNumber: "REC006",
    purpose: "First Installment",
  },
  {
    id: "f7",
    studentId: "s4",
    amount: 11000,
    date: "2023-09-12",
    paymentMode: "Cash",
    receiptNumber: "REC007",
    purpose: "Second Installment",
  },
  {
    id: "f8",
    studentId: "s5",
    amount: 14000,
    date: "2023-03-30",
    paymentMode: "Online",
    receiptNumber: "REC008",
    purpose: "First Installment",
  },
  {
    id: "f9",
    studentId: "s6",
    amount: 5000,
    date: "2023-04-05",
    paymentMode: "Cash",
    receiptNumber: "REC009",
    purpose: "Registration Fee",
  },
];

const currentDate = new Date();

// Generate attendance records for the current month
export const attendanceRecords: AttendanceRecord[] = [];

// For each student
students.forEach((student) => {
  // Generate records for last 30 days
  for (let i = 0; i < 30; i++) {
    const recordDate = new Date();
    recordDate.setDate(currentDate.getDate() - i);
    
    // Skip weekends
    const dayOfWeek = recordDate.getDay();
    if (dayOfWeek === 0) { // Sunday
      attendanceRecords.push({
        id: `a${student.id}-${recordDate.toISOString().split('T')[0]}`,
        studentId: student.id,
        date: recordDate.toISOString().split('T')[0],
        status: "Holiday",
      });
      continue;
    }
    
    // Determine status based on student's attendance percentage
    let status: "Present" | "Absent" | "Leave" | "Holiday";
    const rand = Math.random() * 100;
    
    if (rand < student.attendancePercentage) {
      status = "Present";
    } else if (rand < student.attendancePercentage + 5) {
      status = "Leave";
    } else {
      status = "Absent";
    }
    
    attendanceRecords.push({
      id: `a${student.id}-${recordDate.toISOString().split('T')[0]}`,
      studentId: student.id,
      date: recordDate.toISOString().split('T')[0],
      status,
    });
  }
});

// Monthly fee collection data for charts
export const monthlyFeeCollections = [
  { month: "Jan", amount: 45000 },
  { month: "Feb", amount: 52000 },
  { month: "Mar", amount: 48000 },
  { month: "Apr", amount: 61000 },
  { month: "May", amount: 55000 },
  { month: "Jun", amount: 67000 },
  { month: "Jul", amount: 72000 },
  { month: "Aug", amount: 59000 },
  { month: "Sep", amount: 63000 },
  { month: "Oct", amount: 68000 },
  { month: "Nov", amount: 0 },
  { month: "Dec", amount: 0 },
];

// Monthly attendance data for charts
export const monthlyAttendance = [
  { month: "Jan", attendance: 92 },
  { month: "Feb", attendance: 88 },
  { month: "Mar", attendance: 91 },
  { month: "Apr", attendance: 87 },
  { month: "May", attendance: 89 },
  { month: "Jun", attendance: 93 },
  { month: "Jul", attendance: 90 },
  { month: "Aug", attendance: 85 },
  { month: "Sep", attendance: 88 },
  { month: "Oct", attendance: 86 },
  { month: "Nov", attendance: 0 },
  { month: "Dec", amount: 0 },
];

// Class distribution data for pie chart
export const classDistribution = classes.map((cls) => ({
  name: cls.name,
  value: cls.totalStudents,
}));


export interface Student {
  id: string;
  name: string;
  class: string;
  fatherName: string;
  motherName: string;
  phone: string;
  whatsapp: string;
  address: string;
  feeStatus: "Paid" | "Pending" | "Partial";
  totalFees: number;
  paidFees: number;
  attendancePercentage: number;
  joinDate: string;
}

export interface FeeTransaction {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  paymentMode: "Cash" | "Online" | "Cheque";
  receiptNumber: string;
  purpose: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: "Present" | "Absent" | "Leave" | "Holiday";
}

export interface Class {
  id: string;
  name: string;
  totalStudents: number;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  fatherName: string;
  motherName: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  feeStatus: "Paid" | "Pending" | "Partial";
  totalFees: number;
  paidFees: number;
  attendancePercentage: number;
  joinDate: string;
  gender?: "Male" | "Female" | "Other";
  aadhaarNumber?: string;
  dateOfBirth?: string;
  rollNumber?: number;
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

export interface StudentRecord {
  id: string;
  full_name: string;
  class: number;
  roll_number: number;
  date_of_birth: string;
  address: string;
  guardian_name: string;
  contact_number: string;
  whatsapp_number?: string;
  fee_status: "Paid" | "Pending" | "Partial";
  total_fees: number;
  paid_fees: number;
  attendance_percentage: number;
  join_date: string;
  created_at: string;
  updated_at: string;
  gender?: string;
  aadhaar_number?: string;
}

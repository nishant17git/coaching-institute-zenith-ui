
// Database types that match the new Supabase schema
export interface DatabaseStudent {
  id: string;
  full_name: string;
  class: number;
  roll_number: number;
  father_name: string;
  mother_name?: string;
  date_of_birth: string;
  gender?: 'Male' | 'Female' | 'Other';
  contact_number: string;
  whatsapp_number?: string;
  address?: string;
  aadhaar_number?: string;
  email?: string;
  blood_group?: string;
  admission_date: string;
  status: 'Active' | 'Inactive' | 'Transferred';
  created_at: string;
  updated_at: string;
}

export interface DatabaseFeeTransaction {
  id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  payment_mode: 'Cash' | 'Online' | 'Cheque' | 'UPI' | 'Bank Transfer';
  receipt_number: string;
  purpose: string;
  academic_year: string;
  term?: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual' | 'Admission' | 'Exam' | 'Other';
  due_date?: string;
  late_fee: number;
  discount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Holiday';
  check_in_time?: string;
  check_out_time?: string;
  subject?: string;
  period?: number;
  remarks?: string;
  marked_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTest {
  id: string;
  test_name: string;
  subject: string;
  class: number;
  test_date: string;
  total_marks: number;
  duration_minutes?: number;
  test_type?: 'Unit Test' | 'Monthly Test' | 'Term Exam' | 'Final Exam' | 'Practice Test';
  syllabus_covered?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTestResult {
  id: string;
  test_id: string;
  student_id: string;
  marks_obtained: number;
  total_marks: number;
  percentage?: number;
  grade?: string;
  rank?: number;
  remarks?: string;
  absent: boolean;
  created_at: string;
  updated_at: string;
}

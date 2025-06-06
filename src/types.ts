
export interface Student {
  id: string;
  name: string;
  class: string;
  father: string;  // Required for StudentCard component
  mother: string;  // Required for StudentCard component
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
  phones?: StudentPhone[]; // For new StudentCard component
}

export interface StudentPhone {
  id: string;
  phone: string;
  is_whatsapp: boolean;
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

// Updated to be consistent with Supabase schema
export interface StudentRecord {
  id: string;
  full_name: string;
  class: number; // Changed to number for consistency
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
  aadhaar_number?: string | number; // Updated to accept both string and number types
}

// New interfaces for test data
export interface TestRecord {
  id: string;
  studentId: string;
  name: string;
  subject: string;
  date: string;
  score: number;
  maxScore: number;
  rank?: number;
  percentile?: number;
  bestSubject?: {
    name: string;
    score: number;
  };
  worstSubject?: {
    name: string;
    score: number;
  };
}

// New interface for Test API endpoints
export interface TestRecordDb {
  id: string;
  student_id: string;
  subject: string;
  test_date: string;
  test_name: string;
  marks: number;
  total_marks: number;
  test_type?: "MCQs Test (Standard)" | "MCQs Test (Normal)" | "Chapter-wise Test";
}

// New interface for subject statistics
export interface SubjectStat {
  name: string;
  score: number;
  fill: string;
}

// New interface for test history statistics
export interface HistoryStats {
  totalTests: number;
  averageScore: number;
  subjects: string[];
  gradeDistribution: {
    name: string;
    count: number;
    color: string;
  }[];
  progressData: {
    date: string;
    score: number;
    subject: string;
    test: string;
  }[];
  subjectPerformance: SubjectStat[];
  bestSubject: SubjectStat | null;
  latestTest: TestRecordDb | null;
}

// Type for chart data points
export interface ChartDataPoint {
  subject: string;
  test: string;
  date: string;
  score: number;
}

// StudentCard props interface
export interface StudentCardProps {
  student: Student;
  index: number;
  onCallClick: (name: string, phone: string) => void;
  isFavorite: boolean;
  onEdit?: (student: any) => void;
  onDelete?: (studentId: any) => Promise<void>;
}

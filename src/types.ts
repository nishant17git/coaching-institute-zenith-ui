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
  notes?: string;
  months?: string[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: "Present" | "Absent" | "Leave" | "Holiday";
  studentName?: string; // Optional - for PDF exports
  studentClass?: string; // Optional - for PDF exports
}

export interface Class {
  id: string;
  name: string;
  totalStudents: number;
}

// Updated to match the actual Supabase schema
export interface StudentRecord {
  id: string;
  full_name: string;
  class: number;
  roll_number: number;
  date_of_birth: string;
  address: string | null;
  father_name: string;
  mother_name: string | null;
  guardian_name: string | null;
  contact_number: string;
  whatsapp_number: string | null;
  email: string | null;
  fee_status: string | null;
  total_fees: number | null;
  paid_fees: number | null;
  attendance_percentage: number | null;
  admission_date: string | null; // Changed from join_date to admission_date
  created_at: string | null;
  updated_at: string | null;
  gender: string | null;
  aadhaar_number: string | null;
  blood_group: string | null;
  status: string | null;
}

// New interfaces for test data - using actual Supabase schema
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

// Interface matching the actual test_results table in Supabase
export interface TestRecordDb {
  id: string;
  student_id: string;
  test_id: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number | null;
  grade: string | null;
  rank: number | null;
  absent: boolean | null;
  remarks: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Interface for the tests table
export interface TestDb {
  id: string;
  test_name: string;
  subject: string;
  class: number;
  test_date: string;
  total_marks: number;
  test_type: string | null;
  duration_minutes: number | null;
  instructions: string | null;
  syllabus_covered: string | null;
  created_at: string | null;
  updated_at: string | null;
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

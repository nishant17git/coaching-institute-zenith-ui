
import { supabase } from "@/integrations/supabase/client";
import { DatabaseStudent, DatabaseFeeTransaction, DatabaseAttendanceRecord } from "@/types/database";
import { Student, FeeTransaction, AttendanceRecord } from "@/types";

export const newStudentService = {
  // Student CRUD operations
  async getStudents(): Promise<DatabaseStudent[]> {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("class", { ascending: true })
      .order("roll_number", { ascending: true });

    if (error) {
      console.error("Error fetching students:", error);
      throw error;
    }

    return (data || []).map(student => ({
      ...student,
      gender: student.gender as "Male" | "Female" | "Other" | null,
      status: student.status as "Active" | "Inactive" | "Transferred"
    }));
  },

  async getStudentById(id: string): Promise<DatabaseStudent | null> {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching student with ID ${id}:`, error);
      if (error.code === 'PGRST116') {
        return null; // Student not found
      }
      throw error;
    }

    return data ? {
      ...data,
      gender: data.gender as "Male" | "Female" | "Other" | null,
      status: data.status as "Active" | "Inactive" | "Transferred"
    } : null;
  },

  async createStudent(student: Omit<DatabaseStudent, "id" | "created_at" | "updated_at">): Promise<DatabaseStudent> {
    const { data, error } = await supabase
      .from("students")
      .insert([student])
      .select()
      .single();

    if (error) {
      console.error("Error creating student:", error);
      throw error;
    }

    return {
      ...data,
      gender: data.gender as "Male" | "Female" | "Other" | null,
      status: data.status as "Active" | "Inactive" | "Transferred"
    };
  },

  async updateStudent(id: string, student: Partial<Omit<DatabaseStudent, "id" | "created_at" | "updated_at">>): Promise<DatabaseStudent> {
    const { data, error } = await supabase
      .from("students")
      .update(student)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating student with ID ${id}:`, error);
      throw error;
    }

    return {
      ...data,
      gender: data.gender as "Male" | "Female" | "Other" | null,
      status: data.status as "Active" | "Inactive" | "Transferred"
    };
  },

  async deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting student with ID ${id}:`, error);
      throw error;
    }
  },

  async getStudentsByClass(classNum: number): Promise<DatabaseStudent[]> {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("class", classNum)
      .order("roll_number", { ascending: true });

    if (error) {
      console.error(`Error fetching students for class ${classNum}:`, error);
      throw error;
    }

    return (data || []).map(student => ({
      ...student,
      gender: student.gender as "Male" | "Female" | "Other" | null,
      status: student.status as "Active" | "Inactive" | "Transferred"
    }));
  },
  
  // Fee Transaction Methods
  async getStudentFees(studentId: string): Promise<DatabaseFeeTransaction[]> {
    const { data, error } = await supabase
      .from("fee_transactions")
      .select("*")
      .eq("student_id", studentId)
      .order("payment_date", { ascending: false });
      
    if (error) {
      console.error(`Error fetching fees for student ${studentId}:`, error);
      throw error;
    }
    
    return (data || []).map(transaction => ({
      ...transaction,
      payment_mode: transaction.payment_mode as "Cash" | "Online" | "Cheque" | "UPI" | "Bank Transfer",
      term: transaction.term as "Monthly" | "Quarterly" | "Half-Yearly" | "Annual" | "Admission" | "Exam" | "Other" | null
    }));
  },
  
  async addFeeTransaction(transaction: Omit<DatabaseFeeTransaction, "id" | "created_at" | "updated_at">): Promise<DatabaseFeeTransaction> {
    const { data, error } = await supabase
      .from("fee_transactions")
      .insert([transaction])
      .select()
      .single();
      
    if (error) {
      console.error("Error adding fee transaction:", error);
      throw error;
    }
    
    return {
      ...data,
      payment_mode: data.payment_mode as "Cash" | "Online" | "Cheque" | "UPI" | "Bank Transfer",
      term: data.term as "Monthly" | "Quarterly" | "Half-Yearly" | "Annual" | "Admission" | "Exam" | "Other" | null
    };
  },
  
  // Attendance Methods
  async getStudentAttendance(studentId: string): Promise<DatabaseAttendanceRecord[]> {
    const { data, error } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("student_id", studentId)
      .order("date", { ascending: false });
      
    if (error) {
      console.error(`Error fetching attendance for student ${studentId}:`, error);
      throw error;
    }
    
    return (data || []).map(record => ({
      ...record,
      status: record.status as "Present" | "Absent" | "Late" | "Half Day" | "Holiday"
    }));
  },
  
  async markAttendance(records: Omit<DatabaseAttendanceRecord, "id" | "created_at" | "updated_at">[]): Promise<void> {
    const { error } = await supabase
      .from("attendance_records")
      .upsert(records, {
        onConflict: 'student_id,date',
        ignoreDuplicates: false
      });
      
    if (error) {
      console.error("Error recording attendance:", error);
      throw error;
    }
  },

  // Utility methods to convert between database and frontend types
  mapToFrontendStudent(dbStudent: DatabaseStudent): Student {
    return {
      id: dbStudent.id,
      name: dbStudent.full_name,
      class: `Class ${dbStudent.class}`,
      father: dbStudent.father_name,
      mother: dbStudent.mother_name || "",
      fatherName: dbStudent.father_name,
      motherName: dbStudent.mother_name || "",
      phoneNumber: dbStudent.contact_number,
      whatsappNumber: dbStudent.whatsapp_number || dbStudent.contact_number,
      address: dbStudent.address || "",
      feeStatus: "Pending" as "Paid" | "Pending" | "Partial", // Will be calculated from transactions
      totalFees: 0, // Will be calculated from fee structure
      paidFees: 0, // Will be calculated from transactions
      attendancePercentage: 0, // Will be calculated from attendance records
      joinDate: dbStudent.admission_date || dbStudent.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      gender: dbStudent.gender || undefined,
      aadhaarNumber: dbStudent.aadhaar_number,
      dateOfBirth: dbStudent.date_of_birth,
      rollNumber: dbStudent.roll_number
    };
  },

  mapToDatabaseStudent(student: Omit<Student, "id">, rollNumber?: number): Omit<DatabaseStudent, "id" | "created_at" | "updated_at"> {
    return {
      full_name: student.name,
      class: parseInt(student.class.replace("Class ", "")),
      roll_number: rollNumber || student.rollNumber || 1,
      father_name: student.fatherName,
      mother_name: student.motherName || undefined,
      date_of_birth: student.dateOfBirth || new Date().toISOString().split('T')[0],
      gender: student.gender || null,
      contact_number: student.phoneNumber,
      whatsapp_number: student.whatsappNumber || undefined,
      address: student.address || undefined,
      aadhaar_number: student.aadhaarNumber || undefined,
      email: undefined,
      blood_group: undefined,
      admission_date: student.joinDate || new Date().toISOString().split('T')[0],
      status: 'Active'
    };
  }
};

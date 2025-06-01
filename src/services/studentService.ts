
import { supabase } from "@/integrations/supabase/client";
import { StudentRecord, Student, FeeTransaction, AttendanceRecord } from "@/types";

// Create a type assertion function to help TypeScript understand our tables
function createSupabaseServiceClient() {
  return supabase as any;
}

// Create an instance of the client with the type assertion
const supabaseClient = createSupabaseServiceClient();

export const studentService = {
  async getStudents(): Promise<StudentRecord[]> {
    const { data, error } = await supabaseClient
      .from("students")
      .select("*")
      .order("class", { ascending: true })
      .order("roll_number", { ascending: true });

    if (error) {
      console.error("Error fetching students:", error);
      throw error;
    }

    return data || [];
  },

  async getStudentById(id: string): Promise<StudentRecord> {
    const { data, error } = await supabaseClient
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching student with ID ${id}:`, error);
      throw error;
    }

    return data;
  },

  async createStudent(student: Omit<StudentRecord, "id" | "created_at" | "updated_at">): Promise<StudentRecord> {
    const { data, error } = await supabaseClient
      .from("students")
      .insert([student])
      .select()
      .single();

    if (error) {
      console.error("Error creating student:", error);
      throw error;
    }

    return data;
  },

  async updateStudent(id: string, student: Partial<Omit<StudentRecord, "id" | "created_at" | "updated_at">>): Promise<StudentRecord> {
    const { data, error } = await supabaseClient
      .from("students")
      .update(student)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating student with ID ${id}:`, error);
      throw error;
    }

    return data;
  },

  async deleteStudent(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from("students")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting student with ID ${id}:`, error);
      throw error;
    }
  },

  async getStudentsByClass(classNum: number): Promise<StudentRecord[]> {
    const { data, error } = await supabaseClient
      .from("students")
      .select("*")
      .eq("class", classNum)
      .order("roll_number", { ascending: true });

    if (error) {
      console.error(`Error fetching students for class ${classNum}:`, error);
      throw error;
    }

    return data || [];
  },
  
  // Fee Transaction Methods
  async getStudentFees(studentId: string): Promise<FeeTransaction[]> {
    const { data, error } = await supabaseClient
      .from("fee_transactions")
      .select("*")
      .eq("student_id", studentId)
      .order("date", { ascending: false });
      
    if (error) {
      console.error(`Error fetching fees for student ${studentId}:`, error);
      throw error;
    }
    
    return data.map(fee => ({
      id: fee.id,
      studentId: fee.student_id,
      amount: fee.amount,
      date: fee.date,
      paymentMode: fee.payment_mode,
      receiptNumber: fee.receipt_number,
      purpose: fee.purpose
    })) || [];
  },
  
  async addFeeTransaction(transaction: Omit<FeeTransaction, "id">): Promise<FeeTransaction> {
    // Convert from camelCase to snake_case for the database
    const dbTransaction = {
      student_id: transaction.studentId,
      amount: transaction.amount,
      date: transaction.date,
      payment_mode: transaction.paymentMode,
      receipt_number: transaction.receiptNumber,
      purpose: transaction.purpose
    };
    
    const { data, error } = await supabaseClient
      .from("fee_transactions")
      .insert([dbTransaction])
      .select()
      .single();
      
    if (error) {
      console.error("Error adding fee transaction:", error);
      throw error;
    }
    
    // After adding a transaction, update the student's fee status
    await this.updateStudentFeeStatus(transaction.studentId);
    
    return {
      id: data.id,
      studentId: data.student_id,
      amount: data.amount,
      date: data.date,
      paymentMode: data.payment_mode,
      receiptNumber: data.receipt_number,
      purpose: data.purpose
    };
  },
  
  // Update student fee status based on total paid fees
  async updateStudentFeeStatus(studentId: string): Promise<void> {
    // Get student details
    const { data: student } = await supabaseClient
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();
      
    if (!student) return;
      
    // Get all transactions for this student
    const { data: transactions } = await supabaseClient
      .from("fee_transactions")
      .select("amount")
      .eq("student_id", studentId);
      
    const paidFees = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
    const totalFees = student.total_fees;
    
    let feeStatus = "Pending";
    if (paidFees >= totalFees) {
      feeStatus = "Paid";
    } else if (paidFees > 0) {
      feeStatus = "Partial";
    }
    
    // Update the student record
    await supabaseClient
      .from("students")
      .update({ 
        paid_fees: paidFees,
        fee_status: feeStatus
      })
      .eq("id", studentId);
  },
  
  // Attendance Methods
  async getStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
    const { data, error } = await supabaseClient
      .from("attendance_records")
      .select("*")
      .eq("student_id", studentId)
      .order("date", { ascending: false });
      
    if (error) {
      console.error(`Error fetching attendance for student ${studentId}:`, error);
      throw error;
    }
    
    return data.map(record => ({
      id: record.id,
      studentId: record.student_id,
      date: record.date,
      status: record.status
    })) || [];
  },
  
  async markAttendance(records: { studentId: string, date: string, status: string }[]): Promise<void> {
    // Convert from camelCase to snake_case for the database
    const dbRecords = records.map(record => ({
      student_id: record.studentId,
      date: record.date,
      status: record.status
    }));
    
    const { error } = await supabaseClient
      .from("attendance_records")
      .upsert(dbRecords, {
        onConflict: 'student_id,date',
        ignoreDuplicates: false
      });
      
    if (error) {
      console.error("Error recording attendance:", error);
      throw error;
    }
    
    // Update attendance percentage for each student
    for (const record of records) {
      await this.updateAttendancePercentage(record.studentId);
    }
  },
  
  // Update attendance percentage for a student
  async updateAttendancePercentage(studentId: string): Promise<void> {
    // Get all attendance records for this student
    const { data: records } = await supabaseClient
      .from("attendance_records")
      .select("status")
      .eq("student_id", studentId);
      
    if (!records || records.length === 0) return;
    
    const totalDays = records.length;
    const presentDays = records.filter(r => r.status === "Present").length;
    const attendancePercentage = Math.round((presentDays / totalDays) * 100);
    
    // Update the student record
    await supabaseClient
      .from("students")
      .update({ attendance_percentage: attendancePercentage })
      .eq("id", studentId);
  },
  
  // Map Supabase StudentRecord to frontend Student type
  mapToStudentModel(record: StudentRecord): Student {
    // Split guardian_name into father and mother
    const guardianParts = record.guardian_name.split(' ');
    const father = guardianParts.length > 0 ? guardianParts[0] : "";
    const mother = guardianParts.length > 1 ? guardianParts.slice(1).join(' ') : "";
    
    return {
      id: record.id,
      name: record.full_name,
      class: `Class ${record.class}`,
      father: father, // Add required father field
      mother: mother, // Add required mother field
      fatherName: father,
      motherName: mother,
      phoneNumber: record.contact_number,
      whatsappNumber: record.whatsapp_number || record.contact_number,
      address: record.address || "",
      feeStatus: record.fee_status as "Paid" | "Pending" | "Partial",
      totalFees: record.total_fees,
      paidFees: record.paid_fees,
      attendancePercentage: record.attendance_percentage,
      joinDate: new Date(record.join_date || record.created_at).toISOString().split('T')[0],
      gender: record.gender as "Male" | "Female" | "Other" || undefined,
      aadhaarNumber: record.aadhaar_number ? String(record.aadhaar_number) : undefined,
      dateOfBirth: record.date_of_birth ? new Date(record.date_of_birth).toISOString().split('T')[0] : undefined,
      rollNumber: record.roll_number || undefined
    };
  },
  
  // Convert a Frontend Student to a Supabase Record
  mapToStudentRecord(student: Omit<Student, "id">): Omit<StudentRecord, "id" | "created_at" | "updated_at"> {
    return {
      full_name: student.name,
      class: parseInt(student.class.replace("Class ", "")),
      roll_number: student.rollNumber || 0,
      date_of_birth: student.dateOfBirth || new Date().toISOString().split('T')[0],
      guardian_name: `${student.fatherName} ${student.motherName}`.trim(),
      contact_number: student.phoneNumber,
      whatsapp_number: student.whatsappNumber || student.phoneNumber,
      address: student.address || "Address not provided",
      fee_status: student.feeStatus,
      total_fees: student.totalFees,
      paid_fees: student.paidFees,
      attendance_percentage: student.attendancePercentage,
      join_date: student.joinDate,
      gender: student.gender,
      aadhaar_number: student.aadhaarNumber
    };
  }
};

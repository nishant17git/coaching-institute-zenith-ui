
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { 
  Student, 
  FeeTransaction,
  AttendanceRecord,
  Class
} from '@/types';
import { toast } from 'sonner';

interface DataContextType {
  students: Student[];
  feeTransactions: FeeTransaction[];
  attendanceRecords: AttendanceRecord[];
  classes: Class[];
  testRecords: any[];
  
  // Student methods
  addStudent: (student: Omit<Student, 'id'>) => Promise<string>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  // Fee methods
  addFeeTransaction: (transaction: Omit<FeeTransaction, 'id'>) => Promise<string>;
  updateFeeTransaction: (id: string, data: Partial<FeeTransaction>) => Promise<void>;
  deleteFeeTransaction: (id: string) => Promise<void>;
  
  // Attendance methods
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => Promise<string>;
  updateAttendanceRecord: (id: string, data: Partial<AttendanceRecord>) => Promise<void>;
  bulkAddAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => Promise<void>;

  // Test methods
  addTestRecord: (record: any) => Promise<string>;
  updateTestRecord: (id: string, data: any) => Promise<void>;
  deleteTestRecord: (id: string) => Promise<void>;

  // Loading state
  isLoading: boolean;
}

export const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  
  // Fetch students data from Supabase using React Query
  const { 
    data: studentsData = [], 
    isLoading: isLoadingStudents,
    refetch: refetchStudents
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      return data;
    }
  });
  
  // Fetch test records from Supabase (using test_results table)
  const { 
    data: testRecords = [], 
    isLoading: isLoadingTests,
    refetch: refetchTests
  } = useQuery({
    queryKey: ['testRecords'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          *,
          students!inner(full_name, class),
          tests!inner(test_name, subject, test_date, test_type)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
  
  // Convert Supabase records to our frontend model
  const students: Student[] = studentsData.map(record => ({
    id: record.id,
    name: record.full_name,
    class: record.class.toString(),
    father: record.father_name,
    mother: record.mother_name || '',
    fatherName: record.father_name,
    motherName: record.mother_name || '',
    phoneNumber: record.contact_number,
    whatsappNumber: record.whatsapp_number || record.contact_number,
    address: record.address || '',
    feeStatus: (record.fee_status as "Paid" | "Pending" | "Partial") || "Pending",
    totalFees: record.total_fees || 0,
    paidFees: record.paid_fees || 0,
    attendancePercentage: record.attendance_percentage || 0,
    joinDate: record.admission_date || new Date().toISOString(),
    gender: record.gender as "Male" | "Female" | "Other" | undefined,
    aadhaarNumber: record.aadhaar_number || undefined,
    dateOfBirth: record.date_of_birth || undefined,
    rollNumber: record.roll_number || undefined
  }));
  
  // Calculate class data when students change
  useEffect(() => {
    if (students.length > 0) {
      // Group students by class
      const classGroups = students.reduce((groups: Record<string, Student[]>, student) => {
        const className = student.class;
        if (!groups[className]) {
          groups[className] = [];
        }
        groups[className].push(student);
        return groups;
      }, {});
      
      // Create class objects
      const classData = Object.keys(classGroups).map(className => ({
        id: className.toLowerCase().replace(' ', '-'),
        name: className,
        totalStudents: classGroups[className].length
      }));
      
      setClasses(classData);
    }
  }, [students]);
  
  // Initially we won't load all transactions and attendance records - they'll be loaded on demand
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Student CRUD operations
  const addStudent = async (studentData: Omit<Student, 'id'>): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{
          full_name: studentData.name,
          class: parseInt(studentData.class),
          roll_number: studentData.rollNumber || 1,
          date_of_birth: studentData.dateOfBirth || new Date().toISOString().split('T')[0],
          father_name: studentData.fatherName,
          mother_name: studentData.motherName,
          contact_number: studentData.phoneNumber,
          whatsapp_number: studentData.whatsappNumber,
          address: studentData.address,
          gender: studentData.gender,
          aadhaar_number: studentData.aadhaarNumber,
          total_fees: studentData.totalFees,
          paid_fees: studentData.paidFees,
          fee_status: studentData.feeStatus,
          attendance_percentage: studentData.attendancePercentage
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh students data
      refetchStudents();
      
      toast.success(`Added student: ${studentData.name}`);
      return data.id;
    } catch (error) {
      toast.error(`Failed to add student: ${(error as Error).message}`);
      throw error;
    }
  };

  const updateStudent = async (id: string, data: Partial<Student>): Promise<void> => {
    try {
      const updateData: any = {};
      
      if (data.name) updateData.full_name = data.name;
      if (data.class) updateData.class = parseInt(data.class);
      if (data.rollNumber) updateData.roll_number = data.rollNumber;
      if (data.dateOfBirth) updateData.date_of_birth = data.dateOfBirth;
      if (data.fatherName) updateData.father_name = data.fatherName;
      if (data.motherName) updateData.mother_name = data.motherName;
      if (data.phoneNumber) updateData.contact_number = data.phoneNumber;
      if (data.whatsappNumber) updateData.whatsapp_number = data.whatsappNumber;
      if (data.address) updateData.address = data.address;
      if (data.gender) updateData.gender = data.gender;
      if (data.aadhaarNumber) updateData.aadhaar_number = data.aadhaarNumber;
      if (data.totalFees !== undefined) updateData.total_fees = data.totalFees;
      if (data.paidFees !== undefined) updateData.paid_fees = data.paidFees;
      if (data.feeStatus) updateData.fee_status = data.feeStatus;
      if (data.attendancePercentage !== undefined) updateData.attendance_percentage = data.attendancePercentage;
      
      const { error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh students data
      refetchStudents();
      
      toast.success(`Updated student information`);
    } catch (error) {
      toast.error(`Failed to update student: ${(error as Error).message}`);
      throw error;
    }
  };

  const deleteStudent = async (id: string): Promise<void> => {
    try {
      const studentToDelete = students.find(s => s.id === id);
      
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh students data
      refetchStudents();
      
      toast.success(`Removed student: ${studentToDelete?.name || 'Unknown'}`);
    } catch (error) {
      toast.error(`Failed to delete student: ${(error as Error).message}`);
      throw error;
    }
  };

  // Fee CRUD operations
  const addFeeTransaction = async (transactionData: Omit<FeeTransaction, 'id'>): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('fee_transactions')
        .insert([{
          student_id: transactionData.studentId,
          amount: transactionData.amount,
          payment_date: transactionData.date,
          payment_mode: transactionData.paymentMode,
          receipt_number: transactionData.receiptNumber,
          purpose: transactionData.purpose,
          academic_year: '2024-25' // Default academic year
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh the students to get updated fee status
      refetchStudents();
      
      toast.success(`Added fee transaction of ₹${transactionData.amount}`);
      return data.id;
    } catch (error) {
      toast.error(`Failed to add transaction: ${(error as Error).message}`);
      throw error;
    }
  };

  const updateFeeTransaction = async (id: string, data: Partial<FeeTransaction>): Promise<void> => {
    // Not implemented in the Supabase service yet
    toast.error("Updating fee transactions is not implemented yet");
    throw new Error("Not implemented");
  };

  const deleteFeeTransaction = async (id: string): Promise<void> => {
    // Not implemented in the Supabase service yet
    toast.error("Deleting fee transactions is not implemented yet");
    throw new Error("Not implemented");
  };

  // Attendance CRUD operations
  const addAttendanceRecord = async (recordData: Omit<AttendanceRecord, 'id'>): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert([{
          student_id: recordData.studentId,
          date: recordData.date,
          status: recordData.status
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh students to get updated attendance percentage
      refetchStudents();
      
      toast.success(`Added attendance record for ${new Date(recordData.date).toLocaleDateString()}`);
      return data.id;
    } catch (error) {
      toast.error(`Failed to add attendance record: ${(error as Error).message}`);
      throw error;
    }
  };

  const updateAttendanceRecord = async (id: string, data: Partial<AttendanceRecord>): Promise<void> => {
    // Not implemented in the Supabase service yet
    toast.error("Updating attendance records is not implemented yet");
    throw new Error("Not implemented");
  };

  const bulkAddAttendance = async (records: Omit<AttendanceRecord, 'id'>[]): Promise<void> => {
    try {
      const { error } = await supabase
        .from('attendance_records')
        .insert(records.map(record => ({
          student_id: record.studentId,
          date: record.date,
          status: record.status
        })));
      
      if (error) throw error;
      
      // Refresh students to get updated attendance percentages
      refetchStudents();
      
      toast.success(`Added ${records.length} attendance records`);
    } catch (error) {
      toast.error(`Failed to add attendance records: ${(error as Error).message}`);
      throw error;
    }
  };

  // Test CRUD operations
  const addTestRecord = async (recordData: any): Promise<string> => {
    try {
      // First create the test
      const { data: testData, error: testError } = await supabase
        .from('tests')
        .insert([{
          test_name: recordData.test_name,
          subject: recordData.subject,
          test_date: recordData.test_date,
          class: recordData.class || 10,
          total_marks: recordData.total_marks,
          test_type: recordData.test_type
        }])
        .select()
        .single();

      if (testError) throw testError;

      // Then create the test result
      const { data: resultData, error: resultError } = await supabase
        .from('test_results')
        .insert([{
          student_id: recordData.student_id,
          test_id: testData.id,
          marks_obtained: recordData.marks,
          total_marks: recordData.total_marks
        }])
        .select()
        .single();

      if (resultError) throw resultError;
      
      // Refresh test records
      refetchTests();
      
      toast.success(`Added test record for ${recordData.test_name}`);
      return resultData.id;
    } catch (error) {
      toast.error(`Failed to add test record: ${(error as Error).message}`);
      throw error;
    }
  };

  const updateTestRecord = async (id: string, data: any): Promise<void> => {
    try {
      const { error } = await supabase
        .from('test_results')
        .update({
          marks_obtained: data.marks,
          total_marks: data.total_marks
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh test records
      refetchTests();
      
      toast.success(`Updated test record`);
    } catch (error) {
      toast.error(`Failed to update test record: ${(error as Error).message}`);
      throw error;
    }
  };

  const deleteTestRecord = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('test_results')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh test records
      refetchTests();
      
      toast.success(`Deleted test record`);
    } catch (error) {
      toast.error(`Failed to delete test record: ${(error as Error).message}`);
      throw error;
    }
  };

  const isLoading = isLoadingStudents || isLoadingTests;

  return (
    <DataContext.Provider value={{
      students,
      feeTransactions,
      attendanceRecords,
      classes,
      testRecords,
      addStudent,
      updateStudent,
      deleteStudent,
      addFeeTransaction,
      updateFeeTransaction,
      deleteFeeTransaction,
      addAttendanceRecord,
      updateAttendanceRecord,
      bulkAddAttendance,
      addTestRecord,
      updateTestRecord,
      deleteTestRecord,
      isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

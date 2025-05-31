
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/studentService';
import { supabase } from '@/integrations/supabase/client';
import { 
  Student, 
  FeeTransaction,
  AttendanceRecord,
  Class,
  TestRecord
} from '@/types';
import { toast } from 'sonner';

interface DataContextType {
  students: Student[];
  feeTransactions: FeeTransaction[];
  attendanceRecords: AttendanceRecord[];
  classes: Class[];
  testRecords: TestRecord[];
  
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
  addTestRecord: (test: Omit<TestRecord, 'id'>) => Promise<string>;
  updateTestRecord: (id: string, data: Partial<TestRecord>) => Promise<void>;
  deleteTestRecord: (id: string) => Promise<void>;

  // Loading state
  isLoading: boolean;
}

export const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [testRecords, setTestRecords] = useState<TestRecord[]>([]);
  
  // Fetch students data from Supabase using React Query
  const { 
    data: studentsData = [], 
    isLoading: isLoadingStudents,
    refetch: refetchStudents
  } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });
  
  // Fetch fee transactions
  const { 
    data: feeTransactionsData = [], 
    isLoading: isLoadingFees,
    refetch: refetchFees
  } = useQuery({
    queryKey: ['feeTransactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_transactions')
        .select('*')
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(transaction => ({
        id: transaction.id,
        studentId: transaction.student_id,
        amount: transaction.amount,
        date: transaction.payment_date,
        paymentMode: transaction.payment_mode as "Cash" | "Online" | "Cheque",
        receiptNumber: transaction.receipt_number,
        purpose: transaction.purpose
      }));
    }
  });

  // Fetch attendance records
  const { 
    data: attendanceRecordsData = [], 
    isLoading: isLoadingAttendance,
    refetch: refetchAttendance
  } = useQuery({
    queryKey: ['attendanceRecords'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(record => ({
        id: record.id,
        studentId: record.student_id,
        date: record.date,
        status: record.status as "Present" | "Absent" | "Leave" | "Holiday"
      }));
    }
  });

  // Fetch test records
  const { 
    data: testRecordsData = [], 
    isLoading: isLoadingTests,
    refetch: refetchTests
  } = useQuery({
    queryKey: ['testRecords'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          *,
          tests (
            test_name,
            subject,
            test_date,
            total_marks
          ),
          students (
            full_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(result => ({
        id: result.id,
        studentId: result.student_id,
        name: result.tests?.test_name || '',
        subject: result.tests?.subject || '',
        date: result.tests?.test_date || '',
        score: result.marks_obtained,
        maxScore: result.total_marks,
        rank: result.rank,
        percentile: result.percentage
      }));
    }
  });
  
  // Convert Supabase records to our frontend model
  const students = studentsData.map(record => studentService.mapToStudentModel(record));
  
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

  // Update state when data is fetched
  useEffect(() => {
    setFeeTransactions(feeTransactionsData);
  }, [feeTransactionsData]);

  useEffect(() => {
    setAttendanceRecords(attendanceRecordsData);
  }, [attendanceRecordsData]);

  useEffect(() => {
    setTestRecords(testRecordsData);
  }, [testRecordsData]);

  // Student CRUD operations
  const addStudent = async (studentData: Omit<Student, 'id'>): Promise<string> => {
    try {
      const studentRecord = studentService.mapToStudentRecord(studentData);
      const newStudent = await studentService.createStudent(studentRecord);
      
      // Refresh students data
      refetchStudents();
      
      toast.success(`Added student: ${studentData.name}`);
      return newStudent.id;
    } catch (error) {
      toast.error(`Failed to add student: ${(error as Error).message}`);
      throw error;
    }
  };

  const updateStudent = async (id: string, data: Partial<Student>): Promise<void> => {
    try {
      const studentRecord = studentService.mapToStudentRecord({
        ...students.find(s => s.id === id)!,
        ...data
      });
      
      await studentService.updateStudent(id, studentRecord);
      
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
      await studentService.deleteStudent(id);
      
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
        .insert({
          student_id: transactionData.studentId,
          amount: transactionData.amount,
          payment_date: transactionData.date,
          payment_mode: transactionData.paymentMode,
          receipt_number: transactionData.receiptNumber,
          purpose: transactionData.purpose,
          academic_year: new Date().getFullYear().toString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Refresh data
      refetchFees();
      refetchStudents();
      
      toast.success(`Added fee transaction of ₹${transactionData.amount}`);
      return data.id;
    } catch (error) {
      toast.error(`Failed to add transaction: ${(error as Error).message}`);
      throw error;
    }
  };

  const updateFeeTransaction = async (id: string, data: Partial<FeeTransaction>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('fee_transactions')
        .update({
          student_id: data.studentId,
          amount: data.amount,
          payment_date: data.date,
          payment_mode: data.paymentMode,
          receipt_number: data.receiptNumber,
          purpose: data.purpose
        })
        .eq('id', id);
        
      if (error) throw error;
      
      refetchFees();
      refetchStudents();
      
      toast.success(`Updated fee transaction`);
    } catch (error) {
      toast.error(`Failed to update transaction: ${(error as Error).message}`);
      throw error;
    }
  };

  const deleteFeeTransaction = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('fee_transactions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      refetchFees();
      refetchStudents();
      
      toast.success(`Deleted fee transaction`);
    } catch (error) {
      toast.error(`Failed to delete transaction: ${(error as Error).message}`);
      throw error;
    }
  };

  // Attendance CRUD operations
  const addAttendanceRecord = async (recordData: Omit<AttendanceRecord, 'id'>): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          student_id: recordData.studentId,
          date: recordData.date,
          status: recordData.status
        })
        .select()
        .single();
        
      if (error) throw error;
      
      refetchAttendance();
      refetchStudents();
      
      toast.success(`Added attendance record for ${new Date(recordData.date).toLocaleDateString()}`);
      return data.id;
    } catch (error) {
      toast.error(`Failed to add attendance record: ${(error as Error).message}`);
      throw error;
    }
  };

  const updateAttendanceRecord = async (id: string, data: Partial<AttendanceRecord>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('attendance_records')
        .update({
          student_id: data.studentId,
          date: data.date,
          status: data.status
        })
        .eq('id', id);
        
      if (error) throw error;
      
      refetchAttendance();
      refetchStudents();
      
      toast.success(`Updated attendance record`);
    } catch (error) {
      toast.error(`Failed to update attendance record: ${(error as Error).message}`);
      throw error;
    }
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
      
      refetchAttendance();
      refetchStudents();
      
      toast.success(`Added ${records.length} attendance records`);
    } catch (error) {
      toast.error(`Failed to add attendance records: ${(error as Error).message}`);
      throw error;
    }
  };

  // Test CRUD operations
  const addTestRecord = async (testData: Omit<TestRecord, 'id'>): Promise<string> => {
    try {
      // First create the test
      const { data: testRecord, error: testError } = await supabase
        .from('tests')
        .insert({
          test_name: testData.name,
          subject: testData.subject,
          test_date: testData.date,
          total_marks: testData.maxScore,
          class: parseInt(testData.subject) // This should be handled properly
        })
        .select()
        .single();
        
      if (testError) throw testError;
      
      // Then create the test result
      const { data: resultRecord, error: resultError } = await supabase
        .from('test_results')
        .insert({
          test_id: testRecord.id,
          student_id: testData.studentId,
          marks_obtained: testData.score,
          total_marks: testData.maxScore,
          rank: testData.rank,
          percentage: testData.percentile
        })
        .select()
        .single();
        
      if (resultError) throw resultError;
      
      refetchTests();
      
      toast.success(`Added test record: ${testData.name}`);
      return resultRecord.id;
    } catch (error) {
      toast.error(`Failed to add test record: ${(error as Error).message}`);
      throw error;
    }
  };

  const updateTestRecord = async (id: string, data: Partial<TestRecord>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('test_results')
        .update({
          marks_obtained: data.score,
          total_marks: data.maxScore,
          rank: data.rank,
          percentage: data.percentile
        })
        .eq('id', id);
        
      if (error) throw error;
      
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
      
      refetchTests();
      
      toast.success(`Deleted test record`);
    } catch (error) {
      toast.error(`Failed to delete test record: ${(error as Error).message}`);
      throw error;
    }
  };

  const isLoading = isLoadingStudents || isLoadingFees || isLoadingAttendance || isLoadingTests;

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

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/studentService';
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
  testRecords: any[]; // Add this property for test records
  
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
    queryFn: studentService.getStudents
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
  
  // Initially we won't load all transactions and attendance records - they'll be loaded on demand
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  // Initialize empty test records array
  const [testRecords, setTestRecords] = useState<any[]>([]);

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
      const newTransaction = await studentService.addFeeTransaction(transactionData);
      
      // Refresh the students to get updated fee status
      refetchStudents();
      
      toast.success(`Added fee transaction of ₹${transactionData.amount}`);
      return newTransaction.id;
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
      await studentService.markAttendance([recordData]);
      
      // Refresh students to get updated attendance percentage
      refetchStudents();
      
      toast.success(`Added attendance record for ${new Date(recordData.date).toLocaleDateString()}`);
      return ""; // We don't get the ID back from the markAttendance method
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
      await studentService.markAttendance(records);
      
      // Refresh students to get updated attendance percentages
      refetchStudents();
      
      toast.success(`Added ${records.length} attendance records`);
    } catch (error) {
      toast.error(`Failed to add attendance records: ${(error as Error).message}`);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      students,
      feeTransactions,
      attendanceRecords,
      classes,
      testRecords, // Add the testRecords property to the context value
      addStudent,
      updateStudent,
      deleteStudent,
      addFeeTransaction,
      updateFeeTransaction,
      deleteFeeTransaction,
      addAttendanceRecord,
      updateAttendanceRecord,
      bulkAddAttendance,
      isLoading: isLoadingStudents
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

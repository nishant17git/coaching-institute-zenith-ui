
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStoredData, storeData, STORAGE_KEYS } from '@/services/storageService';
import { 
  Student, 
  FeeTransaction,
  AttendanceRecord,
  Class
} from '@/types';
import { students as initialStudents, feeTransactions as initialFees, attendanceRecords as initialAttendance, classes } from '@/mock/data';
import { toast } from 'sonner';

interface DataContextType {
  students: Student[];
  feeTransactions: FeeTransaction[];
  attendanceRecords: AttendanceRecord[];
  classes: Class[];
  
  // Student methods
  addStudent: (student: Omit<Student, 'id'>) => string;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  
  // Fee methods
  addFeeTransaction: (transaction: Omit<FeeTransaction, 'id'>) => string;
  updateFeeTransaction: (id: string, data: Partial<FeeTransaction>) => void;
  deleteFeeTransaction: (id: string) => void;
  
  // Attendance methods
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => string;
  updateAttendanceRecord: (id: string, data: Partial<AttendanceRecord>) => void;
  bulkAddAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;
}

export const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state with localStorage data or defaults
  const [students, setStudents] = useState<Student[]>(
    getStoredData(STORAGE_KEYS.STUDENTS, initialStudents)
  );
  
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>(
    getStoredData(STORAGE_KEYS.FEES, initialFees)
  );
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(
    getStoredData(STORAGE_KEYS.ATTENDANCE, initialAttendance)
  );

  // Persist data whenever it changes
  useEffect(() => {
    storeData(STORAGE_KEYS.STUDENTS, students);
  }, [students]);
  
  useEffect(() => {
    storeData(STORAGE_KEYS.FEES, feeTransactions);
  }, [feeTransactions]);
  
  useEffect(() => {
    storeData(STORAGE_KEYS.ATTENDANCE, attendanceRecords);
  }, [attendanceRecords]);

  // Generate a simple unique ID for new entries
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Student CRUD operations
  const addStudent = (studentData: Omit<Student, 'id'>): string => {
    const id = generateId();
    const newStudent: Student = { ...studentData, id };
    setStudents(prev => [...prev, newStudent]);
    toast.success(`Added student: ${studentData.name}`);
    return id;
  };

  const updateStudent = (id: string, data: Partial<Student>): void => {
    setStudents(prev => 
      prev.map(student => student.id === id ? { ...student, ...data } : student)
    );
    toast.success(`Updated student information`);
  };

  const deleteStudent = (id: string): void => {
    const studentToDelete = students.find(s => s.id === id);
    setStudents(prev => prev.filter(student => student.id !== id));
    
    // Also clean up related records
    setFeeTransactions(prev => prev.filter(fee => fee.studentId !== id));
    setAttendanceRecords(prev => prev.filter(record => record.studentId !== id));
    
    toast.success(`Removed student: ${studentToDelete?.name || 'Unknown'}`);
  };

  // Fee CRUD operations
  const addFeeTransaction = (transactionData: Omit<FeeTransaction, 'id'>): string => {
    const id = generateId();
    const newTransaction: FeeTransaction = { ...transactionData, id };
    setFeeTransactions(prev => [...prev, newTransaction]);
    
    // Update student's fee status if needed
    if (transactionData.paymentMode) {
      const studentToUpdate = students.find(s => s.id === transactionData.studentId);
      if (studentToUpdate) {
        const paidFees = feeTransactions.filter(fee => 
          fee.studentId === transactionData.studentId && fee.paymentMode
        ).reduce((sum, fee) => sum + fee.amount, 0) + transactionData.amount;
        
        const isPaidInFull = paidFees >= studentToUpdate.totalFees;
        
        updateStudent(transactionData.studentId, { 
          paidFees, 
          feeStatus: isPaidInFull ? 'Paid' : 'Pending' 
        });
      }
    }
    
    toast.success(`Added fee transaction of ₹${transactionData.amount}`);
    return id;
  };

  const updateFeeTransaction = (id: string, data: Partial<FeeTransaction>): void => {
    setFeeTransactions(prev => 
      prev.map(transaction => transaction.id === id ? { ...transaction, ...data } : transaction)
    );
    toast.success(`Updated fee transaction`);
  };

  const deleteFeeTransaction = (id: string): void => {
    const transactionToDelete = feeTransactions.find(fee => fee.id === id);
    setFeeTransactions(prev => prev.filter(fee => fee.id !== id));
    
    // Update student's fee status if needed
    if (transactionToDelete && transactionToDelete.studentId && transactionToDelete.paymentMode) {
      const studentToUpdate = students.find(s => s.id === transactionToDelete.studentId);
      if (studentToUpdate) {
        const paidFees = feeTransactions
          .filter(fee => fee.studentId === transactionToDelete.studentId && 
                      fee.paymentMode && 
                      fee.id !== id)
          .reduce((sum, fee) => sum + fee.amount, 0);
        
        const isPaidInFull = paidFees >= studentToUpdate.totalFees;
        
        updateStudent(transactionToDelete.studentId, { 
          paidFees, 
          feeStatus: isPaidInFull ? 'Paid' : 'Pending' 
        });
      }
    }
    
    toast.success(`Removed fee transaction`);
  };

  // Attendance CRUD operations
  const addAttendanceRecord = (recordData: Omit<AttendanceRecord, 'id'>): string => {
    const id = generateId();
    const newRecord: AttendanceRecord = { ...recordData, id };
    setAttendanceRecords(prev => [...prev, newRecord]);
    
    // Calculate and update attendance percentage
    updateAttendancePercentage(recordData.studentId);
    
    toast.success(`Added attendance record for ${new Date(recordData.date).toLocaleDateString()}`);
    return id;
  };

  const updateAttendanceRecord = (id: string, data: Partial<AttendanceRecord>): void => {
    const previousRecord = attendanceRecords.find(record => record.id === id);
    
    setAttendanceRecords(prev => 
      prev.map(record => record.id === id ? { ...record, ...data } : record)
    );
    
    // Update attendance percentage if student ID or status changed
    if (previousRecord && 
       (data.studentId || data.status) && 
       previousRecord.studentId) {
      updateAttendancePercentage(previousRecord.studentId);
      
      // If student ID changed, update both students
      if (data.studentId && previousRecord.studentId !== data.studentId) {
        updateAttendancePercentage(data.studentId);
      }
    }
    
    toast.success(`Updated attendance record`);
  };

  const bulkAddAttendance = (records: Omit<AttendanceRecord, 'id'>[]): void => {
    const newRecords = records.map(record => ({
      ...record,
      id: generateId()
    }));
    
    setAttendanceRecords(prev => [...prev, ...newRecords]);
    
    // Update attendance percentages for all affected students
    const affectedStudentIds = [...new Set(records.map(record => record.studentId))];
    affectedStudentIds.forEach(updateAttendancePercentage);
    
    toast.success(`Added ${records.length} attendance records`);
  };

  // Helper function to calculate and update attendance percentage for a student
  const updateAttendancePercentage = (studentId: string): void => {
    const studentRecords = attendanceRecords.filter(record => record.studentId === studentId);
    if (studentRecords.length === 0) return;
    
    const totalDays = studentRecords.length;
    const presentDays = studentRecords.filter(record => record.status === "Present").length;
    const attendancePercentage = Math.round((presentDays / totalDays) * 100);
    
    // Update the student with new attendance percentage
    updateStudent(studentId, { attendancePercentage });
  };

  return (
    <DataContext.Provider value={{
      students,
      feeTransactions,
      attendanceRecords,
      classes,
      addStudent,
      updateStudent,
      deleteStudent,
      addFeeTransaction,
      updateFeeTransaction,
      deleteFeeTransaction,
      addAttendanceRecord,
      updateAttendanceRecord,
      bulkAddAttendance
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

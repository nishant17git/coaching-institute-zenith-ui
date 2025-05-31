
import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newStudentService } from '@/services/newStudentService';
import { DatabaseStudent } from '@/types/database';
import { Student, Class } from '@/types';
import { toast } from 'sonner';

interface NewDataContextType {
  students: Student[];
  classes: Class[];
  
  // Student methods
  addStudent: (student: Omit<Student, 'id'>) => Promise<string>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  // Loading state
  isLoading: boolean;
}

export const NewDataContext = createContext<NewDataContextType | null>(null);

export const NewDataProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  
  // Fetch students data from Supabase using React Query
  const { 
    data: studentsData = [], 
    isLoading: isLoadingStudents
  } = useQuery({
    queryKey: ['new-students'],
    queryFn: newStudentService.getStudents
  });
  
  // Convert database records to frontend models
  const students = studentsData.map(record => newStudentService.mapToFrontendStudent(record));
  
  // Calculate class data when students change
  const classes = React.useMemo(() => {
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
      return Object.keys(classGroups).map(className => ({
        id: className.toLowerCase().replace(' ', '-'),
        name: className,
        totalStudents: classGroups[className].length
      }));
    }
    return [];
  }, [students]);

  // Student CRUD mutations
  const addStudentMutation = useMutation({
    mutationFn: async (studentData: Omit<Student, 'id'>) => {
      const dbStudent = newStudentService.mapToDatabaseStudent(studentData);
      const newStudent = await newStudentService.createStudent(dbStudent);
      return newStudent.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-students'] });
      toast.success('Student added successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to add student: ${error.message}`);
    }
  });

  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Student> }) => {
      const dbUpdates = newStudentService.mapToDatabaseStudent(data as Omit<Student, 'id'>);
      await newStudentService.updateStudent(id, dbUpdates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-students'] });
      toast.success('Student updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update student: ${error.message}`);
    }
  });

  const deleteStudentMutation = useMutation({
    mutationFn: newStudentService.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-students'] });
      toast.success('Student deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete student: ${error.message}`);
    }
  });

  const addStudent = async (studentData: Omit<Student, 'id'>): Promise<string> => {
    return addStudentMutation.mutateAsync(studentData);
  };

  const updateStudent = async (id: string, data: Partial<Student>): Promise<void> => {
    return updateStudentMutation.mutateAsync({ id, data });
  };

  const deleteStudent = async (id: string): Promise<void> => {
    return deleteStudentMutation.mutateAsync(id);
  };

  return (
    <NewDataContext.Provider value={{
      students,
      classes,
      addStudent,
      updateStudent,
      deleteStudent,
      isLoading: isLoadingStudents
    }}>
      {children}
    </NewDataContext.Provider>
  );
};

// Custom hook to use the new data context
export const useNewData = () => {
  const context = useContext(NewDataContext);
  if (!context) {
    throw new Error('useNewData must be used within a NewDataProvider');
  }
  return context;
};

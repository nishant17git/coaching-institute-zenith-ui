
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import StudentCard from "@/components/ui/student-card";
import { StudentForm } from "@/components/students/StudentForm";
import { ModernStudentCard } from "@/components/ui/modern-student-card";
import { OptimizedStudentForm } from "@/components/students/OptimizedStudentForm";

// Icons
import { Search, Plus, Users, Filter } from "lucide-react";

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [feeStatusFilter, setFeeStatusFilter] = useState("all");
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch students from Supabase
  const {
    data: students = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('class', { ascending: true })
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch classes for the form
  const {
    data: classes = [],
  } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      // Get unique classes from students
      const uniqueClasses = [...new Set(students.map(s => s.class))].sort((a, b) => a - b);
      return uniqueClasses.map(cls => ({
        id: cls.toString(),
        name: `Class ${cls}`,
        totalStudents: students.filter(s => s.class === cls).length
      }));
    },
    enabled: students.length > 0
  });

  // Add student mutation
  const addStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      console.log('Adding student:', studentData);
      
      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();
      
      if (error) {
        console.error('Add student error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsAddStudentDialogOpen(false);
      setSelectedStudent(null);
    },
    onError: (error: any) => {
      console.error('Add student mutation error:', error);
    }
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log('Updating student:', id, data);
      
      const { error } = await supabase
        .from('students')
        .update(data)
        .eq('id', id);
      
      if (error) {
        console.error('Update student error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsAddStudentDialogOpen(false);
      setSelectedStudent(null);
    },
    onError: (error: any) => {
      console.error('Update student mutation error:', error);
    }
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting student:', id);
      
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Delete student error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: any) => {
      console.error('Delete student mutation error:', error);
    }
  });

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.roll_number?.toString().includes(searchQuery);
    const matchesClass = classFilter === "all" || student.class.toString() === classFilter;
    const matchesFeeStatus = feeStatusFilter === "all" || student.fee_status === feeStatusFilter;
    
    return matchesSearch && matchesClass && matchesFeeStatus;
  });

  // Get unique classes for filter
  const uniqueClasses = [...new Set(students.map(s => s.class))].sort((a, b) => a - b);

  const handleCallClick = (name: string, phone: string) => {
    // Handle phone call functionality
    window.open(`tel:${phone}`, '_self');
  };

  const handleEdit = (student: any) => {
    setSelectedStudent(student);
    setIsAddStudentDialogOpen(true);
  };

  const handleDelete = async (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await deleteStudentMutation.mutateAsync(studentId);
    }
  };

  const handleDownloadVCF = (student: any) => {
    // Import dynamically to avoid build issues
    import('@/utils/vcfUtils').then(({ downloadVCF }) => {
      downloadVCF(student);
    });
  };

  const handleFormSubmit = async (data: any) => {
    console.log('Form submit data:', data);
    
    // Transform the form data to match database schema
    const transformedData = {
      full_name: data.name,
      class: parseInt(data.class.replace("Class ", "")),
      roll_number: data.rollNumber || null,
      father_name: data.fatherName,
      mother_name: data.motherName || '',
      contact_number: data.phoneNumber,
      whatsapp_number: data.whatsappNumber || data.phoneNumber,
      address: data.address,
      total_fees: data.totalFees,
      fee_status: 'Pending',
      paid_fees: 0,
      attendance_percentage: 0,
      gender: data.gender || null,
      date_of_birth: data.dateOfBirth || null,
      aadhaar_number: data.aadhaarNumber || null,
      admission_date: new Date().toISOString().split('T')[0]
    };

    if (selectedStudent) {
      return updateStudentMutation.mutateAsync({ id: selectedStudent.id, data: transformedData });
    } else {
      return addStudentMutation.mutateAsync(transformedData);
    }
  };

  const handleViewDetails = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading students: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <EnhancedPageHeader 
        title="Students" 
        action={
          <Button 
            data-add-student
            onClick={() => {
              setSelectedStudent(null);
              setIsAddStudentDialogOpen(true);
            }} 
            className="bg-black hover:bg-black/80"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Student
          </Button>
        } 
      />

      {/* Filters */}
      <div className="bg-background/60 backdrop-blur-sm p-5 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search students..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10 h-11" 
            />
          </div>

          <div className="flex gap-3">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map(cls => (
                  <SelectItem key={cls} value={cls.toString()}>Class {cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={feeStatusFilter} onValueChange={setFeeStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Fee Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      {isLoading ? (
        <LoadingState />
      ) : filteredStudents.length === 0 ? (
        <EmptyState 
          icon={<Users className="h-10 w-10 text-muted-foreground" />} 
          title="No students found" 
          description="No students match your current filters." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student, index) => (
            <ModernStudentCard
              key={student.id}
              student={{
                id: student.id,
                name: student.full_name,
                class: `Class ${student.class}`,
                father: student.father_name,
                mother: student.mother_name || '',
                fatherName: student.father_name,
                motherName: student.mother_name || '',
                phoneNumber: student.contact_number,
                whatsappNumber: student.whatsapp_number || student.contact_number,
                address: student.address || '',
                feeStatus: student.fee_status as "Paid" | "Pending" | "Partial",
                totalFees: student.total_fees || 0,
                paidFees: student.paid_fees || 0,
                attendancePercentage: student.attendance_percentage || 0,
                joinDate: student.admission_date || student.created_at,
                gender: student.gender as "Male" | "Female" | "Other",
                aadhaarNumber: student.aadhaar_number,
                dateOfBirth: student.date_of_birth,
                rollNumber: student.roll_number
              }}
              index={index}
              onCallClick={handleCallClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
              onDownloadVCF={handleDownloadVCF}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Student Dialog */}
      <Dialog 
        open={isAddStudentDialogOpen} 
        onOpenChange={(open) => {
          setIsAddStudentDialogOpen(open);
          if (!open) setSelectedStudent(null);
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
          <OptimizedStudentForm 
            student={selectedStudent}
            classes={classes}
            onSubmit={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

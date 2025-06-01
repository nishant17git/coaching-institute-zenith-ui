import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Users, UserPlus, GraduationCap, Calendar } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import StudentCard from "@/components/ui/student-card";
import { StudentForm } from "@/components/students/StudentForm";
import { useIsMobile } from "@/hooks/use-mobile";

// Services and Types
import { studentService } from "@/services/studentService";
import { StudentRecord, Student } from "@/types";

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [feeStatusFilter, setFeeStatusFilter] = useState("all");
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Fetch students data
  const {
    data: studentsData = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });

  // Convert to Student models for the UI
  const students = studentsData.map(student => studentService.mapToStudentModel(student));

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: studentService.createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsAddStudentDialogOpen(false);
      toast.success("Student added successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to add student: ${error.message}`);
    }
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: ({ id, student }: { id: string, student: Partial<Omit<StudentRecord, "id" | "created_at" | "updated_at">> }) =>
      studentService.updateStudent(id, student),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setEditingStudent(null);
      toast.success("Student updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update student: ${error.message}`);
    }
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: studentService.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success("Student deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete student: ${error.message}`);
    }
  });

  // Handle student creation
  const handleCreateStudent = async (studentData: Omit<Student, "id">) => {
    const studentRecord = studentService.mapToStudentRecord(studentData);
    createStudentMutation.mutate(studentRecord);
  };

  // Handle student update
  const handleUpdateStudent = async (studentData: Omit<Student, "id">) => {
    if (!editingStudent) return;
    
    const studentRecord = studentService.mapToStudentRecord(studentData);
    updateStudentMutation.mutate({ 
      id: editingStudent.id, 
      student: studentRecord 
    });
  };

  // Handle student deletion
  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      deleteStudentMutation.mutate(studentId);
    }
  };

  // Filter students based on search query and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const classNum = parseInt(student.class.replace("Class ", ""));
    const matchesClass = classFilter === "all" || classNum.toString() === classFilter;
    const matchesFeeStatus = feeStatusFilter === "all" || student.feeStatus === feeStatusFilter;
    
    return matchesSearch && matchesClass && matchesFeeStatus;
  });

  // Get unique classes for filter
  const classes = [...new Set(students.map(student => parseInt(student.class.replace("Class ", ""))))].sort();

  // Calculate statistics
  const totalStudents = students.length;
  const newStudentsThisMonth = students.filter(student => {
    const joinDate = new Date(student.joinDate);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
  }).length;

  const averageAttendance = students.length > 0 
    ? Math.round(students.reduce((sum, student) => sum + student.attendancePercentage, 0) / students.length)
    : 0;

  // Mock classes data for the form
  const mockClasses = [
    { id: "1", name: "Class 1", totalStudents: 0 },
    { id: "2", name: "Class 2", totalStudents: 0 },
    { id: "3", name: "Class 3", totalStudents: 0 },
    { id: "4", name: "Class 4", totalStudents: 0 },
    { id: "5", name: "Class 5", totalStudents: 0 },
  ];

  // Mock call handler
  const handleCallClick = (name: string, phone: string) => {
    toast.success("Call feature", {
      description: `Calling ${name} at ${phone}`
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">Error loading students</h3>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <EnhancedPageHeader 
        title="Students" 
        action={
          <Button 
            onClick={() => setIsAddStudentDialogOpen(true)} 
            className="bg-black hover:bg-black/80"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Student
          </Button>
        } 
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-4 border-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" /> Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Enrolled</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <UserPlus className="h-4 w-4" /> New This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newStudentsThisMonth}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Admissions</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b-4 border-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
              <GraduationCap className="h-4 w-4" /> Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b-4 border-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
              <Calendar className="h-4 w-4" /> Avg Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAttendance}%</div>
            <div className="text-xs sm:text-sm text-muted-foreground">This term</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-background/60 backdrop-blur-sm p-5 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search students..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10 h-11 text-base" 
            />
          </div>

          <div className="flex flex-row gap-3 w-full sm:w-auto">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(classNum => (
                  <SelectItem key={classNum} value={classNum.toString()}>Class {classNum}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={feeStatusFilter} onValueChange={setFeeStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Fee Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <Card className="shadow-sm border-muted">
        <CardContent className="p-4">
          {isLoading ? (
            <LoadingState />
          ) : filteredStudents.length === 0 ? (
            <EmptyState 
              icon={<Users className="h-10 w-10 text-muted-foreground" />} 
              title="No students found" 
              description="No students match your current filters. Try adjusting your search criteria or add a new student." 
              action={
                <Button onClick={() => setIsAddStudentDialogOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Add First Student
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <StudentCard 
                    student={student}
                    index={index}
                    onCallClick={handleCallClick}
                    isFavorite={false}
                    onEdit={(student) => setEditingStudent(student)}
                    onDelete={(studentId) => handleDeleteStudent(studentId)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter the student's information to add them to the system.
            </DialogDescription>
          </DialogHeader>
          <StudentForm 
            classes={mockClasses}
            onSubmit={handleCreateStudent}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student's information.
            </DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <StudentForm 
              student={editingStudent}
              classes={mockClasses}
              onSubmit={handleUpdateStudent}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

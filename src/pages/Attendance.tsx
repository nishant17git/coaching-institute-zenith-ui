import { useState, useEffect, useMemo } from "react";
import { format, isToday, startOfMonth, endOfMonth, isSameDay, subMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Import icons
import { CalendarIcon, Search, Users, Check, X, Clock, ChevronLeft, ChevronRight, Save, Loader2, AlertCircle, Calendar as CalendarSquareIcon, LayoutGrid, Download, FileText, Share, User } from "lucide-react";

// Import components for attendance page
import { AttendanceSummary } from "@/components/attendance/AttendanceSummary";
import { AttendanceCalendarView } from "@/components/attendance/AttendanceCalendarView";
import { ClassAttendanceTable } from "@/components/attendance/ClassAttendanceTable";
import { MobileAttendanceList } from "@/components/attendance/MobileAttendanceList";
import { StudentAttendanceTab } from "@/components/attendance/StudentAttendanceTab"; // New component
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { exportAttendanceToPDF } from "@/services/pdfService"; // Import PDF service

interface Student {
  id: string;
  full_name: string;
  class: number;
  roll_number?: string;
  status?: "Present" | "Absent" | "Leave" | "Holiday";
}
interface AttendanceRecord {
  id?: string;
  student_id: string;
  date: string;
  status: "Present" | "Absent" | "Leave" | "Holiday";
}
export default function Attendance() {
  // Responsive design detection
  const isMobile = useMediaQuery("(max-width: 768px)");

  // State management
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [dayAttendance, setDayAttendance] = useState<Student[]>([]);
  const [isBulkMarkOpen, setIsBulkMarkOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<"Present" | "Absent" | "Leave" | "Holiday">("Present");
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [view, setView] = useState<"table" | "calendar" | "students">("table");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const queryClient = useQueryClient();

  // Data fetching with React Query
  const {
    data: students = [],
    isLoading: studentsLoading
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('students').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Monthly attendance records - now filtered by class
  const {
    data: allAttendanceRecords = [],
    isLoading: allAttendanceLoading
  } = useQuery({
    queryKey: ['attendance', format(selectedMonth, 'yyyy-MM'), selectedClass],
    queryFn: async () => {
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
      // Get students in the selected class
      const { data: classStudents } = await supabase
        .from('students')
        .select('id')
        .eq('class', selectedClass);
      
      if (!classStudents || classStudents.length === 0) return [];
      
      const studentIds = classStudents.map(s => s.id);
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'))
        .in('student_id', studentIds);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Daily attendance records
  const {
    data: attendanceRecords = [],
    isLoading: attendanceLoading
  } = useQuery({
    queryKey: ['attendance', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('attendance_records').select('*').eq('date', format(selectedDate, 'yyyy-MM-dd'));
      if (error) throw error;
      return data;
    }
  });

  // Student history records (for selected student)
  const {
    data: studentHistory = [],
    isLoading: studentHistoryLoading
  } = useQuery({
    queryKey: ['attendance', 'student', selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent?.id) return [];

      // Get attendance for the past 3 months
      const threeMonthsAgo = subMonths(new Date(), 3);
      const {
        data,
        error
      } = await supabase.from('attendance_records').select('*').eq('student_id', selectedStudent.id).gte('date', format(threeMonthsAgo, 'yyyy-MM-dd')).order('date', {
        ascending: false
      });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedStudent?.id
  });

  // Mutation to save attendance with optimistic updates
  const saveAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: AttendanceRecord[]) => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // Group records by operation type (insert or update)
      const studentIds = attendanceData.map(record => record.student_id);

      // Fetch existing records
      const {
        data: existingRecords
      } = await supabase.from('attendance_records').select('id, student_id').eq('date', dateStr).in('student_id', studentIds);
      const existingMap = new Map();
      (existingRecords || []).forEach(record => {
        existingMap.set(record.student_id, record.id);
      });

      // Prepare batches for insert and update
      const recordsToInsert = [];
      const recordsToUpdate = [];
      for (const record of attendanceData) {
        const existingId = existingMap.get(record.student_id);
        if (existingId) {
          // Update existing record
          recordsToUpdate.push({
            id: existingId,
            student_id: record.student_id,
            date: record.date,
            status: record.status
          });
        } else {
          // Insert new record
          recordsToInsert.push(record);
        }
      }

      // Execute batch operations
      const operations = [];
      if (recordsToInsert.length > 0) {
        operations.push(supabase.from('attendance_records').insert(recordsToInsert));
      }
      if (recordsToUpdate.length > 0) {
        // Update records one by one to ensure all updates go through
        for (const record of recordsToUpdate) {
          operations.push(supabase.from('attendance_records').update({
            status: record.status
          }).eq('id', record.id));
        }
      }

      // Execute all operations
      const results = await Promise.all(operations);

      // Check for errors
      for (const result of results) {
        if (result.error) throw result.error;
      }

      // Update attendance percentages
      const studentUpdatePromises = studentIds.map(async studentId => {
        // Get student attendance history
        const {
          data: studentAttendance,
          error: attendanceError
        } = await supabase.from('attendance_records').select('*').eq('student_id', studentId);
        if (attendanceError) throw attendanceError;
        if (studentAttendance && studentAttendance.length > 0) {
          // Calculate percentage
          const totalDays = studentAttendance.length;
          const presentDays = studentAttendance.filter(a => a.status === 'Present').length;
          const attendancePercentage = Math.round(presentDays / totalDays * 100);

          // Update student record
          return supabase.from('students').update({
            attendance_percentage: attendancePercentage
          }).eq('id', studentId);
        }
        return null;
      });
      await Promise.all(studentUpdatePromises.filter(Boolean));
      return attendanceData;
    },
    onMutate: async newAttendance => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['attendance']
      });

      // Snapshot previous attendance data
      const previousAttendance = queryClient.getQueryData(['attendance', format(selectedDate, 'yyyy-MM-dd')]);

      // Optimistically update the UI
      queryClient.setQueryData(['attendance', format(selectedDate, 'yyyy-MM-dd')], newAttendance);

      // Return context for rollback
      return {
        previousAttendance
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance']
      });
      queryClient.invalidateQueries({
        queryKey: ['students']
      });
      toast.success(`Attendance saved for ${format(selectedDate, 'MMMM d, yyyy')}`, {
        description: `Successfully recorded attendance for ${dayAttendance.length} students`,
        action: {
          label: "View",
          onClick: () => setView("calendar")
        }
      });
      setConfirmSave(false);
    },
    onError: (error: any, _, context) => {
      // Rollback on error
      if (context?.previousAttendance) {
        queryClient.setQueryData(['attendance', format(selectedDate, 'yyyy-MM-dd')], context.previousAttendance);
      }
      toast.error(`Failed to save attendance: ${error.message}`, {
        description: "Please try again or check your connection"
      });
      setConfirmSave(false);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: ['attendance', format(selectedDate, 'yyyy-MM-dd')]
      });
    }
  });

  // Process student data with attendance status
  useEffect(() => {
    let filteredStudents = students.filter(student => student.class === selectedClass);
    if (searchQuery) {
      filteredStudents = filteredStudents.filter(student => student.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    const dateString = format(selectedDate, 'yyyy-MM-dd');

    // Map students to our internal Student type with string roll_number
    const studentsWithStatus = filteredStudents.map(student => {
      const record = attendanceRecords.find(record => record.student_id === student.id && record.date === dateString);
      return {
        id: student.id,
        full_name: student.full_name,
        class: student.class,
        roll_number: student.roll_number ? String(student.roll_number) : undefined,
        status: record?.status as "Present" | "Absent" | "Leave" | "Holiday" || "Absent"
      };
    });
    setDayAttendance(studentsWithStatus);
  }, [selectedDate, selectedClass, searchQuery, students, attendanceRecords]);

  // Prepare calendar data - now class-specific
  useEffect(() => {
    if (!allAttendanceLoading && allAttendanceRecords) {
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      const daysInMonth = monthEnd.getDate();
      const calendarDays = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
        const dateString = format(date, 'yyyy-MM-dd');

        // Get day's attendance for selected class only
        const dayAttendance = allAttendanceRecords.filter(record => record.date === dateString);
        const presentCount = dayAttendance.filter(record => record.status === 'Present').length;
        const absentCount = dayAttendance.filter(record => record.status === 'Absent').length;
        const leaveCount = dayAttendance.filter(record => record.status === 'Leave').length;
        const totalStudents = presentCount + absentCount + leaveCount;
        const attendancePercentage = totalStudents > 0 ? Math.round(presentCount / totalStudents * 100) : 0;
        
        calendarDays.push({
          date,
          dayOfMonth: day,
          isToday: isToday(date),
          isSelected: isSameDay(date, selectedDate),
          stats: {
            present: presentCount,
            absent: absentCount,
            leave: leaveCount,
            percentage: attendancePercentage
          }
        });
      }
      setCalendarData(calendarDays);
    }
  }, [allAttendanceRecords, selectedDate, selectedMonth, allAttendanceLoading]);

  // Handle status change
  const handleStatusChange = (studentId: string, status: "Present" | "Absent" | "Leave" | "Holiday") => {
    setDayAttendance(prev => prev.map(student => student.id === studentId ? {
      ...student,
      status
    } : student));
  };

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => ({
    presentCount: dayAttendance.filter(s => s.status === "Present").length,
    absentCount: dayAttendance.filter(s => s.status === "Absent").length,
    leaveCount: dayAttendance.filter(s => s.status === "Leave").length,
    holidayCount: dayAttendance.filter(s => s.status === "Holiday").length,
    totalStudents: dayAttendance.length,
    attendancePercentage: dayAttendance.length > 0 ? Math.round(dayAttendance.filter(s => s.status === "Present").length / dayAttendance.length * 100) : 0
  }), [dayAttendance]);

  // Save attendance for the day
  const saveAttendance = () => {
    // Check if there are any changes to save
    if (dayAttendance.length === 0) {
      toast.warning("No students found for this class", {
        description: "Please select a class with students to mark attendance"
      });
      return;
    }

    // Show confirmation dialog
    setConfirmSave(true);
  };

  // Handle confirmation and save
  const handleConfirmedSave = () => {
    const attendanceData = dayAttendance.map(student => ({
      student_id: student.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      status: student.status || "Absent"
    }));
    saveAttendanceMutation.mutate(attendanceData);
  };

  // Mark attendance in bulk
  const markBulkAttendance = () => {
    const updatedAttendance = dayAttendance.map(student => ({
      ...student,
      status: bulkStatus
    }));
    setDayAttendance(updatedAttendance);
    setIsBulkMarkOpen(false);
    toast.success(`Marked all students as ${bulkStatus}`, {
      description: `Set ${dayAttendance.length} students to ${bulkStatus} status`
    });
  };

  // Determine if there are any unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      // If we have student statuses but no attendance records, there are changes
      return dayAttendance.some(student => student.status);
    }

    // Compare current attendance with saved attendance
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    for (const student of dayAttendance) {
      const record = attendanceRecords.find(r => r.student_id === student.id && r.date === dateString);

      // If record exists but status differs, or record doesn't exist but student has status
      if (record && record.status !== student.status || !record && student.status) {
        return true;
      }
    }
    return false;
  }, [dayAttendance, attendanceRecords, selectedDate]);

  // Handle student selection for individual attendance view
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  // Handle export to PDF
  const handleExportPDF = () => {
    if (!selectedStudent) return;

    // Format attendance records for PDF - properly cast the status to the correct type
    const records = studentHistory.map(record => ({
      id: record.id,
      studentId: record.student_id,
      date: record.date,
      status: record.status as "Present" | "Absent" | "Leave" | "Holiday"
    }));

    // Calculate attendance percentage
    const presentCount = records.filter(r => r.status === 'Present').length;
    const totalDays = records.length;
    const attendancePercentage = totalDays > 0 ? Math.round(presentCount / totalDays * 100) : 0;

    // Export as PDF
    exportAttendanceToPDF({
      records,
      studentData: {
        id: selectedStudent.id,
        name: selectedStudent.full_name,
        class: selectedStudent.class,
        attendancePercentage
      },
      title: "Student Attendance Report",
      subtitle: `Attendance Report for ${selectedStudent.full_name} - Class ${selectedStudent.class}`,
      chartImage: null // We could add a chart image in the future
    });
    toast.success("PDF exported successfully", {
      description: `Attendance report for ${selectedStudent.full_name} has been downloaded`
    });
  };

  // Handle export to PDF for calendar view
  const handleCalendarExportPDF = (date: Date, stats: {
    present: number;
    absent: number;
    leave: number;
    total: number;
  }) => {
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Get students for the selected class and date
    const classStudents = students.filter(s => s.class === selectedClass);
    const dayRecords = attendanceRecords.filter(r => r.date === dateString);
    
    // Create records with proper student names and classes
    const records = classStudents.map(student => {
      const record = dayRecords.find(r => r.student_id === student.id);
      return {
        id: student.id,
        studentId: student.id,
        date: dateString,
        status: (record?.status || "Absent") as "Present" | "Absent" | "Leave" | "Holiday",
        studentName: student.full_name,
        studentClass: `Class ${student.class}`
      };
    });

    // Export as PDF using the existing PDF service
    exportAttendanceToPDF({
      records,
      studentData: {
        id: `class-${selectedClass}`,
        name: `Class ${selectedClass}`,
        class: selectedClass,
        attendancePercentage: stats.total > 0 ? Math.round(stats.present / stats.total * 100) : 0
      },
      title: "Daily Attendance Report",
      subtitle: `Attendance Report for Class ${selectedClass} - ${format(date, 'MMMM d, yyyy')}`,
      chartImage: null
    });
    
    toast.success("PDF exported successfully", {
      description: `Attendance report for ${format(date, 'MMMM d, yyyy')} has been downloaded`
    });
  };
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} transition={{
    duration: 0.3
  }} className="space-y-6 container px-0 sm:px-4 mx-auto max-w-7xl">
      <EnhancedPageHeader title="Attendance" />

      {/* Stats Cards */}
      <AttendanceSummary stats={attendanceStats} />

      {/* View selector tabs */}
      <Tabs value={view} onValueChange={value => setView(value as "table" | "calendar" | "students")} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" /> {!isMobile && "Class Attendance"}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarSquareIcon className="h-4 w-4" /> {!isMobile && "Calendar View"}
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <User className="h-4 w-4" /> {!isMobile && "Students"}
          </TabsTrigger>
        </TabsList>

        {/* Main content based on selected view */}
        <TabsContent value="table" className="space-y-4 focus-visible:outline-none">
          {/* Main attendance table section */}
          <Card className="bg-white shadow-sm border">
            <CardHeader className="px-5 py-4 border-b">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-lg font-semibold">Class {selectedClass} Attendance</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground flex items-center gap-2">
                    {dayAttendance.length} students | 
                    <span className="font-medium text-primary">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </span>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 px-2 ml-1">
                          <CalendarIcon className="h-3.5 w-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={selectedDate} onSelect={date => {
                        if (date) {
                          setSelectedDate(date);
                          setIsCalendarOpen(false);
                        }
                      }} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </CardDescription>
                </div>
                {hasUnsavedChanges && <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Unsaved changes
                  </Badge>}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
                <div className="flex flex-1 w-full sm:w-auto items-center gap-3">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search student..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                    {searchQuery && <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0" onClick={() => setSearchQuery("")}>
                        <X className="h-3 w-3" />
                      </Button>}
                  </div>
                  
                  <Select value={selectedClass.toString()} onValueChange={value => setSelectedClass(parseInt(value))}>
                    <SelectTrigger className="w-32 shrink-0">
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({
                      length: 9
                    }, (_, i) => i + 2).map(cls => <SelectItem key={cls} value={cls.toString()}>
                          Class {cls}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {studentsLoading || attendanceLoading ? <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div> : <>
                  {isMobile ? <MobileAttendanceList students={dayAttendance.map(student => ({
                id: student.id,
                name: student.full_name,
                rollNumber: student.roll_number || `${student.id.slice(-4)}`,
                status: student.status || "Absent"
              }))} onStatusChange={handleStatusChange} /> : <ClassAttendanceTable students={dayAttendance.map(student => ({
                id: student.id,
                name: student.full_name,
                rollNumber: student.roll_number || `${student.id.slice(-4)}`,
                status: student.status || "Absent"
              }))} date={selectedDate} onStatusChange={handleStatusChange} onSaveAttendance={saveAttendance} isSaving={saveAttendanceMutation.isPending} />}
                </>}
            </CardContent>
            {dayAttendance.length > 0 && <CardFooter className="border-t px-5 py-4 flex flex-col sm:flex-row gap-3 justify-end bg-gray-50">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto gap-1" onClick={() => setIsBulkMarkOpen(true)} size={isMobile ? "sm" : "default"}>
                    <Users className="h-4 w-4" /> 
                    {isMobile ? "Mark All" : "Mark All Students"}
                  </Button>

                  <Button variant={saveAttendanceMutation.isPending ? "outline" : "default"} className={`w-full sm:w-auto gap-1 ${saveAttendanceMutation.isPending ? "" : "bg-green-600 hover:bg-green-700"} text-white shadow-sm`} onClick={saveAttendance} disabled={saveAttendanceMutation.isPending || !hasUnsavedChanges} size={isMobile ? "sm" : "default"}>
                    {saveAttendanceMutation.isPending ? <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </> : <>
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </>}
                  </Button>
                </div>
              </CardFooter>}
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="focus-visible:outline-none">
          <Card className="shadow-sm">
            <CardHeader className="px-5 py-4 border-b">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="font-semibold py-0 text-lg">Calendar</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    View and track attendance records across the month
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={selectedClass.toString()} onValueChange={value => setSelectedClass(parseInt(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 9 }, (_, i) => i + 2).map(cls => (
                        <SelectItem key={cls} value={cls.toString()}>
                          Class {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <AttendanceCalendarView 
                calendarData={calendarData} 
                selectedDate={selectedDate} 
                onSelectDate={setSelectedDate} 
                selectedMonth={selectedMonth} 
                onMonthChange={setSelectedMonth} 
                isLoading={allAttendanceLoading} 
                onExportPDF={handleCalendarExportPDF} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="focus-visible:outline-none">
          <StudentAttendanceTab 
            students={students.filter(s => s.class === selectedClass)} 
            onStudentSelect={handleStudentSelect} 
            selectedClass={selectedClass} 
            onClassChange={value => setSelectedClass(parseInt(value))} 
          />
        </TabsContent>
      </Tabs>

      {/* Bulk Mark Dialog */}
      <Dialog open={isBulkMarkOpen} onOpenChange={setIsBulkMarkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark All Students</DialogTitle>
            <DialogDescription>
              Set attendance status for all {dayAttendance.length} students in Class {selectedClass}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Select status for all students:</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${bulkStatus === "Present" ? "border-green-500 bg-green-50" : ""}`} onClick={() => setBulkStatus("Present")}>
                  <Check className={`h-6 w-6 mb-1 ${bulkStatus === "Present" ? "text-green-600" : "text-muted-foreground"}`} />
                  <span className={bulkStatus === "Present" ? "text-green-700 font-medium" : ""}>Present</span>
                </div>
                <div className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${bulkStatus === "Absent" ? "border-red-500 bg-red-50" : ""}`} onClick={() => setBulkStatus("Absent")}>
                  <X className={`h-6 w-6 mb-1 ${bulkStatus === "Absent" ? "text-red-600" : "text-muted-foreground"}`} />
                  <span className={bulkStatus === "Absent" ? "text-red-700 font-medium" : ""}>Absent</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${bulkStatus === "Leave" ? "border-amber-500 bg-amber-50" : ""}`} onClick={() => setBulkStatus("Leave")}>
                  <Clock className={`h-6 w-6 mb-1 ${bulkStatus === "Leave" ? "text-amber-600" : "text-muted-foreground"}`} />
                  <span className={bulkStatus === "Leave" ? "text-amber-700 font-medium" : ""}>Leave</span>
                </div>
                <div className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${bulkStatus === "Holiday" ? "border-blue-500 bg-blue-50" : ""}`} onClick={() => setBulkStatus("Holiday")}>
                  <CalendarIcon className={`h-6 w-6 mb-1 ${bulkStatus === "Holiday" ? "text-blue-600" : "text-muted-foreground"}`} />
                  <span className={bulkStatus === "Holiday" ? "text-blue-700 font-medium" : ""}>Holiday</span>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-3 bg-muted/20">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  This will mark <strong>all {dayAttendance.length} students</strong> in Class {selectedClass} as <strong>{bulkStatus}</strong>
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkMarkOpen(false)}>Cancel</Button>
            <Button onClick={markBulkAttendance} className={bulkStatus === "Present" ? "bg-green-600 hover:bg-green-700" : bulkStatus === "Absent" ? "bg-red-600 hover:bg-red-700" : bulkStatus === "Holiday" ? "bg-blue-600 hover:bg-blue-700" : "bg-amber-600 hover:bg-amber-700"}>
              Mark All as {bulkStatus}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save confirmation dialog */}
      <AlertDialog open={confirmSave} onOpenChange={setConfirmSave}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Attendance Records</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to save attendance records for {dayAttendance.length} students in Class {selectedClass}.
              <div className="mt-3 flex items-center justify-between p-2 border rounded bg-muted/20">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></div>
                  <span className="text-sm">Present:</span>
                </div>
                <span className="font-medium">{attendanceStats.presentCount} students</span>
              </div>
              <div className="mt-1 flex items-center justify-between p-2 border rounded bg-muted/20">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></div>
                  <span className="text-sm">Absent:</span>
                </div>
                <span className="font-medium">{attendanceStats.absentCount} students</span>
              </div>
              <div className="mt-1 flex items-center justify-between p-2 border rounded bg-muted/20">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-1.5"></div>
                  <span className="text-sm">Leave:</span>
                </div>
                <span className="font-medium">{attendanceStats.leaveCount} students</span>
              </div>
              {attendanceStats.holidayCount > 0 && <div className="mt-1 flex items-center justify-between p-2 border rounded bg-muted/20">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></div>
                    <span className="text-sm">Holiday:</span>
                  </div>
                  <span className="font-medium">{attendanceStats.holidayCount} students</span>
                </div>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSave} className="bg-green-600 hover:bg-green-700">
              Save Records
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>;
}

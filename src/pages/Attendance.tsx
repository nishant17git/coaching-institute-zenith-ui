import { useState, useEffect, useMemo } from "react";
import { format, isToday, addDays, subDays, isSameDay, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Import icons
import { 
  CalendarIcon, Search, User, Users, Check, X, Clock, FilterX,
  ChevronLeft, ChevronRight, Download, Save, Loader2, AlertCircle, 
  Calendar as CalendarSquareIcon, LayoutGrid, BarChart
} from "lucide-react";

// Import components for attendance page
import { AttendanceSummary } from "@/components/attendance/AttendanceSummary";
import { AttendanceCalendarView } from "@/components/attendance/AttendanceCalendarView";
import { ClassAttendanceTable } from "@/components/attendance/ClassAttendanceTable";
import { MobileAttendanceList } from "@/components/attendance/MobileAttendanceList";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";

interface Student {
  id: string;
  full_name: string;
  class: number;
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
  const [view, setView] = useState<"table" | "calendar" | "stats">("table");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  
  const queryClient = useQueryClient();

  // Data fetching with React Query
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*');

      if (error) throw error;
      return data || [];
    }
  });

  // Monthly attendance records
  const { data: allAttendanceRecords = [], isLoading: allAttendanceLoading } = useQuery({
    queryKey: ['attendance', format(selectedMonth, 'yyyy-MM')],
    queryFn: async () => {
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);

      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'));

      if (error) throw error;
      return data || [];
    }
  });

  // Daily attendance records
  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('date', format(selectedDate, 'yyyy-MM-dd'));

      if (error) throw error;
      return data || [];
    }
  });

  // Mutation to save attendance with optimistic updates
  const saveAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: AttendanceRecord[]) => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Group records by operation type (insert or update)
      const studentIds = attendanceData.map(record => record.student_id);
      
      // Fetch existing records
      const { data: existingRecords } = await supabase
        .from('attendance_records')
        .select('id, student_id')
        .eq('date', dateStr)
        .in('student_id', studentIds);
      
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
        operations.push(
          supabase
            .from('attendance_records')
            .insert(recordsToInsert)
        );
      }
      
      if (recordsToUpdate.length > 0) {
        // Update records one by one to ensure all updates go through
        for (const record of recordsToUpdate) {
          operations.push(
            supabase
              .from('attendance_records')
              .update({ status: record.status })
              .eq('id', record.id)
          );
        }
      }
      
      // Execute all operations
      const results = await Promise.all(operations);
      
      // Check for errors
      for (const result of results) {
        if (result.error) throw result.error;
      }

      // Update attendance percentages
      const studentUpdatePromises = studentIds.map(async (studentId) => {
        // Get student attendance history
        const { data: studentAttendance, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('student_id', studentId);

        if (attendanceError) throw attendanceError;

        if (studentAttendance && studentAttendance.length > 0) {
          // Calculate percentage
          const totalDays = studentAttendance.length;
          const presentDays = studentAttendance.filter(a => a.status === 'Present').length;
          const attendancePercentage = Math.round((presentDays / totalDays) * 100);

          // Update student record
          return supabase
            .from('students')
            .update({ attendance_percentage: attendancePercentage })
            .eq('id', studentId);
        }
        
        return null;
      });

      await Promise.all(studentUpdatePromises.filter(Boolean));
      
      return attendanceData;
    },
    onMutate: async (newAttendance) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['attendance'] });
      
      // Snapshot previous attendance data
      const previousAttendance = queryClient.getQueryData(['attendance', format(selectedDate, 'yyyy-MM-dd')]);
      
      // Optimistically update the UI
      queryClient.setQueryData(['attendance', format(selectedDate, 'yyyy-MM-dd')], newAttendance);
      
      // Return context for rollback
      return { previousAttendance };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
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
        queryClient.setQueryData(
          ['attendance', format(selectedDate, 'yyyy-MM-dd')], 
          context.previousAttendance
        );
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
      filteredStudents = filteredStudents.filter(student => 
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const studentsWithStatus = filteredStudents.map(student => {
      const record = attendanceRecords.find(
        record => record.student_id === student.id && record.date === dateString
      );

      return {
        ...student,
        status: (record?.status as "Present" | "Absent" | "Leave" | "Holiday") || "Absent"
      };
    });

    setDayAttendance(studentsWithStatus);
  }, [selectedDate, selectedClass, searchQuery, students, attendanceRecords]);

  // Prepare calendar data
  useEffect(() => {
    if (!allAttendanceLoading && allAttendanceRecords) {
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      const daysInMonth = monthEnd.getDate();

      const calendarDays = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
        const dateString = format(date, 'yyyy-MM-dd');

        // Get day's attendance
        const dayAttendance = allAttendanceRecords.filter(record => record.date === dateString);

        const presentCount = dayAttendance.filter(record => record.status === 'Present').length;
        const absentCount = dayAttendance.filter(record => record.status === 'Absent').length;
        const leaveCount = dayAttendance.filter(record => record.status === 'Leave').length;

        const totalStudents = presentCount + absentCount + leaveCount;
        const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

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
    setDayAttendance(prev => 
      prev.map(student => 
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => ({
    presentCount: dayAttendance.filter(s => s.status === "Present").length,
    absentCount: dayAttendance.filter(s => s.status === "Absent").length,
    leaveCount: dayAttendance.filter(s => s.status === "Leave").length,
    totalStudents: dayAttendance.length,
    attendancePercentage: dayAttendance.length > 0 
      ? Math.round((dayAttendance.filter(s => s.status === "Present").length / dayAttendance.length) * 100) 
      : 0
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

  // Export attendance report
  const exportAttendanceReport = () => {
    try {
      let csvContent = "Date,Student Name,Class,Status\n";

      dayAttendance.forEach(student => {
        const row = [
          format(selectedDate, 'yyyy-MM-dd'),
          student.full_name,
          `Class ${student.class}`,
          student.status || "Absent"
        ].map(item => `"${item}"`).join(",");

        csvContent += row + "\n";
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_${format(selectedDate, 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Attendance data exported successfully", {
        description: `Exported data for ${format(selectedDate, 'MMMM d, yyyy')}`
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export attendance data");
    }
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
      const record = attendanceRecords.find(
        r => r.student_id === student.id && r.date === dateString
      );
      
      // If record exists but status differs, or record doesn't exist but student has status
      if ((record && record.status !== student.status) || 
          (!record && student.status)) {
        return true;
      }
    }
    
    return false;
  }, [dayAttendance, attendanceRecords, selectedDate]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <EnhancedPageHeader
        title="Attendance Management"
        description={format(selectedDate, 'EEEE, MMMM d, yyyy')}
        showBackButton
        action={
          <div className="flex flex-wrap gap-3">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'MMMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Button 
              className="bg-apple-blue hover:bg-blue-600 text-white" 
              onClick={exportAttendanceReport}
            >
              <Download className="h-4 w-4 mr-2" /> Export Report
            </Button>
          </div>
        }
      />

      {/* View selector tabs */}
      <Tabs 
        value={view} 
        onValueChange={(value) => setView(value as "table" | "calendar" | "stats")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" /> {!isMobile && "Attendance Table"}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarSquareIcon className="h-4 w-4" /> {!isMobile && "Calendar View"}
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" /> {!isMobile && "Statistics"}
          </TabsTrigger>
        </TabsList>

        {/* Main content based on selected view */}
        <TabsContent value="table" className="space-y-4 focus-visible:outline-none">
          {/* Filter controls */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-sm border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 w-full sm:w-auto items-center space-x-2">
                  <Select 
                    value={selectedClass.toString()} 
                    onValueChange={(value) => setSelectedClass(parseInt(value))}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 9 }, (_, i) => i + 2).map((cls) => (
                        <SelectItem key={cls} value={cls.toString()}>
                          Class {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 w-full sm:w-auto relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search student..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 self-end w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto gap-1" 
                    onClick={() => setIsBulkMarkOpen(true)}
                  >
                    <Users className="h-4 w-4" /> 
                    {isMobile ? "Mark All" : "Mark All Students"}
                  </Button>

                  <Button
                    variant={saveAttendanceMutation.isPending ? "outline" : "default"}
                    className="w-full sm:w-auto gap-1 bg-apple-green hover:bg-green-600 text-white"
                    onClick={saveAttendance}
                    disabled={saveAttendanceMutation.isPending || !hasUnsavedChanges}
                  >
                    {saveAttendanceMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main attendance table section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Summary cards section */}
            <div className="lg:col-span-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-3">
              <AttendanceSummary stats={attendanceStats} />
            </div>

            {/* Attendance marking section */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Class {selectedClass} Attendance</CardTitle>
                    <CardDescription>
                      {dayAttendance.length} students | {format(selectedDate, 'EEEE, MMMM d')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {studentsLoading || attendanceLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {isMobile ? (
                      <MobileAttendanceList 
                        students={dayAttendance.map(student => ({
                          id: student.id,
                          name: student.full_name,
                          status: student.status || "Absent"
                        }))}
                        onStatusChange={handleStatusChange}
                      />
                    ) : (
                      <ClassAttendanceTable 
                        students={dayAttendance.map(student => ({
                          id: student.id,
                          name: student.full_name,
                          status: student.status || "Absent"
                        }))} 
                        date={selectedDate}
                        onStatusChange={handleStatusChange}
                        onSaveAttendance={saveAttendance}
                        isSaving={saveAttendanceMutation.isPending}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="focus-visible:outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Calendar</CardTitle>
              <CardDescription>
                View and track attendance records across the month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceCalendarView
                calendarData={calendarData}
                selectedDate={selectedDate} 
                onSelectDate={setSelectedDate}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                isLoading={allAttendanceLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="focus-visible:outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Statistics</CardTitle>
              <CardDescription>
                Detailed attendance analysis and reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Statistics content will be implemented in a future update */}
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <BarChart className="h-12 w-12 text-muted-foreground opacity-50" />
                <div>
                  <h3 className="text-lg font-medium">Advanced Statistics</h3>
                  <p className="text-muted-foreground">
                    Detailed attendance statistics will be available in a future update
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <div 
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${bulkStatus === "Present" ? "border-green-500 bg-green-50" : ""}`}
                  onClick={() => setBulkStatus("Present")}
                >
                  <Check className={`h-6 w-6 mb-1 ${bulkStatus === "Present" ? "text-green-600" : "text-muted-foreground"}`} />
                  <span className={bulkStatus === "Present" ? "text-green-700 font-medium" : ""}>Present</span>
                </div>
                <div 
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${bulkStatus === "Absent" ? "border-red-500 bg-red-50" : ""}`}
                  onClick={() => setBulkStatus("Absent")}
                >
                  <X className={`h-6 w-6 mb-1 ${bulkStatus === "Absent" ? "text-red-600" : "text-muted-foreground"}`} />
                  <span className={bulkStatus === "Absent" ? "text-red-700 font-medium" : ""}>Absent</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div 
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${bulkStatus === "Leave" ? "border-amber-500 bg-amber-50" : ""}`}
                  onClick={() => setBulkStatus("Leave")}
                >
                  <Clock className={`h-6 w-6 mb-1 ${bulkStatus === "Leave" ? "text-amber-600" : "text-muted-foreground"}`} />
                  <span className={bulkStatus === "Leave" ? "text-amber-700 font-medium" : ""}>Leave</span>
                </div>
                <div 
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${bulkStatus === "Holiday" ? "border-blue-500 bg-blue-50" : ""}`}
                  onClick={() => setBulkStatus("Holiday")}
                >
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
            <Button 
              onClick={markBulkAttendance}
              className={
                bulkStatus === "Present" ? "bg-green-600 hover:bg-green-700" :
                bulkStatus === "Absent" ? "bg-red-600 hover:bg-red-700" :
                bulkStatus === "Holiday" ? "bg-blue-600 hover:bg-blue-700" :
                "bg-amber-600 hover:bg-amber-700"
              }
            >
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
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSave}>Save Records</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

import { useState, useEffect } from "react";
import { format, isToday, addDays, subDays, isSameDay, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  CalendarIcon, Search, User, Users, Check, X, Clock, FilterX, ChevronLeft, 
  ChevronRight, Download, Save, Loader2, AlertCircle 
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Import components for attendance page
import { DateSelector } from "@/components/attendance/DateSelector";
import { AttendanceSummary } from "@/components/attendance/AttendanceSummary";
import { AttendanceCalendar } from "@/components/attendance/AttendanceCalendar";
import { AttendanceFilter } from "@/components/attendance/AttendanceFilter";
import { ClassAttendanceTable } from "@/components/attendance/ClassAttendanceTable";

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
  // State management
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [dayAttendance, setDayAttendance] = useState<Student[]>([]);
  const [isBulkMarkOpen, setIsBulkMarkOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<"Present" | "Absent" | "Leave" | "Holiday">("Present");
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<"all" | "class" | "student">("class");
  
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

  // Mutation to save attendance
  const saveAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: AttendanceRecord[]) => {
      // Process each attendance record
      for (const record of attendanceData) {
        const { data: existingRecord } = await supabase
          .from('attendance_records')
          .select('id')
          .eq('student_id', record.student_id)
          .eq('date', record.date)
          .maybeSingle();
        
        if (existingRecord) {
          // Update existing record
          const { error } = await supabase
            .from('attendance_records')
            .update({ status: record.status })
            .eq('id', existingRecord.id);
          
          if (error) throw error;
        } else {
          // Insert new record
          const { error } = await supabase
            .from('attendance_records')
            .insert(record);
          
          if (error) throw error;
        }
      }
      
      // Update attendance percentages
      for (const record of attendanceData) {
        // Get student attendance history
        const { data: studentAttendance, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('student_id', record.student_id);
        
        if (attendanceError) throw attendanceError;
        
        if (studentAttendance && studentAttendance.length > 0) {
          // Calculate percentage
          const totalDays = studentAttendance.length;
          const presentDays = studentAttendance.filter(a => a.status === 'Present').length;
          const attendancePercentage = Math.round((presentDays / totalDays) * 100);
          
          // Update student record
          const { error: updateError } = await supabase
            .from('students')
            .update({ attendance_percentage: attendancePercentage })
            .eq('id', record.student_id);
          
          if (updateError) throw updateError;
        }
      }
      
      return attendanceData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`Attendance saved for ${format(selectedDate, 'MMMM d, yyyy')}`);
    },
    onError: (error: any) => {
      toast.error(`Failed to save attendance: ${error.message}`);
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
  const attendanceStats = {
    presentCount: dayAttendance.filter(s => s.status === "Present").length,
    absentCount: dayAttendance.filter(s => s.status === "Absent").length,
    leaveCount: dayAttendance.filter(s => s.status === "Leave").length,
    totalStudents: dayAttendance.length,
    attendancePercentage: dayAttendance.length > 0 
      ? Math.round((dayAttendance.filter(s => s.status === "Present").length / dayAttendance.length) * 100) 
      : 0
  };

  // Save attendance for the day
  const saveAttendance = () => {
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
    toast.success(`Marked all students as ${bulkStatus}`);
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
      
      toast.success("Attendance data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export attendance data");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
            <CalendarIcon className="mr-2 h-4 w-4" /> Today
          </Button>
          <Button 
            className="bg-apple-blue hover:bg-blue-600 text-white" 
            onClick={exportAttendanceReport}
          >
            <Download className="h-4 w-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="rounded-md border px-3 py-2 h-10 flex items-center justify-center min-w-[140px] bg-white">
                  <span className={isToday(selectedDate) ? "font-semibold text-apple-blue" : ""}>
                    {format(selectedDate, 'MMM d, yyyy')}
                    {isToday(selectedDate) && <span className="ml-2 text-xs bg-apple-blue text-white px-1 py-0.5 rounded">Today</span>}
                  </span>
                </div>
                <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <div className="w-full sm:w-40">
                  <Select 
                    value={selectedClass.toString()} 
                    onValueChange={(value) => setSelectedClass(parseInt(value))}
                  >
                    <SelectTrigger>
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
                
                <div className="relative flex-1 min-w-[200px]">
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
                
                <Button 
                  variant="outline" 
                  onClick={() => setIsBulkMarkOpen(true)}
                >
                  <Users className="h-4 w-4 mr-2" /> Mark All
                </Button>
                
                <Button 
                  variant={saveAttendanceMutation.isPending ? "outline" : "default"}
                  className="bg-apple-green hover:bg-green-600 text-white" 
                  onClick={saveAttendance}
                  disabled={saveAttendanceMutation.isPending}
                >
                  {saveAttendanceMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar and stats section */}
        <div className="lg:col-span-1 grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Calendar</span>
                <DateSelector 
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceCalendar 
                calendarData={calendarData}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            </CardContent>
          </Card>

          <AttendanceSummary stats={attendanceStats} />
        </div>
        
        {/* Attendance table */}
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
          </CardContent>
        </Card>
      </div>

      {/* Bulk Mark Dialog */}
      <Dialog open={isBulkMarkOpen} onOpenChange={setIsBulkMarkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark All Students</DialogTitle>
            <DialogDescription>
              Set attendance status for all {dayAttendance.length} students in Class {selectedClass}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Select status for all students:</h3>
              <div className="grid grid-cols-3 gap-3">
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
                <div 
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${bulkStatus === "Leave" ? "border-amber-500 bg-amber-50" : ""}`}
                  onClick={() => setBulkStatus("Leave")}
                >
                  <Clock className={`h-6 w-6 mb-1 ${bulkStatus === "Leave" ? "text-amber-600" : "text-muted-foreground"}`} />
                  <span className={bulkStatus === "Leave" ? "text-amber-700 font-medium" : ""}>Leave</span>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-3 bg-muted/20">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
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
                "bg-amber-600 hover:bg-amber-700"
              }
            >
              Mark All as {bulkStatus}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

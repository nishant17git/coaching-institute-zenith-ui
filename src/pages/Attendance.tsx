import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, isToday } from "date-fns";
import { 
  ChevronLeft, ChevronRight, Download, Search, Calendar as CalendarIcon, 
  User, Users, Check, X, Clock, AlertCircle, Save, Loader2 
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ClassAttendanceTable } from "@/components/attendance/ClassAttendanceTable";
import { AttendanceSummary } from "@/components/attendance/AttendanceSummary";
import { DateSelector } from "@/components/attendance/DateSelector";
import { motion } from "framer-motion";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<number>(10);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"calendar" | "list" | "student">("calendar");
  const [dayAttendance, setDayAttendance] = useState<Array<{
    id: string;
    name: string;
    status: "Present" | "Absent" | "Leave" | "Holiday";
  }>>([]);

  const queryClient = useQueryClient();
  
  // Fetch students data
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

  // Fetch attendance records
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
    mutationFn: async (attendanceData: any[]) => {
      // For each attendance record, check if it already exists
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
      
      // Update attendance percentages for students
      for (const record of attendanceData) {
        // Get all attendance records for the student
        const { data: studentAttendance, error: attendanceError } = await supabase
          .from('attendance_records')
          .select('*')
          .eq('student_id', record.student_id);
        
        if (attendanceError) throw attendanceError;
        
        if (studentAttendance && studentAttendance.length > 0) {
          // Calculate attendance percentage
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

  // Filter students by selected class, search query, and prepare attendance data
  useEffect(() => {
    // First filter students based on class
    let filteredStudents = students.filter(student => {
      if (selectedStudent) {
        return student.id === selectedStudent;
      }
      
      return student.class === selectedClass;
    });
    
    // Then filter by search query if provided
    if (searchQuery) {
      filteredStudents = filteredStudents.filter(student => 
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Create attendance status for each filtered student
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const studentsWithStatus = filteredStudents.map(student => {
      // Find attendance record for this student on selected date
      const record = attendanceRecords.find(
        record => record.student_id === student.id && record.date === dateString
      );
      
      return {
        id: student.id,
        name: student.full_name,
        // Explicitly cast the status to one of the allowed values, with a default of "Absent"
        status: (record?.status as "Present" | "Absent" | "Leave" | "Holiday") || "Absent"
      };
    });
    
    setDayAttendance(studentsWithStatus);
  }, [selectedDate, selectedClass, selectedStudent, searchQuery, students, attendanceRecords]);

  // Handle status change
  const handleStatusChange = (studentId: string, status: "Present" | "Absent" | "Leave") => {
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
    // First prepare the attendance data
    const attendanceData = dayAttendance.map(student => ({
      student_id: student.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      status: student.status
    }));
    
    // Call the mutation to save attendance
    saveAttendanceMutation.mutate(attendanceData);
  };

  // Export attendance report as CSV
  const exportAttendanceReport = () => {
    try {
      // Create CSV content
      let csvContent = "Date,Student Name,Class,Status\n";
      
      dayAttendance.forEach(entry => {
        const student = students.find(s => s.id === entry.id);
        if (student) {
          const row = [
            format(selectedDate, 'yyyy-MM-dd'),
            student.full_name,
            `Class ${student.class}`,
            entry.status
          ].map(item => `"${item}"`).join(",");
          
          csvContent += row + "\n";
        }
      });
      
      // Create download link
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
      className="space-y-6 animate-slide-up"
    >
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground">Track and manage student attendance efficiently</p>
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
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64">
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
        
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 md:gap-4">
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() - 1)))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="rounded-md border px-3 py-2 h-10 flex items-center justify-center min-w-[140px] bg-white">
            <span className={isToday(selectedDate) ? "font-semibold text-apple-blue" : ""}>
              {format(selectedDate, 'MMMM d, yyyy')}
              {isToday(selectedDate) && <span className="ml-2 text-xs bg-apple-blue text-white px-1 py-0.5 rounded">Today</span>}
            </span>
          </div>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate(new Date())}>
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Summary Cards */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
            <CardDescription>
              {format(selectedDate, "MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="#f0f0f0" 
                  strokeWidth="10" 
                />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke={attendanceStats.attendancePercentage >= 75 ? "#30D158" : "#FF9F0A"} 
                  strokeWidth="10"
                  strokeDasharray={`${2.83 * 45 * (attendanceStats.attendancePercentage/100)} ${2.83 * 45 * (1-attendanceStats.attendancePercentage/100)}`} 
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{attendanceStats.attendancePercentage}%</span>
                <span className="text-xs text-muted-foreground">Present</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-lg bg-green-50">
                <div className="text-lg font-bold text-green-700">{attendanceStats.presentCount}</div>
                <div className="text-xs text-muted-foreground">Present</div>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <div className="text-lg font-bold text-red-700">{attendanceStats.absentCount}</div>
                <div className="text-xs text-muted-foreground">Absent</div>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <div className="text-lg font-bold text-orange-700">{attendanceStats.leaveCount}</div>
                <div className="text-xs text-muted-foreground">Leave</div>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Total Students</span>
                <span>{attendanceStats.totalStudents}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-apple-blue h-2 rounded-full" 
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
            
            <div className="pt-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Students Present</span>
                <span>{attendanceStats.presentCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-apple-green h-2 rounded-full" 
                  style={{ width: `${attendanceStats.attendancePercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Attendance Table */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Class {selectedClass} Attendance</CardTitle>
                <CardDescription>
                  Mark attendance for {dayAttendance.length} students
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
                students={dayAttendance}
                date={selectedDate}
                onStatusChange={handleStatusChange}
                onSaveAttendance={saveAttendance}
                isSaving={saveAttendanceMutation.isPending}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
          <CardDescription>
            View monthly attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border shadow mx-auto"
            classNames={{
              day_selected: "bg-apple-blue text-white hover:bg-blue-600",
              day_today: "bg-muted text-apple-blue font-bold",
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

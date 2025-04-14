
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, isToday, addDays, subDays, isSameDay } from "date-fns";
import { 
  ChevronLeft, ChevronRight, Download, Search, Calendar as CalendarIcon, 
  User, Users, Check, X, Clock, AlertCircle, Save, Loader2, FilterX
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [dayAttendance, setDayAttendance] = useState<Student[]>([]);
  const [isBulkMarkOpen, setIsBulkMarkOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<"Present" | "Absent" | "Leave" | "Holiday">("Present");
  const [calendarData, setCalendarData] = useState<any[]>([]);
  
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

  // Fetch attendance records for the selected month
  const { data: allAttendanceRecords = [], isLoading: allAttendanceLoading } = useQuery({
    queryKey: ['attendance', format(selectedDate, 'yyyy-MM')],
    queryFn: async () => {
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', format(startOfMonth, 'yyyy-MM-dd'))
        .lte('date', format(endOfMonth, 'yyyy-MM-dd'));
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch attendance records for the selected date
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
    let filteredStudents = students.filter(student => student.class === selectedClass);
    
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
        ...student,
        // Set the status, with a default of "Absent"
        status: (record?.status as "Present" | "Absent" | "Leave" | "Holiday") || "Absent"
      };
    });
    
    setDayAttendance(studentsWithStatus);
  }, [selectedDate, selectedClass, searchQuery, students, attendanceRecords]);

  // Prepare calendar data for the month view
  useEffect(() => {
    if (!allAttendanceLoading && allAttendanceRecords) {
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      const daysInMonth = endOfMonth.getDate();
      
      const calendarDays = [];
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
        const dateString = format(date, 'yyyy-MM-dd');
        
        // Get attendance for this day
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
  }, [allAttendanceRecords, selectedDate, allAttendanceLoading]);

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
    // First prepare the attendance data
    const attendanceData = dayAttendance.map(student => ({
      student_id: student.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      status: student.status || "Absent"
    }));
    
    // Call the mutation to save attendance
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

  // Export attendance report as CSV
  const exportAttendanceReport = () => {
    try {
      // Create CSV content
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

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 animate-slide-up"
    >
      {/* Header section with greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-semibold tracking-tight">
            {user?.first_name ? `Welcome, ${user.first_name} Sir` : 'Attendance Management'}
          </h1>
          <p className="text-muted-foreground">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </motion.div>
        
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

      {/* Date navigation and filter controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card md:col-span-2">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
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
              
              <div className="relative flex-1 min-w-0">
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
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                className="flex-1 mr-2"
                onClick={() => setIsBulkMarkOpen(true)}
              >
                <Users className="h-4 w-4 mr-2" /> Mark All
              </Button>
              <Button 
                variant={saveAttendanceMutation.isPending ? "outline" : "default"}
                className="flex-1 ml-2 bg-apple-green hover:bg-green-600 text-white" 
                onClick={saveAttendance}
                disabled={saveAttendanceMutation.isPending}
              >
                {saveAttendanceMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar View */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Attendance Calendar</CardTitle>
            <CardDescription>
              {format(selectedDate, "MMMM yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md"
              classNames={{
                day_selected: "bg-apple-blue text-white hover:bg-blue-600",
                day_today: "bg-muted text-apple-blue font-bold",
              }}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-28 h-28 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
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
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{attendanceStats.attendancePercentage}%</span>
                <span className="text-xs text-muted-foreground">Present</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 w-full">
              <div className="p-2 rounded-lg bg-green-50">
                <div className="text-lg font-bold text-green-700">{attendanceStats.presentCount}</div>
                <div className="text-xs text-muted-foreground">Present</div>
              </div>
              <div className="p-2 rounded-lg bg-red-50">
                <div className="text-lg font-bold text-red-700">{attendanceStats.absentCount}</div>
                <div className="text-xs text-muted-foreground">Absent</div>
              </div>
              <div className="p-2 rounded-lg bg-orange-50">
                <div className="text-lg font-bold text-orange-700">{attendanceStats.leaveCount}</div>
                <div className="text-xs text-muted-foreground">Leave</div>
              </div>
            </div>
          </CardFooter>
        </Card>
        
        {/* Attendance Table */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
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
            ) : dayAttendance.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <motion.tbody
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="divide-y"
                  >
                    {dayAttendance.map((student, index) => (
                      <motion.tr key={student.id} variants={item}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{student.full_name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              student.status === "Present" ? "bg-green-100 text-green-800 border-green-300" :
                              student.status === "Absent" ? "bg-red-100 text-red-800 border-red-300" :
                              student.status === "Leave" ? "bg-amber-100 text-amber-800 border-amber-300" :
                              "bg-gray-100 text-gray-800 border-gray-300"
                            }
                          >
                            {student.status || "Absent"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant={student.status === "Present" ? "default" : "outline"} 
                              size="sm"
                              className={`h-8 ${student.status === "Present" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-100 hover:text-green-700"}`}
                              onClick={() => handleStatusChange(student.id, "Present")}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" /> Present
                            </Button>
                            <Button 
                              variant={student.status === "Absent" ? "default" : "outline"} 
                              size="sm"
                              className={`h-8 ${student.status === "Absent" ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-100 hover:text-red-700"}`}
                              onClick={() => handleStatusChange(student.id, "Absent")}
                            >
                              <X className="h-3.5 w-3.5 mr-1" /> Absent
                            </Button>
                            <Button 
                              variant={student.status === "Leave" ? "default" : "outline"} 
                              size="sm"
                              className={`h-8 ${student.status === "Leave" ? "bg-amber-600 hover:bg-amber-700" : "hover:bg-amber-100 hover:text-amber-700"}`}
                              onClick={() => handleStatusChange(student.id, "Leave")}
                            >
                              <Clock className="h-3.5 w-3.5 mr-1" /> Leave
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border rounded-md">
                {searchQuery ? (
                  <>
                    <FilterX className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No students found matching "{searchQuery}"</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No students found for Class {selectedClass}</p>
                  </>
                )}
              </div>
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

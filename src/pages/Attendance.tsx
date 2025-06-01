
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { AttendanceCalendarView } from "@/components/attendance/AttendanceCalendarView";
import { ClassAttendanceTable } from "@/components/attendance/ClassAttendanceTable";
import { AttendanceSummary } from "@/components/attendance/AttendanceSummary";
import { DateSelector } from "@/components/attendance/DateSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { studentService } from "@/services/studentService";

// Icons
import { Search, Calendar, Users, TrendingUp, UserCheck, UserX } from "lucide-react";

export default function Attendance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"mark" | "calendar" | "summary">("mark");
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Fetch students data
  const {
    data: studentsData = [],
    isLoading: studentsLoading
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase.from('students').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Convert StudentRecord to Student type
  const students = studentsData.map(student => studentService.mapToStudentModel(student));

  // Fetch attendance records for selected date
  const {
    data: attendanceRecords = [],
    isLoading: attendanceLoading
  } = useQuery({
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

  // Calculate statistics
  const totalStudents = students.length;
  const presentToday = attendanceRecords.filter(record => record.status === "Present").length;
  const absentToday = attendanceRecords.filter(record => record.status === "Absent").length;
  const avgAttendance = students.length > 0 
    ? Math.round(students.reduce((sum, student) => sum + (student.attendancePercentage || 0), 0) / students.length)
    : 0;

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: { studentId: string, status: string }[]) => {
      const records = attendanceData.map(item => ({
        student_id: item.studentId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        status: item.status
      }));

      const { error } = await supabase
        .from('attendance_records')
        .upsert(records, {
          onConflict: 'student_id,date',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // Update attendance percentage for each student
      for (const item of attendanceData) {
        // Get all attendance records for this student
        const { data: allRecords } = await supabase
          .from('attendance_records')
          .select('status')
          .eq('student_id', item.studentId);

        if (allRecords && allRecords.length > 0) {
          const totalDays = allRecords.length;
          const presentDays = allRecords.filter(r => r.status === "Present").length;
          const attendancePercentage = Math.round((presentDays / totalDays) * 100);

          await supabase
            .from('students')
            .update({ attendance_percentage: attendancePercentage })
            .eq('id', item.studentId);
        }
      }

      return records;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success("Attendance marked successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to mark attendance: ${error.message}`);
    }
  });

  // Handle bulk attendance marking
  const handleBulkAttendance = (status: "Present" | "Absent") => {
    const filteredStudents = getFilteredStudents();
    const attendanceData = filteredStudents.map(student => ({
      studentId: student.id,
      status: status
    }));
    markAttendanceMutation.mutate(attendanceData);
  };

  // Get filtered students based on search and class filter
  const getFilteredStudents = () => {
    return students.filter(student => {
      const matchesSearch = student.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const classNum = parseInt(student.class.replace("Class ", ""));
      const matchesClass = classFilter === "all" || classNum.toString() === classFilter;
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "present" && attendanceRecords.some(r => r.student_id === student.id && r.status === "Present")) ||
        (statusFilter === "absent" && attendanceRecords.some(r => r.student_id === student.id && r.status === "Absent")) ||
        (statusFilter === "not_marked" && !attendanceRecords.some(r => r.student_id === student.id));
      
      return matchesSearch && matchesClass && matchesStatus;
    }).sort((a, b) => {
      // Sort by class first, then by roll number
      const classA = parseInt(a.class.replace("Class ", ""));
      const classB = parseInt(b.class.replace("Class ", ""));
      if (classA !== classB) {
        return classA - classB;
      }
      return (a.rollNumber || 0) - (b.rollNumber || 0);
    });
  };

  const filteredStudents = getFilteredStudents();
  const isLoading = studentsLoading || attendanceLoading;
  const classes = [...new Set(students.map(student => parseInt(student.class.replace("Class ", ""))))].sort();

  return (
    <div className="space-y-6 animate-fade-in">
      <EnhancedPageHeader 
        title="Attendance" 
        action={
          <DateSelector 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate} 
          />
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
              <UserCheck className="h-4 w-4" /> Present Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentToday}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0}% of total
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-b-4 border-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
              <UserX className="h-4 w-4" /> Absent Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absentToday}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {totalStudents > 0 ? Math.round((absentToday / totalStudents) * 100) : 0}% of total
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b-4 border-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-4 w-4" /> Avg Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAttendance}%</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Overall average</div>
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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="not_marked">Not Marked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="mark" value={activeTab} onValueChange={value => setActiveTab(value as "mark" | "calendar" | "summary")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        
        {/* Mark Attendance Tab */}
        <TabsContent value="mark" className="mt-4">
          <Card className="shadow-sm border-muted">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mark Attendance for {format(selectedDate, 'MMMM dd, yyyy')}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredStudents.length} students • {attendanceRecords.length} marked
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAttendance("Present")}
                  disabled={markAttendanceMutation.isPending}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Mark All Present
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAttendance("Absent")}
                  disabled={markAttendanceMutation.isPending}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Mark All Absent
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <LoadingState />
              ) : filteredStudents.length === 0 ? (
                <EmptyState 
                  icon={<Users className="h-10 w-10 text-muted-foreground" />} 
                  title="No students found" 
                  description="No students match your current filters." 
                />
              ) : (
                <ClassAttendanceTable 
                  students={filteredStudents}
                  attendanceRecords={attendanceRecords}
                  selectedDate={selectedDate}
                  onMarkAttendance={(attendanceData) => markAttendanceMutation.mutate(attendanceData)}
                  isLoading={markAttendanceMutation.isPending}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="mt-4">
          <AttendanceCalendarView 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </TabsContent>
        
        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-4">
          <AttendanceSummary 
            stats={{
              totalStudents,
              presentToday,
              absentToday,
              avgAttendance
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState, Dispatch, SetStateAction } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Users, Save, Search } from "lucide-react";
import { toast } from "sonner";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { DateSelector } from "@/components/ui/date-selector";
import { AttendanceCalendarView } from "@/components/attendance/AttendanceCalendarView";
import { AttendanceSummary } from "@/components/attendance/AttendanceSummary";
import { ClassAttendanceTable } from "@/components/attendance/ClassAttendanceTable";
import { MobileAttendanceList } from "@/components/attendance/MobileAttendanceList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";

// Services and Types
import { studentService } from "@/services/studentService";
import { AttendanceRecord, Student } from "@/types";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<{ [key: string]: string }>({});
  const isMobile = useIsMobile();

  // Fetch students data
  const {
    data: studentsData = [],
    isLoading: studentsLoading,
    error: studentsError
  } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });

  // Convert to Student models for consistent typing
  const students = studentsData.map(student => {
    const mappedStudent = studentService.mapToStudentModel(student);
    // Ensure rollNumber is always defined for attendance components
    return {
      ...mappedStudent,
      rollNumber: mappedStudent.rollNumber || "0",
      status: mappedStudent.status || "Active"
    };
  });

  // Filter students based on selected class and search term
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const classNum = parseInt(student.class.replace("Class ", ""));
    const matchesClass = selectedClass === "all" || classNum.toString() === selectedClass;
    
    return matchesSearch && matchesClass;
  });

  // Fetch attendance records for the selected date
  const { refetch: refetchAttendance } = useQuery({
    queryKey: ['attendance', selectedDate],
    queryFn: async () => {
      // Fetch attendance records for each student
      const initialAttendance: { [key: string]: string } = {};
      for (const student of students) {
        const attendance = await studentService.getStudentAttendance(student.id);
        const record = attendance.find(record => record.date === selectedDate.toISOString().split('T')[0]);
        initialAttendance[student.id] = record ? record.status : "Absent";
      }
      setAttendanceRecords(initialAttendance);
      return initialAttendance;
    },
    enabled: !studentsLoading && students.length > 0,
    onSuccess: (data) => {
      setAttendanceRecords(data);
    }
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async () => {
      const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        date: selectedDate.toISOString().split('T')[0],
        status
      }));
      await studentService.markAttendance(records);
    },
    onSuccess: () => {
      toast.success("Attendance marked successfully");
      refetchAttendance();
    },
    onError: (error: any) => {
      toast.error(`Failed to mark attendance: ${error.message}`);
    }
  });

  // Handle attendance change
  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Handle save attendance
  const handleSaveAttendance = async () => {
    markAttendanceMutation.mutate();
  };

  if (studentsError) {
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
      <EnhancedPageHeader title="Attendance Management" />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Students Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-4 border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Students</span>
                <div className="text-2xl font-bold">{students.length}</div>
              </div>
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Present Students Card */}
        <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Present Today</span>
                <div className="text-2xl font-bold">{Object.values(attendanceRecords).filter(status => status === "Present").length}</div>
              </div>
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        {/* Absent Students Card */}
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-b-4 border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Absent Today</span>
                <div className="text-2xl font-bold">{Object.values(attendanceRecords).filter(status => status === "Absent").length}</div>
              </div>
              <Users className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        {/* Leave Students Card */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b-4 border-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between space-x-2">
              <div>
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">On Leave Today</span>
                <div className="text-2xl font-bold">{Object.values(attendanceRecords).filter(status => status === "Leave").length}</div>
              </div>
              <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date and Class Selection */}
      <div className="bg-background/60 backdrop-blur-sm p-5 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Date:</span>
            <DateSelector 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search students..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="pl-10 h-11 text-base" 
              />
            </div>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {[...new Set(students.map(s => parseInt(s.class.replace("Class ", ""))))].sort().map(classNum => (
                  <SelectItem key={classNum} value={classNum.toString()}>Class {classNum}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="mark" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="space-y-4">
          {studentsLoading ? (
            <Card>
              <CardContent className="p-6">
                <LoadingState />
              </CardContent>
            </Card>
          ) : filteredStudents.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <EmptyState 
                  icon={<Users className="h-10 w-10 text-muted-foreground" />} 
                  title="No students found" 
                  description="No students match your current filters." 
                />
              </CardContent>
            </Card>
          ) : (
            <>
              {isMobile ? (
                <MobileAttendanceList 
                  students={filteredStudents} 
                  attendanceRecords={attendanceRecords}
                  onAttendanceChange={handleAttendanceChange}
                  isLoading={markAttendanceMutation.isPending}
                />
              ) : (
                <ClassAttendanceTable 
                  students={filteredStudents}
                  attendanceRecords={attendanceRecords}
                  onAttendanceChange={handleAttendanceChange}
                  isLoading={markAttendanceMutation.isPending}
                />
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <AttendanceSummary 
                  stats={{
                    presentCount: Object.values(attendanceRecords).filter(status => status === "Present").length,
                    absentCount: Object.values(attendanceRecords).filter(status => status === "Absent").length,
                    leaveCount: Object.values(attendanceRecords).filter(status => status === "Leave").length,
                    totalStudents: filteredStudents.length,
                    attendancePercentage: filteredStudents.length > 0 
                      ? Math.round((Object.values(attendanceRecords).filter(status => status === "Present").length / filteredStudents.length) * 100)
                      : 0
                  }}
                />
                
                <Button 
                  onClick={handleSaveAttendance}
                  disabled={markAttendanceMutation.isPending || Object.keys(attendanceRecords).length === 0}
                  size="lg"
                >
                  {markAttendanceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Attendance
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <AttendanceCalendarView 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Users, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { DateSelector } from "@/components/ui/date-selector";
import { AttendanceCalendarView } from "@/components/ui/attendance-calendar-view";
import { AttendanceSummary } from "@/components/ui/attendance-summary";
import { useIsMobile } from "@/hooks/use-mobile";

// Services and Types
import { studentService } from "@/services/studentService";
import { attendanceService } from "@/services/attendanceService";
import { Student, AttendanceRecord } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classFilter, setClassFilter] = useState("all");
  const [attendanceRecords, setAttendanceRecords] = useState<{ [studentId: string]: string }>({});
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

  // Map students to include attendance status
  const students = studentsData.map(record => {
    const mappedStudent = studentService.mapToStudentModel(record);
    return {
      ...mappedStudent,
      rollNumber: mappedStudent.rollNumber || "0",
      studentStatus: mappedStudent.studentStatus || "Active",
      status: "Present" as "Present" | "Absent" | "Leave" | "Holiday" // Add default attendance status
    };
  });

  // Fetch attendance records for the selected date
  const { refetch: refetchAttendance } = useQuery({
    queryKey: ['attendance', selectedDate],
    queryFn: async () => {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const records = await attendanceService.getAttendanceByDate(formattedDate);
      
      // Convert attendance records to a dictionary for easy lookup
      const attendanceMap: { [studentId: string]: string } = {};
      records.forEach(record => {
        attendanceMap[record.studentId] = record.status;
      });
      setAttendanceRecords(attendanceMap);
      return records;
    },
    onSuccess: () => {
      // Invalidate the students query to refresh the student list with updated attendance
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    enabled: !!selectedDate // Only fetch when a date is selected
  });

  // Mutation to mark attendance
  const markAttendanceMutation = useMutation({
    mutationFn: attendanceService.markAttendance,
    onSuccess: () => {
      toast.success("Attendance marked successfully");
      refetchAttendance(); // Refresh attendance records after marking
    },
    onError: (error: any) => {
      toast.error(`Failed to mark attendance: ${error.message}`);
    }
  });

  // Handle attendance status change
  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
  };

  // Handle saving attendance records
  const handleSaveAttendance = async () => {
    const recordsToSave = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      studentId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      status
    }));
    
    markAttendanceMutation.mutate(recordsToSave);
  };

  // Get unique classes for filter
  const classes = [...new Set(students.map(student => parseInt(student.class.replace("Class ", ""))))].sort();

  // Calculate attendance statistics
  const presentCount = Object.values(attendanceRecords).filter(status => status === "Present").length;
  const absentCount = Object.values(attendanceRecords).filter(status => status === "Absent").length;
  const leaveCount = Object.values(attendanceRecords).filter(status => status === "Leave").length;
  const totalStudents = students.length;
  const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // Filter students by class for table view
  const studentsForTable = classFilter === "all" 
    ? students.map(student => ({ ...student, status: attendanceRecords[student.id] || "Present" }))
    : students
        .filter(student => parseInt(student.class.replace("Class ", "")) === parseInt(classFilter))
        .map(student => ({ ...student, status: attendanceRecords[student.id] || "Present" }));

  // Filter students by class for card view  
  const studentsForCards = classFilter === "all"
    ? students.map(student => ({ ...student, status: attendanceRecords[student.id] || "Present" }))
    : students
        .filter(student => parseInt(student.class.replace("Class ", "")) === parseInt(classFilter))
        .map(student => ({ ...student, status: attendanceRecords[student.id] || "Present" }));

  const stats = {
    presentCount,
    absentCount,
    leaveCount,
    totalStudents,
    attendancePercentage
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <EnhancedPageHeader 
        title="Attendance" 
        action={
          <Button 
            onClick={handleSaveAttendance}
            disabled={markAttendanceMutation.isLoading}
            className="bg-black hover:bg-black/80"
          >
            {markAttendanceMutation.isLoading ? "Saving..." : "Save Attendance"}
          </Button>
        } 
      />

      {/* Statistics Cards */}
      <AttendanceSummary stats={stats} />

      {/* Date Selector and Filters */}
      <div className="bg-background/60 backdrop-blur-sm p-5 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <DateSelector 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate}
          />

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
          </div>
        </div>
      </div>

      {/* Attendance Table/Cards */}
      <Card className="shadow-sm border-muted">
        <CardContent className="p-4">
          {isLoading ? (
            <LoadingState />
          ) : studentsForTable.length === 0 ? (
            <EmptyState 
              icon={<Users className="h-10 w-10 text-muted-foreground" />} 
              title="No students found" 
              description="No students found for the selected class. Try selecting a different class or add students first." 
            />
          ) : (
            <>
              {/* Calendar View Toggle */}
              <AttendanceCalendarView 
                selectedDate={selectedDate} 
                onDateChange={setSelectedDate}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {studentsForCards.map(student => (
                  <Card key={student.id} className="shadow-sm border-muted">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{student.name}</CardTitle>
                      <Badge variant="secondary">Class {student.class}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium">
                            {format(selectedDate, 'PPP')}
                          </span>
                        </div>
                        <Select 
                          value={student.status} 
                          onValueChange={(status) => handleAttendanceChange(student.id, status)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Present">Present</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                            <SelectItem value="Leave">Leave</SelectItem>
                            <SelectItem value="Holiday">Holiday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Attendance Summary */}
    </div>
  );
}

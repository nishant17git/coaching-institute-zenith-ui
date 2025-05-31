
import React, { useState } from "react";
import { Calendar, Users, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { AttendanceStatCard } from "@/components/attendance/AttendanceStatCard";
import { ClassAttendanceTable } from "@/components/attendance/ClassAttendanceTable";
import { AttendanceCalendarView } from "@/components/attendance/AttendanceCalendarView";
import { MobileAttendanceList } from "@/components/attendance/MobileAttendanceList";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNewData } from "@/contexts/NewDataContext";
import { toast } from "sonner";
import { newStudentService } from "@/services/newStudentService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type AttendanceStatus = "Present" | "Absent" | "Late" | "Half Day" | "Holiday";
type ViewMode = "daily" | "weekly" | "calendar";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});

  const { students, classes, isLoading } = useNewData();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Filter students by selected class
  const filteredStudents = students.filter(student => 
    selectedClass === "all" || student.class.includes(selectedClass.replace("Class ", ""))
  );

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async (attendanceRecords: any[]) => {
      return await newStudentService.markAttendance(attendanceRecords);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success("Attendance marked successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to mark attendance");
    }
  });

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = () => {
    const records = Object.entries(attendanceData).map(([studentId, status]) => ({
      student_id: studentId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      status: status,
      marked_by: 'Current User' // This should come from auth context
    }));

    if (records.length === 0) {
      toast.error("Please mark attendance for at least one student");
      return;
    }

    markAttendanceMutation.mutate(records);
  };

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    if (viewMode === 'daily') {
      setSelectedDate(direction === 'next' ? addDays(selectedDate, 1) : subDays(selectedDate, 1));
    } else if (viewMode === 'weekly') {
      setSelectedDate(direction === 'next' ? addDays(selectedDate, 7) : subDays(selectedDate, 7));
    }
  };

  const getDateRange = () => {
    if (viewMode === 'daily') {
      return format(selectedDate, 'EEEE, MMMM d, yyyy');
    } else if (viewMode === 'weekly') {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    return format(selectedDate, 'MMMM yyyy');
  };

  // Calculate attendance statistics
  const attendanceStats = React.useMemo(() => {
    const totalStudents = filteredStudents.length;
    const presentCount = Object.values(attendanceData).filter(status => status === "Present").length;
    const absentCount = Object.values(attendanceData).filter(status => status === "Absent").length;
    const lateCount = Object.values(attendanceData).filter(status => status === "Late").length;
    const halfDayCount = Object.values(attendanceData).filter(status => status === "Half Day").length;

    return {
      total: totalStudents,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      halfDay: halfDayCount,
      percentage: totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0
    };
  }, [filteredStudents, attendanceData]);

  const weekDays = viewMode === 'weekly' ? eachDayOfInterval({
    start: startOfWeek(selectedDate),
    end: endOfWeek(selectedDate)
  }) : [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-spotify">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">Track and manage student attendance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily View</SelectItem>
              <SelectItem value="weekly">Weekly View</SelectItem>
              <SelectItem value="calendar">Calendar View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Navigation */}
      {viewMode !== 'calendar' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateNavigation('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{getDateRange()}</span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateNavigation('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.name}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Attendance Stats */}
      {viewMode === 'daily' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AttendanceStatCard
            label="Total Students"
            value={attendanceStats.total}
            icon={<Users className="h-4 w-4" />}
            variant="default"
          />
          <AttendanceStatCard
            label="Present"
            value={attendanceStats.present}
            icon={<CheckCircle className="h-4 w-4" />}
            variant="success"
          />
          <AttendanceStatCard
            label="Absent"
            value={attendanceStats.absent}
            icon={<XCircle className="h-4 w-4" />}
            variant="destructive"
          />
          <AttendanceStatCard
            label="Late/Half Day"
            value={attendanceStats.late + attendanceStats.halfDay}
            icon={<Clock className="h-4 w-4" />}
            variant="warning"
          />
        </div>
      )}

      {/* Attendance Content */}
      {viewMode === 'daily' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Daily Attendance</CardTitle>
              <CardDescription>
                Mark attendance for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </div>
            <Button 
              onClick={handleSaveAttendance}
              disabled={markAttendanceMutation.isPending || Object.keys(attendanceData).length === 0}
            >
              {markAttendanceMutation.isPending ? "Saving..." : "Save Attendance"}
            </Button>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              <MobileAttendanceList
                students={filteredStudents}
                attendanceData={attendanceData}
                onAttendanceChange={handleAttendanceChange}
              />
            ) : (
              <ClassAttendanceTable
                students={filteredStudents}
                attendanceData={attendanceData}
                onAttendanceChange={handleAttendanceChange}
              />
            )}
          </CardContent>
        </Card>
      )}

      {viewMode === 'weekly' && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Overview</CardTitle>
            <CardDescription>Attendance summary for the selected week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium min-w-[100px]">
                      {format(day, 'EEE, MMM d')}
                    </div>
                    <Badge variant={day.getDay() === 0 ? "secondary" : "outline"}>
                      {day.getDay() === 0 ? "Holiday" : "School Day"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600">
                      Present: {Math.floor(Math.random() * filteredStudents.length * 0.8 + filteredStudents.length * 0.1)}
                    </Badge>
                    <Badge variant="outline" className="text-red-600">
                      Absent: {Math.floor(Math.random() * filteredStudents.length * 0.2)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'calendar' && (
        <AttendanceCalendarView
          students={filteredStudents}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          classes={classes}
        />
      )}
    </div>
  );
}

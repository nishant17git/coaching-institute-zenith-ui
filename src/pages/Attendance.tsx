
import { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ChevronLeft, ChevronRight, Download, Search, Calendar as CalendarIcon, 
  User, Users, Check, X, Clock, AlertCircle, Info 
} from "lucide-react";
import { toast } from "sonner";
import { format, getDaysInMonth, addDays, subDays, startOfMonth, endOfMonth, getDay, addMonths } from "date-fns";
import { useData } from "@/contexts/DataContext";
import { AttendanceCalendar } from "@/components/attendance/AttendanceCalendar";
import { DateSelector } from "@/components/attendance/DateSelector";
import { AttendanceSummary } from "@/components/attendance/AttendanceSummary";
import { AttendanceFilter } from "@/components/attendance/AttendanceFilter";
import { ClassAttendanceTable } from "@/components/attendance/ClassAttendanceTable";
import { motion } from "framer-motion";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"calendar" | "list" | "student">("calendar");
  const [filterType, setFilterType] = useState<"all" | "class" | "student">("class");
  const [dayAttendance, setDayAttendance] = useState<Array<{
    id: string;
    name: string;
    status: "Present" | "Absent" | "Leave" | "Holiday";
  }>>([]);

  const { students, attendanceRecords, classes } = useData();

  // Handle class selection change
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    setSelectedStudent(null);
  };

  // Handle student selection change
  const handleStudentChange = (value: string | null) => {
    setSelectedStudent(value);
  };

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Handle month change for calendar view
  const handleMonthChange = (date: Date | undefined) => {
    if (date) {
      setSelectedMonth(date);
    }
  };

  // Get attendance records for the selected date and filter
  useEffect(() => {
    const dateString = selectedDate?.toISOString().split('T')[0];
    let filteredStudents = students;
    
    if (filterType === "class") {
      filteredStudents = students.filter(student => student.class === selectedClass);
    } else if (filterType === "student" && selectedStudent) {
      filteredStudents = students.filter(student => student.id === selectedStudent);
    }
    
    // Filter by search query if provided
    if (searchQuery) {
      filteredStudents = filteredStudents.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Create attendance status for each student
    const studentsWithStatus = filteredStudents.map(student => {
      // Find attendance record for this student on selected date
      const record = attendanceRecords.find(
        record => record.studentId === student.id && record.date === dateString
      );
      
      return {
        id: student.id,
        name: student.name,
        status: record?.status || "Absent",
      };
    });
    
    setDayAttendance(studentsWithStatus);
  }, [selectedDate, selectedClass, selectedStudent, filterType, searchQuery, students, attendanceRecords]);

  // Handle status change
  const handleStatusChange = (studentId: string, status: "Present" | "Absent" | "Leave") => {
    setDayAttendance(prev => 
      prev.map(student => 
        student.id === studentId ? { ...student, status } : student
      )
    );
    toast.success(`${status} marked for ${students.find(s => s.id === studentId)?.name || 'Student'}`);
  };

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const presentCount = dayAttendance.filter(s => s.status === "Present").length;
    const absentCount = dayAttendance.filter(s => s.status === "Absent").length;
    const leaveCount = dayAttendance.filter(s => s.status === "Leave").length;
    const totalStudents = dayAttendance.length;
    const attendancePercentage = totalStudents > 0 
      ? Math.round((presentCount / totalStudents) * 100) 
      : 0;
      
    return {
      presentCount,
      absentCount,
      leaveCount,
      totalStudents,
      attendancePercentage
    };
  }, [dayAttendance]);

  // Save attendance for the day
  const saveAttendance = () => {
    // In a real application, this would send the data to the server
    toast.success(`Attendance saved for ${format(selectedDate, 'MMMM d, yyyy')}`);
  };

  // Export attendance report
  const exportAttendanceReport = () => {
    toast.success("Attendance report exported successfully!");
  };

  // Prepare calendar data
  const calendarData = useMemo(() => {
    const today = new Date();
    const data = [];
    
    // Create a grid for the entire month
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const startDay = getDay(monthStart);
    
    // Get total days in the month
    const daysInMonth = getDaysInMonth(selectedMonth);
    
    // Generate calendar data
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), i);
      data.push({
        date,
        dayOfMonth: i,
        isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
        // Simulate attendance data - in a real app this would come from the backend
        stats: {
          present: Math.floor(Math.random() * 30) + 10,
          absent: Math.floor(Math.random() * 10),
          leave: Math.floor(Math.random() * 5),
        }
      });
    }
    
    return data;
  }, [selectedMonth]);

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
      <AttendanceFilter
        filterType={filterType}
        setFilterType={setFilterType as any}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent as any}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        classes={classes}
        students={students}
      />

      {/* Main content tabs */}
      <Tabs value={view} onValueChange={(v) => setView(v as any)} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" /> Calendar View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> List View
          </TabsTrigger>
          <TabsTrigger value="student" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Student View
          </TabsTrigger>
        </TabsList>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Summary Cards */}
            <AttendanceSummary stats={attendanceStats} />
            
            {/* Main Calendar */}
            <Card className="lg:col-span-3 overflow-hidden glass-card">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <CardTitle>Attendance Calendar</CardTitle>
                  <DateSelector 
                    selectedMonth={selectedMonth} 
                    setSelectedMonth={setSelectedMonth}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <AttendanceCalendar
                  calendarData={calendarData}
                  selectedDate={selectedDate}
                  onSelectDate={handleDateChange}
                  selectedMonth={selectedMonth}
                  onMonthChange={handleMonthChange}
                />
              </CardContent>
            </Card>
          </div>

          {/* Daily Attendance Marking */}
          <Card className="glass-card">
            <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between">
              <div>
                <CardTitle>
                  {format(selectedDate, "MMMM d, yyyy")} - {selectedClass} Attendance
                </CardTitle>
                <CardDescription>
                  Mark attendance for {dayAttendance.length} students
                </CardDescription>
              </div>
              <Button onClick={saveAttendance} className="mt-4 sm:mt-0 bg-apple-green hover:bg-green-600">
                <Check className="mr-2 h-4 w-4" /> Save Attendance
              </Button>
            </CardHeader>
            <CardContent>
              <ClassAttendanceTable 
                students={dayAttendance}
                onStatusChange={handleStatusChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Student Attendance List</CardTitle>
              <CardDescription>
                View and manage attendance for {selectedClass}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Overall Attendance</TableHead>
                      <TableHead>Status Today</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dayAttendance.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{selectedClass}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-apple-blue h-2.5 rounded-full" 
                                style={{ width: `${Math.round(Math.random() * 30) + 70}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{Math.round(Math.random() * 30) + 70}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              student.status === "Present" ? "bg-green-100 text-green-800 border-green-300" :
                              student.status === "Absent" ? "bg-red-100 text-red-800 border-red-300" :
                              student.status === "Leave" ? "bg-amber-100 text-amber-800 border-amber-300" :
                              "bg-gray-100 text-gray-800 border-gray-300"
                            }
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              onClick={() => handleStatusChange(student.id, "Present")}
                            >
                              <Check className="h-3 w-3 mr-1" /> Present
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              onClick={() => handleStatusChange(student.id, "Absent")}
                            >
                              <X className="h-3 w-3 mr-1" /> Absent
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                              onClick={() => handleStatusChange(student.id, "Leave")}
                            >
                              <Clock className="h-3 w-3 mr-1" /> Leave
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student View */}
        <TabsContent value="student" className="space-y-6">
          {selectedStudent ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card md:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {students.find(s => s.id === selectedStudent)?.name} - Monthly Attendance
                  </CardTitle>
                  <CardDescription>
                    {format(selectedMonth, "MMMM yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border shadow"
                    classNames={{
                      day_selected: "bg-apple-blue text-white hover:bg-blue-600",
                      day_today: "bg-muted text-apple-blue font-bold",
                    }}
                  />
                  
                  <div className="flex mt-6 gap-4 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-apple-green"></div>
                      <span className="text-sm">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-apple-red"></div>
                      <span className="text-sm">Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-apple-orange"></div>
                      <span className="text-sm">Leave</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-apple-gray"></div>
                      <span className="text-sm">Holiday</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Attendance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Student's Monthly Stats */}
                  <div className="relative w-40 h-40 mx-auto">
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
                        stroke="#30D158" 
                        strokeWidth="10"
                        strokeDasharray={`${2.83 * 45 * 0.85} ${2.83 * 45 * 0.15}`} 
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">85%</span>
                      <span className="text-xs text-muted-foreground">Present</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-lg bg-green-50">
                      <div className="text-lg font-bold text-green-700">17</div>
                      <div className="text-xs text-muted-foreground">Present</div>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50">
                      <div className="text-lg font-bold text-red-700">2</div>
                      <div className="text-xs text-muted-foreground">Absent</div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-50">
                      <div className="text-lg font-bold text-orange-700">1</div>
                      <div className="text-xs text-muted-foreground">Leave</div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="text-sm font-medium mb-1">Total School Days</div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-apple-blue h-2.5 rounded-full" 
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium">20</span>
                    </div>
                  </div>
                  
                  <div className="pt-1">
                    <div className="text-sm font-medium mb-1">Days Present</div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-apple-green h-2.5 rounded-full" 
                          style={{ width: "85%" }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium">17</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Attendance History */}
              <Card className="glass-card md:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Attendance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Day</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Remarks</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: 10 }).map((_, i) => {
                          const date = subDays(new Date(), i);
                          const statuses = ["Present", "Present", "Present", "Absent", "Leave"];
                          const status = statuses[Math.floor(Math.random() * (i > 4 ? 3 : 5))];
                          return (
                            <TableRow key={i}>
                              <TableCell>{format(date, "MMM dd, yyyy")}</TableCell>
                              <TableCell>{format(date, "EEEE")}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    status === "Present" ? "bg-green-50 text-green-700 border-green-200" :
                                    status === "Absent" ? "bg-red-50 text-red-700 border-red-200" :
                                    "bg-amber-50 text-amber-700 border-amber-200"
                                  }
                                >
                                  {status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {status === "Leave" ? "Medical leave" : 
                                 status === "Absent" ? "No notification" : ""}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <Info className="h-4 w-4 mr-2" /> Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Student Selected</h3>
              <p className="text-muted-foreground mb-4">
                Please select a student from the filters above to view their attendance details.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setFilterType("student")}
              >
                Select a Student
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}


import { useState, useEffect, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Download, Search, Calendar as CalendarIcon, User, Users } from "lucide-react";
import { format, subDays, addDays } from "date-fns";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { exportAttendanceToPDF } from "@/services/pdfService";
import html2canvas from "html2canvas";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Logo placeholder
const INSTITUTE_LOGO = "https://placehold.co/200x200/4F46E5/FFFFFF?text=IC";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
  const attendanceChartRef = useRef<HTMLDivElement>(null);

  // Get student-specific attendance for the current month
  const getStudentMonthlyAttendance = () => {
    if (!selectedStudent) return [];
    
    const currentDate = new Date(selectedDate);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return record.studentId === selectedStudent && 
             recordDate.getMonth() === currentMonth &&
             recordDate.getFullYear() === currentYear;
    });
  };

  const studentMonthlyAttendance = getStudentMonthlyAttendance();
  
  // Calculate student attendance stats
  const calculateStudentStats = () => {
    const totalDays = studentMonthlyAttendance.length;
    const presentDays = studentMonthlyAttendance.filter(record => record.status === "Present").length;
    const absentDays = studentMonthlyAttendance.filter(record => record.status === "Absent").length;
    const leaveDays = studentMonthlyAttendance.filter(record => record.status === "Leave").length;
    const presentPercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    return {
      totalDays,
      presentDays,
      absentDays,
      leaveDays,
      presentPercentage
    };
  };
  
  const studentStats = calculateStudentStats();
  
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

  // Calculate attendance statistics
  const presentCount = dayAttendance.filter(s => s.status === "Present").length;
  const absentCount = dayAttendance.filter(s => s.status === "Absent").length;
  const leaveCount = dayAttendance.filter(s => s.status === "Leave").length;
  const totalStudents = dayAttendance.length;
  const attendancePercentage = totalStudents > 0 
    ? Math.round((presentCount / totalStudents) * 100) 
    : 0;

  // For pie chart
  const statusData = [
    { name: "Present", value: presentCount, color: "#30D158" },
    { name: "Absent", value: absentCount, color: "#FF453A" },
    { name: "Leave", value: leaveCount, color: "#FF9F0A" }
  ];

  // Navigate between dates
  const prevDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };
  
  const nextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };
  
  const today = () => {
    setSelectedDate(new Date());
  };

  // Find selected student details
  const selectedStudentDetails = selectedStudent 
    ? students.find(student => student.id === selectedStudent) 
    : null;

  // Export attendance report
  const exportAttendanceReport = async () => {
    // Determine title and data based on filter
    let title = "Attendance Report";
    let classStudents = [];
    
    if (filterType === "class") {
      title = `${selectedClass} Attendance Report`;
      classStudents = students.filter(student => student.class === selectedClass);
    } else if (filterType === "student" && selectedStudentDetails) {
      title = `${selectedStudentDetails.name} Attendance Report`;
      classStudents = [selectedStudentDetails];
    } else {
      title = "All Students Attendance Report";
      classStudents = students;
    }
    
    // Get all attendance records for these students
    const studentIds = classStudents.map(s => s.id);
    const records = attendanceRecords.filter(record => studentIds.includes(record.studentId));
    
    // Generate chart image if available
    let chartImages: string[] = [];
    if (attendanceChartRef.current) {
      try {
        const canvas = await html2canvas(attendanceChartRef.current);
        chartImages.push(canvas.toDataURL('image/png'));
      } catch (error) {
        console.error('Failed to capture chart:', error);
      }
    }
    
    // Summary data
    const summary = [
      { label: 'Date', value: format(selectedDate, 'EEEE, d MMMM yyyy') },
      { label: 'Total Students', value: classStudents.length.toString() },
      { label: 'Present', value: presentCount.toString() },
      { label: 'Absent', value: absentCount.toString() },
      { label: 'Attendance', value: `${attendancePercentage}%` }
    ];
    
    // Export to PDF
    exportAttendanceToPDF(
      records,
      { 
        ...classStudents[0], 
        name: filterType === "student" ? selectedStudentDetails?.name || "" : selectedClass, 
        attendancePercentage 
      },
      title,
      `Attendance Report for ${format(selectedDate, 'd MMMM yyyy')}`,
      INSTITUTE_LOGO,
      chartImages
    );
    
    toast.success("Attendance report exported successfully!");
  };
  
  // Handle status change
  const handleStatusChange = (studentId: string, status: "Present" | "Absent" | "Leave") => {
    // In a real app, this would update the database
    // For now, we'll just show a toast
    toast.success(`Status updated to ${status}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={today}>Today</Button>
          <Button 
            className="bg-apple-blue hover:bg-blue-600 text-white" 
            onClick={exportAttendanceReport}
          >
            <Download className="h-4 w-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      {/* Filter controls */}
      <Card className="glass-card border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Tabs value={filterType} onValueChange={(value) => setFilterType(value as "all" | "class" | "student")}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> All
                  </TabsTrigger>
                  <TabsTrigger value="class" className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> Class
                  </TabsTrigger>
                  <TabsTrigger value="student" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Student
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex-1">
              {filterType === "class" && (
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {filterType === "student" && (
                <Select value={selectedStudent || ""} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {filterType === "all" && (
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 self-end">
              <Button variant="outline" size="icon" onClick={prevDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm font-medium min-w-[100px] text-center">
                {format(selectedDate, "d MMM yyyy")}
              </p>
              <Button variant="outline" size="icon" onClick={nextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filterType === "student" && selectedStudent ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card col-span-2">
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>{selectedStudentDetails?.name} - Attendance</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {format(selectedDate, "MMMM yyyy")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border shadow"
                modifiers={{
                  present: studentMonthlyAttendance
                    .filter(record => record.status === "Present")
                    .map(record => new Date(record.date)),
                  absent: studentMonthlyAttendance
                    .filter(record => record.status === "Absent")
                    .map(record => new Date(record.date)),
                  leave: studentMonthlyAttendance
                    .filter(record => record.status === "Leave")
                    .map(record => new Date(record.date))
                }}
                modifiersClassNames={{
                  present: "bg-green-100 text-green-800 hover:bg-green-200",
                  absent: "bg-red-100 text-red-800 hover:bg-red-200",
                  leave: "bg-orange-100 text-orange-800 hover:bg-orange-200"
                }}
              />
              
              <div className="flex mt-4 gap-3 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm">Leave</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center items-center" ref={attendanceChartRef}>
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Present", value: studentStats.presentDays, color: "#30D158" },
                          { name: "Absent", value: studentStats.absentDays, color: "#FF453A" },
                          { name: "Leave", value: studentStats.leaveDays, color: "#FF9F0A" }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[0, 1, 2].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={["#30D158", "#FF453A", "#FF9F0A"][index]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{studentStats.presentPercentage}%</span>
                    <span className="text-xs text-muted-foreground">Present</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-lg bg-green-50">
                  <div className="text-lg font-bold text-green-700">{studentStats.presentDays}</div>
                  <div className="text-xs text-muted-foreground">Present</div>
                </div>
                <div className="p-3 rounded-lg bg-red-50">
                  <div className="text-lg font-bold text-red-700">{studentStats.absentDays}</div>
                  <div className="text-xs text-muted-foreground">Absent</div>
                </div>
                <div className="p-3 rounded-lg bg-orange-50">
                  <div className="text-lg font-bold text-orange-700">{studentStats.leaveDays}</div>
                  <div className="text-xs text-muted-foreground">Leave</div>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="text-sm font-medium mb-1">Total School Days</div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">{studentStats.totalDays}</span>
                </div>
              </div>
              
              <div className="pt-1">
                <div className="text-sm font-medium mb-1">Days Present</div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${studentStats.presentPercentage}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">{studentStats.presentDays}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{format(selectedDate, "EEEE, d MMMM yyyy")}</h3>
              </div>
              
              <div className="flex mb-4">
                <div ref={attendanceChartRef} className="flex-1 flex justify-center">
                  <div className="relative w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={32}
                          outerRadius={48}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{attendancePercentage}%</span>
                      <span className="text-xs text-muted-foreground">Present</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-green-700">{presentCount}</div>
                    <div className="text-xs text-muted-foreground">Present</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-red-700">{absentCount}</div>
                    <div className="text-xs text-muted-foreground">Absent</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-orange-700">{leaveCount}</div>
                    <div className="text-xs text-muted-foreground">Leave</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[150px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  {filterType === "class" 
                    ? `${selectedClass} has ${attendancePercentage}% attendance today`
                    : filterType === "student"
                    ? `${selectedStudentDetails?.name} has ${attendancePercentage}% attendance this month`
                    : `Overall attendance today: ${attendancePercentage}%`
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={view} onValueChange={(value) => setView(value as "calendar" | "list" | "student")} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" /> Calendar View
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> List View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <Card className="border border-gray-200">
            <div className="rounded-md">
              <div className="p-4 grid grid-cols-4 text-sm font-medium border-b">
                <div>Student</div>
                <div className="col-span-2">Status</div>
                <div>Actions</div>
              </div>
              <div className="divide-y">
                {dayAttendance.length > 0 ? dayAttendance.map((student) => (
                  <div key={student.id} className="p-4 grid grid-cols-4 items-center">
                    <div>
                      <div className="font-medium">{student.name}</div>
                    </div>
                    <div className="col-span-2">
                      <Badge
                        variant="outline"
                        className={
                          student.status === "Present" ? "border-green-500 bg-green-50 text-green-700" :
                          student.status === "Absent" ? "border-red-500 bg-red-50 text-red-700" :
                          student.status === "Leave" ? "border-orange-500 bg-orange-50 text-orange-700" :
                          "border-gray-500 bg-gray-50 text-gray-700"
                        }
                      >
                        {student.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs border-green-500 text-green-700 hover:bg-green-50"
                        onClick={() => handleStatusChange(student.id, "Present")}
                      >
                        Present
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs border-red-500 text-red-700 hover:bg-red-50"
                        onClick={() => handleStatusChange(student.id, "Absent")}
                      >
                        Absent
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs border-orange-500 text-orange-700 hover:bg-orange-50"
                        onClick={() => handleStatusChange(student.id, "Leave")}
                      >
                        Leave
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No students found for the selected filters.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <Card className="border border-gray-200">
            <div className="rounded-md">
              <div className="p-4 grid grid-cols-3 text-sm font-medium border-b">
                <div>Student</div>
                <div>Monthly Attendance</div>
                <div>Status Today</div>
              </div>
              <div className="divide-y">
                {students
                  .filter(student => {
                    if (filterType === "class") return student.class === selectedClass;
                    if (filterType === "student" && selectedStudent) return student.id === selectedStudent;
                    if (searchQuery) return student.name.toLowerCase().includes(searchQuery.toLowerCase());
                    return true;
                  })
                  .map((student) => {
                    const todayAttendance = dayAttendance.find(a => a.id === student.id);
                    
                    return (
                      <div key={student.id} className="p-4 grid grid-cols-3 items-center">
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.class}</div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${student.attendancePercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{student.attendancePercentage}%</span>
                          </div>
                        </div>
                        <div>
                          <Badge
                            variant="outline"
                            className={
                              todayAttendance?.status === "Present" ? "border-green-500 bg-green-50 text-green-700" :
                              todayAttendance?.status === "Absent" ? "border-red-500 bg-red-50 text-red-700" :
                              todayAttendance?.status === "Leave" ? "border-orange-500 bg-orange-50 text-orange-700" :
                              "border-gray-500 bg-gray-50 text-gray-700"
                            }
                          >
                            {todayAttendance?.status || "Not Marked"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { attendanceRecords, students, classes } from "@/mock/data";
import { format, subDays, addDays } from "date-fns";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState("Class 10");
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [dayAttendance, setDayAttendance] = useState<Array<{
    id: string;
    name: string;
    status: "Present" | "Absent" | "Leave" | "Holiday";
  }>>([]);

  // Get attendance records for the selected date
  useEffect(() => {
    const dateString = selectedDate?.toISOString().split('T')[0];
    
    const classStudents = students.filter(student => student.class === selectedClass);
    
    // Create attendance status for each student
    const studentsWithStatus = classStudents.map(student => {
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
  }, [selectedDate, selectedClass]);

  // Calculate attendance statistics
  const presentCount = dayAttendance.filter(s => s.status === "Present").length;
  const absentCount = dayAttendance.filter(s => s.status === "Absent").length;
  const leaveCount = dayAttendance.filter(s => s.status === "Leave").length;
  const totalStudents = dayAttendance.length;
  const attendancePercentage = totalStudents > 0 
    ? Math.round((presentCount / totalStudents) * 100) 
    : 0;

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

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        <Button className="bg-apple-blue hover:bg-blue-600">
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Date Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border shadow pointer-events-auto"
            />
          </CardContent>
        </Card>
        
        <Card className="glass-card md:col-span-2 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={prevDay}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={today}>Today</Button>
                  <Button variant="outline" size="icon" onClick={nextDay}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-center py-2">
                <h3 className="text-lg font-medium">{format(selectedDate, "EEEE, d MMMM yyyy")}</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                <div className="bg-green-50 text-apple-green rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{presentCount}</div>
                  <div className="text-xs">Present</div>
                </div>
                <div className="bg-red-50 text-apple-red rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{absentCount}</div>
                  <div className="text-xs">Absent</div>
                </div>
                <div className="bg-orange-50 text-apple-orange rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{leaveCount}</div>
                  <div className="text-xs">Leave</div>
                </div>
                <div className="bg-blue-50 text-apple-blue rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{attendancePercentage}%</div>
                  <div className="text-xs">Attendance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={view} onValueChange={(value) => setView(value as "calendar" | "list")} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <div className="rounded-md border">
              <div className="p-4 grid grid-cols-4 text-sm font-medium">
                <div>Student</div>
                <div className="col-span-2">Status</div>
                <div>Actions</div>
              </div>
              <div className="divide-y">
                {dayAttendance.map((student) => (
                  <div key={student.id} className="p-4 grid grid-cols-4 items-center">
                    <div>
                      <div className="font-medium">{student.name}</div>
                    </div>
                    <div className="col-span-2">
                      <Badge
                        variant="outline"
                        className={
                          student.status === "Present" ? "border-apple-green text-apple-green" :
                          student.status === "Absent" ? "border-apple-red text-apple-red" :
                          student.status === "Leave" ? "border-apple-orange text-apple-orange" :
                          "border-apple-gray text-apple-gray"
                        }
                      >
                        {student.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        Present
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        Absent
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        Leave
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <Card>
            <div className="rounded-md border">
              <div className="p-4 grid grid-cols-3 text-sm font-medium">
                <div>Student</div>
                <div>Monthly Attendance</div>
                <div>Status Today</div>
              </div>
              <div className="divide-y">
                {students
                  .filter(student => student.class === selectedClass)
                  .map((student) => {
                    const todayAttendance = dayAttendance.find(a => a.id === student.id);
                    
                    return (
                      <div key={student.id} className="p-4 grid grid-cols-3 items-center">
                        <div>
                          <div className="font-medium">{student.name}</div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-apple-blue h-2.5 rounded-full" 
                                style={{ width: `${student.attendancePercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{student.attendancePercentage}%</span>
                          </div>
                        </div>
                        <div>
                          <Badge
                            variant="outline"
                            className={
                              todayAttendance?.status === "Present" ? "border-apple-green text-apple-green" :
                              todayAttendance?.status === "Absent" ? "border-apple-red text-apple-red" :
                              todayAttendance?.status === "Leave" ? "border-apple-orange text-apple-orange" :
                              "border-apple-gray text-apple-gray"
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


import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { FileText, Download, Calendar, Users, DollarSign, BookOpen } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { useNewData } from "@/contexts/NewDataContext";

export default function Reports() {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [reportType, setReportType] = useState<string>("overview");

  const { students, classes, isLoading } = useNewData();

  // Calculate basic statistics
  const totalStudents = students.length;
  const maleStudents = students.filter(s => s.gender === "Male").length;
  const femaleStudents = students.filter(s => s.gender === "Female").length;

  // Calculate placeholder data since we don't have real fee/attendance data yet
  const totalFees = students.length * 50000; // Placeholder calculation
  const collectedFees = students.length * 30000; // Placeholder calculation
  const pendingFees = totalFees - collectedFees;

  // Mock attendance data
  const attendanceData = students.map(student => ({
    ...student,
    attendancePercentage: Math.floor(Math.random() * 30 + 70) // Random between 70-100%
  }));

  // Filter students by class
  const filteredStudents = selectedClass === "all" 
    ? students 
    : students.filter(student => student.class.includes(selectedClass.replace("Class ", "")));

  // Monthly performance data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      month: format(date, 'MMM yyyy'),
      students: Math.floor(Math.random() * 20 + filteredStudents.length - 10),
      fees: Math.floor(Math.random() * 50000 + 200000),
      attendance: Math.floor(Math.random() * 15 + 80)
    };
  }).reverse();

  // Class-wise distribution
  const classDistribution = classes.map(cls => ({
    name: cls.name,
    students: cls.totalStudents,
    fees: cls.totalStudents * 45000,
    attendance: Math.floor(Math.random() * 15 + 80)
  }));

  // Fee status distribution
  const feeStatusData = [
    { name: 'Paid', value: Math.floor(filteredStudents.length * 0.6), color: '#10b981' },
    { name: 'Partial', value: Math.floor(filteredStudents.length * 0.25), color: '#f59e0b' },
    { name: 'Pending', value: Math.floor(filteredStudents.length * 0.15), color: '#ef4444' }
  ];

  // Attendance performance
  const attendanceRanges = [
    { range: '90-100%', count: attendanceData.filter(s => s.attendancePercentage >= 90).length },
    { range: '80-89%', count: attendanceData.filter(s => s.attendancePercentage >= 80 && s.attendancePercentage < 90).length },
    { range: '70-79%', count: attendanceData.filter(s => s.attendancePercentage >= 70 && s.attendancePercentage < 80).length },
    { range: 'Below 70%', count: attendanceData.filter(s => s.attendancePercentage < 70).length }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[140px]">
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
          
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
            <p className="text-xs text-muted-foreground">
              Average Attendance: {Math.round(attendanceData.reduce((acc, s) => acc + s.attendancePercentage, 0) / attendanceData.length)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(collectedFees / 100000).toFixed(1)}L</div>
            <div className="flex items-center gap-1">
              <Progress value={(collectedFees / totalFees) * 100} className="h-1 flex-1" />
              <span className="text-xs text-muted-foreground">
                {Math.round((collectedFees / totalFees) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(pendingFees / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">
              From {feeStatusData.find(f => f.name === 'Pending')?.value || 0} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">
              Average {Math.round(totalStudents / classes.length)} students per class
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Fee Analysis</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Student enrollment and fee collection over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="students" stroke="#8884d8" name="Students" />
                    <Line type="monotone" dataKey="fees" stroke="#82ca9d" name="Fees (₹)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Class Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Class-wise Distribution</CardTitle>
                <CardDescription>Students and fees by class</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#8884d8" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fee Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Fee Status Distribution</CardTitle>
                <CardDescription>Payment status across all students</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={feeStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {feeStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Fee Collection by Class */}
            <Card>
              <CardHeader>
                <CardTitle>Fee Collection by Class</CardTitle>
                <CardDescription>Collection performance across classes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${(value as number).toLocaleString()}`, 'Fees']} />
                    <Bar dataKey="fees" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Performance</CardTitle>
                <CardDescription>Distribution of attendance percentages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceRanges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Class-wise Attendance */}
            <Card>
              <CardHeader>
                <CardTitle>Class-wise Attendance</CardTitle>
                <CardDescription>Average attendance by class</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                    <Bar dataKey="attendance" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance Overview</CardTitle>
              <CardDescription>
                Test scores and academic metrics (sample data)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Performance analytics will be available once test data is recorded.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

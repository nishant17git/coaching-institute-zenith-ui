import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { LoadingState } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { FileText, Users, CreditCard, TrendingUp, Download, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Reports() {
  const [selectedClass, setSelectedClass] = useState("all");
  const [reportType, setReportType] = useState("overview");

  // Fetch all data
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase.from('students').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: feeTransactions = [], isLoading: isLoadingFees } = useQuery({
    queryKey: ['feeTransactions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fee_transactions').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendanceRecords'],
    queryFn: async () => {
      const { data, error } = await supabase.from('attendance_records').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: testResults = [], isLoading: isLoadingTests } = useQuery({
    queryKey: ['testResults'],
    queryFn: async () => {
      const { data, error } = await supabase.from('test_results').select(`
        *,
        students!inner(full_name, class),
        tests!inner(subject, test_name)
      `);
      if (error) throw error;
      return data;
    }
  });

  const isLoading = isLoadingStudents || isLoadingFees || isLoadingAttendance || isLoadingTests;

  // Filter data by class
  const filteredStudents = selectedClass === "all" 
    ? students 
    : students.filter(s => s.class.toString() === selectedClass);

  const studentIds = filteredStudents.map(s => s.id);
  const filteredFeeTransactions = feeTransactions.filter(t => studentIds.includes(t.student_id));
  const filteredAttendance = attendanceRecords.filter(a => studentIds.includes(a.student_id));
  const filteredTestResults = testResults.filter(t => studentIds.includes(t.student_id));

  // Calculate statistics
  const totalStudents = filteredStudents.length;
  const totalFees = filteredStudents.reduce((sum, s) => sum + (s.total_fees || 0), 0);
  const totalPaid = filteredStudents.reduce((sum, s) => sum + (s.paid_fees || 0), 0);
  const collectionRate = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0;

  // Class distribution
  const classDistribution = students.reduce((acc, student) => {
    const className = `Class ${student.class}`;
    acc[className] = (acc[className] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const classData = Object.entries(classDistribution).map(([name, count]) => ({
    name,
    count,
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  // Fee collection by month
  const monthlyCollections = filteredFeeTransactions.reduce((acc, transaction) => {
    const month = format(new Date(transaction.payment_date), 'MMM yyyy'); // Use payment_date instead of date
    acc[month] = (acc[month] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  const monthlyData = Object.entries(monthlyCollections)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([month, amount]) => ({ month, amount }));

  // Attendance trends
  const attendanceTrends = filteredAttendance.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = { present: 0, absent: 0, total: 0 };
    }
    if (record.status === 'Present') {
      acc[date].present++;
    } else if (record.status === 'Absent') {
      acc[date].absent++;
    }
    acc[date].total++;
    return acc;
  }, {} as Record<string, { present: number; absent: number; total: number }>);

  const attendanceData = Object.entries(attendanceTrends)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-30) // Last 30 days
    .map(([date, data]) => ({
      date: format(new Date(date), 'MMM dd'),
      percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
    }));

  // Academic performance
  const subjectPerformance = filteredTestResults.reduce((acc, result) => {
    const subject = result.tests?.subject || 'Unknown';
    if (!acc[subject]) {
      acc[subject] = { total: 0, count: 0 };
    }
    const percentage = (result.marks_obtained / result.total_marks) * 100;
    acc[subject].total += percentage;
    acc[subject].count++;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const performanceData = Object.entries(subjectPerformance).map(([subject, data]) => ({
    subject,
    average: Math.round(data.total / data.count),
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  // Get unique classes for filter
  const classes = [...new Set(students.map(s => s.class.toString()))].sort();

  const handleExportReport = () => {
    toast.success("Report export functionality coming soon!");
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <EnhancedPageHeader 
        title="Reports & Analytics" 
        description="Comprehensive insights and analytics for your school"
        action={
          <Button onClick={handleExportReport} className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map(cls => (
              <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Overview</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="attendance">Attendance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <Badge variant="outline" className="mt-1">
              {selectedClass === "all" ? "All Classes" : `Class ${selectedClass}`}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              ₹{totalPaid.toLocaleString()} / ₹{totalFees.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceData.length > 0 
                ? Math.round(attendanceData.reduce((sum, d) => sum + d.percentage, 0) / attendanceData.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData.length > 0 
                ? Math.round(performanceData.reduce((sum, d) => sum + d.average, 0) / performanceData.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average across subjects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Student Distribution by Class</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={classData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Fee Collections */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Fee Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Performance by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="subject" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Average Score']} />
                <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Recent Admissions</h4>
              <p className="text-2xl font-bold text-blue-600">
                {students.filter(s => {
                  const admissionDate = new Date(s.admission_date || new Date());
                  const daysDiff = (new Date().getTime() - admissionDate.getTime()) / (1000 * 3600 * 24);
                  return daysDiff <= 7;
                }).length}
              </p>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Fee Payments</h4>
              <p className="text-2xl font-bold text-green-600">
                {feeTransactions.filter(t => {
                  const paymentDate = new Date(t.payment_date); // Use payment_date instead of date
                  const daysDiff = (new Date().getTime() - paymentDate.getTime()) / (1000 * 3600 * 24);
                  return daysDiff <= 7;
                }).length}
              </p>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Test Records</h4>
              <p className="text-2xl font-bold text-purple-600">
                {testResults.filter(t => {
                  const createdDate = new Date(t.created_at);
                  const daysDiff = (new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
                  return daysDiff <= 7;
                }).length}
              </p>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

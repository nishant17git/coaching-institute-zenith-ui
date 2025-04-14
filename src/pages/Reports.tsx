
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Download, FileText, Loader2, Percent } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [reportType, setReportType] = useState<"attendance" | "fees" | "performance">("attendance");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  
  // Fetch students data
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      let query = supabase.from('students').select('*');
      
      if (selectedClass !== "all") {
        query = query.eq('class', parseInt(selectedClass));
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch attendance data
  const { data: attendanceData = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance_report', selectedMonth],
    queryFn: async () => {
      // Extract year and month from selectedMonth
      const [year, month] = selectedMonth.split("-");
      const startDate = `${selectedMonth}-01`;
      const endDate = `${selectedMonth}-${new Date(parseInt(year), parseInt(month), 0).getDate()}`;
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch fee transactions
  const { data: feeTransactions = [], isLoading: feesLoading } = useQuery({
    queryKey: ['fee_transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_transactions')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Process data for different reports
  const processAttendanceData = () => {
    // Calculate attendance by class
    const classCounts: Record<string, {total: number, present: number}> = {};
    
    // First get all students grouped by class
    students.forEach(student => {
      const classKey = `Class ${student.class}`;
      if (!classCounts[classKey]) {
        classCounts[classKey] = { total: 0, present: 0 };
      }
      classCounts[classKey].total++;
    });
    
    // Get attendance percentages by class
    const attendanceByClass = Object.keys(classCounts).map(className => {
      const classStudents = students.filter(s => `Class ${s.class}` === className);
      const avgAttendance = classStudents.reduce((sum, student) => sum + student.attendance_percentage, 0) / classStudents.length;
      
      return {
        name: className,
        value: Math.round(avgAttendance)
      };
    });
    
    // Calculate daily attendance trend
    const dailyAttendanceCounts: Record<string, {total: number, present: number}> = {};
    
    attendanceData.forEach(record => {
      const date = record.date;
      if (!dailyAttendanceCounts[date]) {
        dailyAttendanceCounts[date] = { total: 0, present: 0 };
      }
      
      dailyAttendanceCounts[date].total++;
      if (record.status === "Present") {
        dailyAttendanceCounts[date].present++;
      }
    });
    
    const attendanceTrend = Object.keys(dailyAttendanceCounts)
      .sort()
      .map(date => {
        const { total, present } = dailyAttendanceCounts[date];
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return {
          date: format(new Date(date), "dd MMM"),
          percentage
        };
      });
    
    // Get attendance status distribution
    const statusCounts = attendanceData.reduce((counts: Record<string, number>, record) => {
      if (!counts[record.status]) {
        counts[record.status] = 0;
      }
      counts[record.status]++;
      return counts;
    }, {});
    
    const statusDistribution = Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status]
    }));
    
    return {
      attendanceByClass,
      attendanceTrend,
      statusDistribution
    };
  };
  
  const processFeesData = () => {
    // Calculate fee collection by month
    const monthlyFees: Record<string, number> = {};
    
    feeTransactions.forEach(transaction => {
      const monthYear = format(new Date(transaction.date), "MMM yyyy");
      if (!monthlyFees[monthYear]) {
        monthlyFees[monthYear] = 0;
      }
      monthlyFees[monthYear] += transaction.amount;
    });
    
    const feesByMonth = Object.keys(monthlyFees)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(month => ({
        name: month,
        amount: monthlyFees[month]
      }));
    
    // Calculate fee collection by payment mode
    const feesByMode = feeTransactions.reduce((modes: Record<string, number>, transaction) => {
      if (!modes[transaction.payment_mode]) {
        modes[transaction.payment_mode] = 0;
      }
      modes[transaction.payment_mode] += transaction.amount;
      return modes;
    }, {});
    
    const feesDistributionByMode = Object.keys(feesByMode).map(mode => ({
      name: mode,
      value: feesByMode[mode]
    }));
    
    // Calculate fee status by class
    const feeStatusByClass: Record<string, {total: number, paid: number, pending: number}> = {};
    
    students.forEach(student => {
      const classKey = `Class ${student.class}`;
      if (!feeStatusByClass[classKey]) {
        feeStatusByClass[classKey] = { total: 0, paid: 0, pending: 0 };
      }
      
      feeStatusByClass[classKey].total += student.total_fees;
      feeStatusByClass[classKey].paid += student.paid_fees;
      feeStatusByClass[classKey].pending += (student.total_fees - student.paid_fees);
    });
    
    const feesByClass = Object.keys(feeStatusByClass).map(className => ({
      name: className,
      paid: feeStatusByClass[className].paid,
      pending: feeStatusByClass[className].pending
    }));
    
    return {
      feesByMonth,
      feesDistributionByMode,
      feesByClass
    };
  };

  // Generate and export reports
  const exportReport = () => {
    try {
      let csvContent = "";
      
      if (reportType === "attendance") {
        csvContent = "Class,Average Attendance %\n";
        
        const { attendanceByClass } = processAttendanceData();
        attendanceByClass.forEach(item => {
          csvContent += `${item.name},${item.value}\n`;
        });
      } else if (reportType === "fees") {
        csvContent = "Class,Total Fees,Collected Fees,Pending Fees,Collection %\n";
        
        students.forEach(student => {
          const collectionPercent = student.total_fees > 0 ? 
            Math.round((student.paid_fees / student.total_fees) * 100) : 0;
          
          csvContent += `Class ${student.class},${student.total_fees},${student.paid_fees},${student.total_fees - student.paid_fees},${collectionPercent}%\n`;
        });
      }
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportType}_report_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report exported successfully`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export ${reportType} report`);
    }
  };

  // Prepare report data based on type
  const attendanceReport = processAttendanceData();
  const feesReport = processFeesData();
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
        <Button 
          className="bg-apple-blue hover:bg-blue-600 text-white"
          onClick={exportReport}
        >
          <Download className="h-4 w-4 mr-2" /> Export {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs defaultValue="attendance" onValueChange={(v) => setReportType(v as any)} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          {/* Wrapped all TabsContent components inside the Tabs component */}
          {/* Attendance Report */}
          <TabsContent value="attendance" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Daily Attendance Trend</CardTitle>
                  <CardDescription>
                    Attendance percentage for the selected month
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceReport.attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="#0A84FF" 
                        strokeWidth={2}
                        dot={{ stroke: '#0A84FF', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Attendance by Status</CardTitle>
                  <CardDescription>
                    Distribution of attendance status
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceReport.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {attendanceReport.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={
                            entry.name === "Present" ? "#30D158" :
                            entry.name === "Absent" ? "#FF3B30" :
                            entry.name === "Leave" ? "#FF9F0A" :
                            "#8E8E93"
                          } />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} records`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Class-wise Attendance</CardTitle>
                  <CardDescription>
                    Average attendance percentage by class
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceReport.attendanceByClass}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, "Average Attendance"]} />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        name="Average Attendance" 
                        fill="#0A84FF" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Fees Report */}
          <TabsContent value="fees" className="m-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Fee Collection</CardTitle>
                  <CardDescription>
                    Fees collected month by month
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feesReport.feesByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${parseInt(value as string).toLocaleString()}`, "Amount"]} />
                      <Legend />
                      <Bar 
                        dataKey="amount" 
                        name="Amount Collected" 
                        fill="#30D158" 
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Modes</CardTitle>
                  <CardDescription>
                    Distribution of fee collection by payment mode
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={feesReport.feesDistributionByMode}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {feesReport.feesDistributionByMode.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${parseInt(value as string).toLocaleString()}`, "Amount"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fee Collection by Class</CardTitle>
                  <CardDescription>
                    Paid vs pending fees for each class
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feesReport.feesByClass}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${parseInt(value as string).toLocaleString()}`, "Amount"]} />
                      <Legend />
                      <Bar dataKey="paid" name="Paid Fees" stackId="a" fill="#30D158" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" name="Pending Fees" stackId="a" fill="#FF3B30" radius={[0, 0, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Performance Report */}
          <TabsContent value="performance" className="m-0">
            <Card className="col-span-full">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>
                    Student performance metrics and insights
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="h-[400px] flex flex-col items-center justify-center text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Performance Reports Coming Soon</h3>
                <p className="text-muted-foreground max-w-md">
                  Test scores and performance analytics will be available in the next update. This feature is currently under development.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {Array.from({ length: 9 }, (_, i) => i + 2).map((cls) => (
              <SelectItem key={cls} value={cls.toString()}>
                Class {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="w-full sm:w-[180px]">
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
      
      {studentsLoading || attendanceLoading || feesLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : null}
    </div>
  );
}

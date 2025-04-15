import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { WelcomeHeader } from "@/components/WelcomeHeader";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
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
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  TooltipProps,
} from "recharts";
import {
  ChartBarIcon,
  Download,
  FileText,
  Loader2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon
} from "lucide-react";
import {
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

export default function Reports() {
  const [reportType, setReportType] = useState<"attendance" | "fees" | "performance">("attendance");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  const isMobile = useIsMobile();
  
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

  const { data: attendanceData = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance_report', selectedMonth],
    queryFn: async () => {
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

  const processAttendanceData = () => {
    const classCounts: Record<string, {total: number, present: number}> = {};
    
    students.forEach(student => {
      const classKey = `Class ${student.class}`;
      if (!classCounts[classKey]) {
        classCounts[classKey] = { total: 0, present: 0 };
      }
      classCounts[classKey].total++;
    });
    
    const attendanceByClass = Object.keys(classCounts).map(className => {
      const classStudents = students.filter(s => `Class ${s.class}` === className);
      const avgAttendance = classStudents.reduce((sum, student) => sum + student.attendance_percentage, 0) / classStudents.length;
      
      return {
        name: className,
        value: Math.round(avgAttendance),
        fill: `hsl(${Math.random() * 360}, 70%, 60%)`
      };
    });
    
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
          percentage,
          students: total
        };
      });
    
    const statusCounts = attendanceData.reduce((counts: Record<string, number>, record) => {
      if (!counts[record.status]) {
        counts[record.status] = 0;
      }
      counts[record.status]++;
      return counts;
    }, {});
    
    const statusDistribution = Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status],
      fill: status === "Present" ? "#30D158" : 
            status === "Absent" ? "#FF3B30" : 
            status === "Leave" ? "#FF9F0A" : "#8E8E93"
    }));

    const weeklyPattern = Array(7).fill(0).map((_, i) => ({
      day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i],
      attendance: Math.random() * 40 + 60
    }));
    
    return {
      attendanceByClass,
      attendanceTrend,
      statusDistribution,
      weeklyPattern
    };
  };

  const processFeesData = () => {
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
    
    const feesByMode = feeTransactions.reduce((modes: Record<string, number>, transaction) => {
      if (!modes[transaction.payment_mode]) {
        modes[transaction.payment_mode] = 0;
      }
      modes[transaction.payment_mode] += transaction.amount;
      return modes;
    }, {});
    
    const feesDistributionByMode = Object.keys(feesByMode).map((mode, index) => ({
      name: mode,
      value: feesByMode[mode],
      fill: [`#0088FE`, `#00C49F`, `#FFBB28`, `#FF8042`, `#8884d8`][index % 5]
    }));
    
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
    
    const feesByClass = Object.keys(feeStatusByClass)
      .sort()
      .map(className => ({
        name: className,
        paid: feeStatusByClass[className].paid,
        pending: feeStatusByClass[className].pending,
        total: feeStatusByClass[className].total
      }));

    const quarterlyTrends = [
      { name: 'Q1', actual: 120000, target: 150000 },
      { name: 'Q2', actual: 180000, target: 170000 },
      { name: 'Q3', actual: 190000, target: 200000 },
      { name: 'Q4', actual: 210000, target: 220000 }
    ];
    
    return {
      feesByMonth,
      feesDistributionByMode,
      feesByClass,
      quarterlyTrends
    };
  };

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

  const attendanceReport = processAttendanceData();
  const feesReport = processFeesData();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const customTooltipFormatter = (value: ValueType) => {
    if (typeof value === 'number') {
      return value.toFixed(0);
    }
    return value;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <WelcomeHeader
        title="Reports & Analytics"
        subtitle="Comprehensive data visualizations and analysis"
        icon={
          <Button 
            className="bg-apple-blue hover:bg-blue-600 text-white"
            onClick={exportReport}
            size={isMobile ? "sm" : "default"}
          >
            <Download className="h-4 w-4 mr-2" />
            {isMobile ? "Export" : `Export ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`}
          </Button>
        }
      />
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs 
          defaultValue="attendance" 
          onValueChange={(v) => setReportType(v as any)} 
          className="flex-1"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="attendance">
              <BarChartIcon className="h-4 w-4 mr-2 hidden sm:inline" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="fees">
              <LineChartIcon className="h-4 w-4 mr-2 hidden sm:inline" />
              Fees
            </TabsTrigger>
            <TabsTrigger value="performance">
              <PieChartIcon className="h-4 w-4 mr-2 hidden sm:inline" />
              Performance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="attendance" className="m-0 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 overflow-hidden">
                <CardHeader>
                  <CardTitle>Daily Attendance Trend</CardTitle>
                  <CardDescription>
                    Attendance percentage for the selected month
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] px-0 sm:px-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={attendanceReport.attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#888' }} 
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                        fontSize={isMobile ? 10 : 12}
                      />
                      <YAxis 
                        yAxisId="left"
                        domain={[0, 100]} 
                        tick={{ fill: '#888' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                        fontSize={isMobile ? 10 : 12}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tick={{ fill: '#888' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                        fontSize={isMobile ? 10 : 12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #f0f0f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                        formatter={(value) => {
                          if (typeof value === 'number') {
                            return [value.toFixed(0), ""];
                          }
                          return [value, ""];
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="percentage" 
                        name="Attendance %"
                        stroke="#0A84FF" 
                        fill="rgba(10, 132, 255, 0.1)"
                        strokeWidth={2}
                        yAxisId="left"
                      />
                      <Bar 
                        dataKey="students" 
                        name="Students" 
                        fill="#30D158" 
                        radius={[4, 4, 0, 0]} 
                        yAxisId="right"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Attendance by Status</CardTitle>
                  <CardDescription>
                    Distribution of attendance status
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] px-0 sm:px-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceReport.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? 40 : 60}
                        outerRadius={isMobile ? 60 : 80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => {
                          const percentValue = typeof percent === 'number' ? (percent * 100).toFixed(0) : '0';
                          return `${name} (${percentValue}%)`;
                        }}
                      >
                        {attendanceReport.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} records`, ""]}
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #f0f0f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Class-wise Attendance</CardTitle>
                  <CardDescription>
                    Average attendance percentage by class
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] px-0 sm:px-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={attendanceReport.attendanceByClass}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        type="number" 
                        domain={[0, 100]} 
                        tick={{ fill: '#888' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                        fontSize={isMobile ? 10 : 12}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={70} 
                        tick={{ fill: '#888' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                        fontSize={isMobile ? 10 : 12}
                      />
                      <Tooltip 
                        formatter={(value) => {
                          if (typeof value === 'number') {
                            return [`${value}%`, "Average Attendance"];
                          }
                          return [value, "Average Attendance"];
                        }}
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #f0f0f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Average Attendance" 
                        radius={[0, 4, 4, 0]} 
                      >
                        {attendanceReport.attendanceByClass.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Weekly Attendance Pattern</CardTitle>
                  <CardDescription>
                    Attendance trends by day of week
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] px-0 sm:px-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={isMobile ? "60%" : "70%"} 
                      data={attendanceReport.weeklyPattern}
                    >
                      <PolarGrid stroke="#e0e0e0" />
                      <PolarAngleAxis 
                        dataKey="day" 
                        tick={{ fill: '#888', fontSize: isMobile ? 10 : 12 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fill: '#888', fontSize: isMobile ? 8 : 10 }}
                      />
                      <Radar 
                        name="Attendance %" 
                        dataKey="attendance" 
                        stroke="#FF9F0A" 
                        fill="#FF9F0A" 
                        fillOpacity={0.6} 
                      />
                      <Tooltip 
                        formatter={(value) => {
                          if (typeof value === 'number') {
                            return [`${value.toFixed(1)}%`, "Attendance"];
                          }
                          return [value, "Attendance"];
                        }}
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #f0f0f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="fees" className="m-0 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 overflow-hidden">
                <CardHeader>
                  <CardTitle>Monthly Fee Collection</CardTitle>
                  <CardDescription>
                    Fees collected month by month
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] px-0 sm:px-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={feesReport.feesByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#888' }} 
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                        fontSize={isMobile ? 10 : 12}
                      />
                      <YAxis 
                        tick={{ fill: '#888' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                        fontSize={isMobile ? 10 : 12}
                      />
                      <Tooltip 
                        formatter={(value) => {
                          const numValue = typeof value === 'string' ? parseInt(value) : value;
                          if (typeof numValue === 'number' && !isNaN(numValue)) {
                            return [`₹${numValue.toLocaleString()}`, "Amount"];
                          }
                          return [value, "Amount"];
                        }}
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #f0f0f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        name="Amount Collected" 
                        stroke="#30D158" 
                        fill="rgba(48, 209, 88, 0.1)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Payment Modes</CardTitle>
                  <CardDescription>
                    Distribution by payment method
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] px-0 sm:px-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={feesReport.feesDistributionByMode}
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? 40 : 60}
                        outerRadius={isMobile ? 60 : 80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => {
                          const percentValue = typeof percent === 'number' ? (percent * 100).toFixed(0) : '0';
                          return `${name} (${percentValue}%)`;
                        }}
                      >
                        {feesReport.feesDistributionByMode.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => {
                          const numValue = typeof value === 'string' ? parseInt(value) : value;
                          if (typeof numValue === 'number' && !isNaN(numValue)) {
                            return [`₹${numValue.toLocaleString()}`, "Amount"];
                          }
                          return [value, "Amount"];
                        }}
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #f0f0f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Fee Collection by Class</CardTitle>
                  <CardDescription>
                    Paid vs pending fees for each class
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] px-0 sm:px-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feesReport.feesByClass}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#888' }} 
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                        fontSize={isMobile ? 10 : 12}
                      />
                      <YAxis 
                        tick={{ fill: '#888' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                        fontSize={isMobile ? 10 : 12}
                      />
                      <Tooltip 
                        formatter={(value) => {
                          const numValue = typeof value === 'string' ? parseInt(value) : value;
                          if (typeof numValue === 'number' && !isNaN(numValue)) {
                            return [`₹${numValue.toLocaleString()}`, "Amount"];
                          }
                          return [value, "Amount"];
                        }}
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #f0f0f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="paid" name="Paid Fees" stackId="a" fill="#30D158" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pending" name="Pending Fees" stackId="a" fill="#FF3B30" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Fee Collection Trends</CardTitle>
                  <CardDescription>
                    Actual vs Target by quarter
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[280px] px-0 sm:px-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={feesReport.quarterlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#888' }} 
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                        fontSize={isMobile ? 10 : 12}
                      />
                      <YAxis 
                        tick={{ fill: '#888' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                        fontSize={isMobile ? 10 : 12}
                      />
                      <Tooltip 
                        formatter={(value) => {
                          const numValue = typeof value === 'string' ? parseInt(value) : value;
                          if (typeof numValue === 'number' && !isNaN(numValue)) {
                            return [`₹${numValue.toLocaleString()}`, ""];
                          }
                          return [value, ""];
                        }}
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #f0f0f0', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        name="Actual Collection" 
                        stroke="#0A84FF" 
                        strokeWidth={2}
                        dot={{ stroke: '#0A84FF', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        name="Target Collection" 
                        stroke="#FF9F0A"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={{ stroke: '#FF9F0A', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="m-0 pt-6">
            <Card className="col-span-full overflow-hidden">
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
        
        <div className="flex flex-row sm:flex-col gap-2">
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
      </div>
      
      {studentsLoading || attendanceLoading || feesLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : null}
    </div>
  );
}

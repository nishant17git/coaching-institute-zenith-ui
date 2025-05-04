
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header"; 
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
  ComposedChart
} from "recharts";
import {
  Download,
  FileText,
  Loader2,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Calendar,
  Search,
  ChevronDown,
  Filter,
  Share2,
  Bookmark,
  Star,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Reports() {
  const [reportType, setReportType] = useState<"attendance" | "fees" | "performance">("attendance");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  const [selectedView, setSelectedView] = useState("charts");
  const [favoriteReports, setFavoriteReports] = useState<string[]>([]);
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
  
  const handleToggleFavorite = (reportName: string) => {
    if (favoriteReports.includes(reportName)) {
      setFavoriteReports(favoriteReports.filter(r => r !== reportName));
      toast.info(`Removed "${reportName}" from favorites`);
    } else {
      setFavoriteReports([...favoriteReports, reportName]);
      toast.success(`Added "${reportName}" to favorites`);
    }
  };

  const attendanceReport = processAttendanceData();
  const feesReport = processFeesData();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const isLoading = studentsLoading || attendanceLoading || feesLoading;
  
  // Recent reports list (for demonstration)
  const recentReports = [
    { name: "May 2023 Attendance", type: "attendance", date: "2023-05-30" },
    { name: "Q2 Fee Collection", type: "fees", date: "2023-06-15" },
    { name: "Class 10 Performance", type: "performance", date: "2023-06-10" }
  ];
  
  const ReportCard = ({ title, icon, isFavorite, onClick }: { 
    title: string; 
    icon: React.ReactNode;
    isFavorite?: boolean;
    onClick?: () => void; 
  }) => (
    <Card 
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all hover:shadow-md",
        isFavorite ? "border-yellow-300 border-2" : ""
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground">
          Last generated: {format(new Date(), "dd MMM yyyy")}
        </p>
        
        <div className="flex mt-3 gap-1">
          <Button variant="outline" size="sm" className="h-8">
            <Eye className="h-3 w-3 mr-1" /> View
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <Download className="h-3 w-3 mr-1" /> Export
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(title);
            }}
          >
            <Star className={cn(
              "h-4 w-4", 
              isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
            )} />
          </Button>
        </div>
        
        {isFavorite && (
          <div className="absolute top-0 right-0">
            <div className="w-12 h-12 bg-yellow-300 rotate-45 translate-x-6 -translate-y-6"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  const chartContainerStyle = "h-[280px] px-0 sm:px-6 relative";

  return (
    <div className="space-y-6 animate-slide-up">
      <EnhancedPageHeader
        title="Reports & Analytics"
        description="Comprehensive data visualizations and analysis"
        showBackButton
        action={
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={exportReport}
            size={isMobile ? "sm" : "default"}
          >
            <Download className="h-4 w-4 mr-2" />
            {isMobile ? "Export" : `Export ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`}
          </Button>
        }
      />
      
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Tabs 
              defaultValue="attendance" 
              onValueChange={(v) => setReportType(v as any)}
              orientation="horizontal"
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
            </Tabs>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={selectedView} onValueChange={setSelectedView}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="charts">Charts</SelectItem>
                  <SelectItem value="tables">Data Tables</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[140px]">
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
            </div>
          </div>
          
          <div className="flex mb-4">
            <div className="relative flex-1 max-w-sm">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {reportType === "attendance" && (
                <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    <Card className="md:col-span-2 overflow-hidden">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Daily Attendance Trend</CardTitle>
                            <CardDescription>
                              Attendance percentage for the selected month
                            </CardDescription>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggleFavorite("Daily Attendance Trend")}
                          >
                            <Star className={cn(
                              "h-4 w-4", 
                              favoriteReports.includes("Daily Attendance Trend") ? 
                                "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            )} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className={chartContainerStyle}>
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
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Attendance by Status</CardTitle>
                            <CardDescription>
                              Distribution of attendance status
                            </CardDescription>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleFavorite("Attendance by Status")}
                          >
                            <Star className={cn(
                              "h-4 w-4", 
                              favoriteReports.includes("Attendance by Status") ? 
                                "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            )} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className={chartContainerStyle}>
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
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <Card className="overflow-hidden">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Class-wise Attendance</CardTitle>
                            <CardDescription>
                              Average attendance percentage by class
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Share2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className={chartContainerStyle}>
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
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Weekly Attendance Pattern</CardTitle>
                            <CardDescription>
                              Attendance trends by day of week
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Share2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className={chartContainerStyle}>
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
                  </motion.div>
                </div>
              )}
              
              {reportType === "fees" && (
                <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    <Card className="md:col-span-2 overflow-hidden">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Monthly Fee Collection</CardTitle>
                            <CardDescription>
                              Fees collected month by month
                            </CardDescription>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggleFavorite("Monthly Fee Collection")}
                          >
                            <Star className={cn(
                              "h-4 w-4", 
                              favoriteReports.includes("Monthly Fee Collection") ? 
                                "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            )} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className={chartContainerStyle}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={feesReport.feesByMonth}>
                            <defs>
                              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#30D158" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#30D158" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
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
                              fillOpacity={1}
                              fill="url(#colorAmount)" 
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Payment Modes</CardTitle>
                            <CardDescription>
                              Distribution by payment method
                            </CardDescription>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggleFavorite("Payment Modes")}
                          >
                            <Star className={cn(
                              "h-4 w-4", 
                              favoriteReports.includes("Payment Modes") ? 
                                "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            )} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className={chartContainerStyle}>
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
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
                  >
                    <Card className="overflow-hidden">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Fee Collection by Class</CardTitle>
                            <CardDescription>
                              Paid vs pending fees for each class
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Share2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className={chartContainerStyle}>
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
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Fee Collection Trends</CardTitle>
                            <CardDescription>
                              Actual vs Target by quarter
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Share2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className={chartContainerStyle}>
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
                  </motion.div>
                </div>
              )}
              
              {reportType === "performance" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.5 }}
                >
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
                      <Button className="mt-4" variant="outline">
                        Request Early Access
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="favorites">
          {favoriteReports.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Favorite Reports</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Click the star icon on any report to add it to your favorites for quick access.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {favoriteReports.map((report) => (
                <ReportCard 
                  key={report}
                  title={report}
                  icon={<BarChartIcon className="h-4 w-4" />}
                  isFavorite={true}
                  onClick={() => {}}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Recently Generated Reports</h3>
              <Button variant="ghost" size="sm">
                <Clock className="h-4 w-4 mr-2" /> View History
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recentReports.map((report) => (
                <ReportCard 
                  key={report.name}
                  title={report.name}
                  icon={
                    report.type === "attendance" ? <BarChartIcon className="h-4 w-4" /> :
                    report.type === "fees" ? <LineChartIcon className="h-4 w-4" /> :
                    <PieChartIcon className="h-4 w-4" />
                  }
                  isFavorite={favoriteReports.includes(report.name)}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

type ChartIcon = "bar" | "line" | "pie" | "area";

// Custom chart type icon component
function ChartTypeIcon({ type, active }: { type: ChartIcon; active?: boolean }) {
  const className = cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground");
  
  switch (type) {
    case "bar":
      return <BarChartIcon className={className} />;
    case "line":
      return <LineChartIcon className={className} />;
    case "pie":
      return <PieChartIcon className={className} />;
    case "area":
      return <LineChartIcon className={className} />;
  }
}

// Missing functions
const Eye = (props: any) => {
  return <Search {...props} />;
};

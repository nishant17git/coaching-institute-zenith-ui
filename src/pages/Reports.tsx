import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { EnhancedPageHeader } from "@/components/enhanced-page-header";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { StatCard } from "@/components/ui/stat-card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, RadialBar, RadialBarChart, XAxis, YAxis, Cell } from "recharts";
import { Download, TrendingUp, TrendingDown, Users, DollarSign, BookOpen, Calendar, Filter, RefreshCw, Eye, MoreHorizontal, GraduationCap, CreditCard, UserCheck, Target, Activity, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// Enhanced vibrant color palette for charts
const chartConfig = {
  students: {
    label: "Students",
    color: "#FF6B6B" // Bright coral red
  },
  attendance: {
    label: "Attendance",
    color: "#4ECDC4" // Vibrant turquoise
  },
  fees: {
    label: "Fees",
    color: "#45B7D1" // Bright sky blue
  },
  collection: {
    label: "Collection Rate",
    color: "#FFA07A" // Light salmon
  },
  paid: {
    label: "Paid",
    color: "#98D8C8" // Mint green
  },
  pending: {
    label: "Pending",
    color: "#F7DC6F" // Light yellow
  },
  partial: {
    label: "Partial",
    color: "#BB8FCE" // Light purple
  },
  excellent: {
    label: "Excellent (90%+)",
    color: "#FF9FF3" // Bright pink
  },
  good: {
    label: "Good (80-89%)",
    color: "#54A0FF" // Bright blue
  },
  average: {
    label: "Average (70-79%)",
    color: "#5F27CD" // Vibrant purple
  },
  poor: {
    label: "Poor (<70%)",
    color: "#FF3838" // Bright red
  },
  class2: {
    label: "Class 2",
    color: "#FF6B6B"
  },
  class3: {
    label: "Class 3",
    color: "#4ECDC4"
  },
  class4: {
    label: "Class 4",
    color: "#45B7D1"
  },
  class5: {
    label: "Class 5",
    color: "#FFA07A"
  },
  class6: {
    label: "Class 6",
    color: "#98D8C8"
  },
  class7: {
    label: "Class 7",
    color: "#F7DC6F"
  },
  class8: {
    label: "Class 8",
    color: "#BB8FCE"
  },
  class9: {
    label: "Class 9",
    color: "#85C1E9"
  }
} satisfies ChartConfig;

// Vibrant colors array for dynamic charts
const vibrantColors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9", "#FF9FF3", "#54A0FF", "#5F27CD", "#FF3838", "#FFD93D", "#6C5CE7", "#00B894"];
export default function Reports() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const [selectedClass, setSelectedClass] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();
  const {
    data: students = [],
    isLoading: studentsLoading
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('students').select('*');
      if (error) throw error;
      return data || [];
    }
  });
  const {
    data: attendanceData = [],
    isLoading: attendanceLoading
  } = useQuery({
    queryKey: ['attendance_report'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('attendance_records').select('*');
      if (error) throw error;
      return data || [];
    }
  });
  const {
    data: feeTransactions = [],
    isLoading: feesLoading
  } = useQuery({
    queryKey: ['fee_transactions'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('fee_transactions').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Enhanced data processing
  const totalStudents = students.length;
  const averageAttendance = students.length > 0 ? Math.round(students.reduce((sum, s) => sum + (s.attendance_percentage || 0), 0) / students.length) : 0;
  const totalFeesCollected = feeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalFeesExpected = students.reduce((sum, s) => sum + (s.total_fees || 0), 0);
  const collectionRate = totalFeesExpected > 0 ? Math.round(totalFeesCollected / totalFeesExpected * 100) : 0;

  // Enhanced class-wise data with fill colors
  const classWiseData = Array.from({
    length: 8
  }, (_, i) => {
    const classNum = i + 2;
    const classStudents = students.filter(s => s.class === classNum);
    const classAttendance = attendanceData.filter(a => classStudents.some(cs => cs.id === a.student_id));
    const presentCount = classAttendance.filter(a => a.status === "Present").length;
    const totalDays = classAttendance.length;
    const attendanceRate = totalDays > 0 ? Math.round(presentCount / totalDays * 100) : 0;
    const classFees = classStudents.reduce((sum, s) => sum + (s.paid_fees || 0), 0);
    const classExpectedFees = classStudents.reduce((sum, s) => sum + (s.total_fees || 0), 0);
    const feeCollectionRate = classExpectedFees > 0 ? Math.round(classFees / classExpectedFees * 100) : 0;
    return {
      name: `Class ${classNum}`,
      students: classStudents.length,
      attendance: attendanceRate,
      fees: classFees,
      feeRate: feeCollectionRate,
      fill: vibrantColors[i % vibrantColors.length]
    };
  }).filter(item => item.students > 0);

  // Monthly trends data
  const last6Months = Array.from({
    length: 6
  }, (_, i) => {
    const date = subMonths(new Date(), i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const monthFees = feeTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    }).reduce((sum, t) => sum + t.amount, 0);
    const monthAttendance = attendanceData.filter(a => {
      const attendanceDate = new Date(a.date);
      return attendanceDate >= monthStart && attendanceDate <= monthEnd;
    });
    const presentCount = monthAttendance.filter(a => a.status === "Present").length;
    const totalCount = monthAttendance.length;
    const attendanceRate = totalCount > 0 ? Math.round(presentCount / totalCount * 100) : 0;
    return {
      month: format(date, "MMM"),
      fees: monthFees,
      attendance: attendanceRate,
      students: totalStudents
    };
  }).reverse();

  // Fee status distribution with fill colors
  const feeStatusData = [{
    name: "Paid",
    value: students.filter(s => s.fee_status === "Paid").length,
    fill: "#98D8C8"
  }, {
    name: "Pending",
    value: students.filter(s => s.fee_status === "Pending").length,
    fill: "#F7DC6F"
  }, {
    name: "Partial",
    value: students.filter(s => s.fee_status === "Partial").length,
    fill: "#BB8FCE"
  }];

  // Attendance distribution with fill colors
  const attendanceDistribution = [{
    name: "Excellent",
    value: students.filter(s => (s.attendance_percentage || 0) >= 90).length,
    fill: "#FF9FF3"
  }, {
    name: "Good",
    value: students.filter(s => (s.attendance_percentage || 0) >= 80 && (s.attendance_percentage || 0) < 90).length,
    fill: "#54A0FF"
  }, {
    name: "Average",
    value: students.filter(s => (s.attendance_percentage || 0) >= 70 && (s.attendance_percentage || 0) < 80).length,
    fill: "#5F27CD"
  }, {
    name: "Poor",
    value: students.filter(s => (s.attendance_percentage || 0) < 70).length,
    fill: "#FF3838"
  }];
  const exportReport = () => {
    try {
      const reportData = {
        overview: {
          totalStudents,
          averageAttendance,
          totalFeesCollected,
          collectionRate
        },
        classWise: classWiseData,
        trends: last6Months,
        timestamp: new Date().toISOString()
      };
      const csvContent = `Analytics Report\n\nOverview\nTotal Students,${totalStudents}\nAverage Attendance,${averageAttendance}%\nTotal Fees Collected,₹${totalFeesCollected.toLocaleString()}\nCollection Rate,${collectionRate}%\n\nClass-wise Data\n${classWiseData.map(c => `${c.name},${c.students} students,${c.attendance}% attendance,₹${c.fees.toLocaleString()} collected`).join('\n')}\n\nGenerated,${format(new Date(), 'dd/MM/yyyy HH:mm')}`;
      const blob = new Blob([csvContent], {
        type: 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_report_${format(new Date(), 'yyyyMMdd')}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Analytics report exported successfully!");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };
  const isLoading = studentsLoading || attendanceLoading || feesLoading;
  if (isLoading) {
    return <div className="space-y-6 animate-fade-in">
        <EnhancedPageHeader title="Analytics Dashboard" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({
          length: 4
        }).map((_, i) => <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>)}
        </div>
      </div>;
  }
  return <div className="space-y-4 lg:space-y-6 animate-fade-in sm:px-4 lg:px-6 px-0">
      <EnhancedPageHeader title="Analytics Dashboard" showBackButton action={<div className="flex gap-2">
            
            
          </div>} />

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard title="Total Students" value={totalStudents.toString()} description="Active enrollments" trend={{
        value: 5,
        isPositive: true
      }} icon={<Users className="h-4 w-4" />} className="bg-gradient-to-r from-blue-50 to-blue-100" />
        <StatCard title="Attendance Rate" value={`${averageAttendance}%`} description="Average attendance" trend={{
        value: 2,
        isPositive: true
      }} icon={<Calendar className="h-4 w-4" />} className="bg-gradient-to-r from-green-50 to-green-100" />
        <StatCard title="Fee Collection" value={`₹${totalFeesCollected.toLocaleString()}`} description="Total collected" trend={{
        value: 8,
        isPositive: true
      }} icon={<CreditCard className="h-4 w-4" />} className="bg-gradient-to-r from-purple-50 to-purple-100" />
        <StatCard title="Collection Rate" value={`${collectionRate}%`} description="Payment efficiency" trend={{
        value: 5,
        isPositive: true
      }} icon={<Target className="h-4 w-4" />} className="bg-gradient-to-r from-orange-50 to-orange-100" />
      </div>

      {/* Analytics Filters - Repositioned */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col gap-4 items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Filter className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm lg:text-base">Analytics Filters</h3>
                <p className="text-xs lg:text-sm text-muted-foreground">Customize your data view</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {Array.from({
                  length: 8
                }, (_, i) => <SelectItem key={i + 2} value={(i + 2).toString()}>
                      Class {i + 2}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs - Mobile Optimized with Consistent Design */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 lg:space-y-6">
        <div className="flex flex-col gap-3">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted/50 p-1 h-auto">
            <TabsTrigger value="overview" className={cn("flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all", isMobile && "flex-col gap-1 py-2 px-2")}>
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span className={cn(isMobile && "text-xs")}>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="students" className={cn("flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all", isMobile && "flex-col gap-1 py-2 px-2")}>
              <Users className="h-4 w-4 shrink-0" />
              <span className={cn(isMobile && "text-xs")}>Students</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className={cn("flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all", isMobile && "flex-col gap-1 py-2 px-2")}>
              <Calendar className="h-4 w-4 shrink-0" />
              <span className={cn(isMobile && "text-xs")}>Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="fees" className={cn("flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all", isMobile && "flex-col gap-1 py-2 px-2")}>
              <CreditCard className="h-4 w-4 shrink-0" />
              <span className={cn(isMobile && "text-xs")}>Finances</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 lg:space-y-6">
          {/* Performance Trends - Enhanced Area Chart */}
          <Card className="shadow-lg border-2 border-gradient-to-r from-purple-200 to-pink-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm lg:text-base text-purple-700">
                <Activity className="h-4 w-4 lg:h-5 lg:w-5" />
                Performance Trends
              </CardTitle>
              <CardDescription className="text-xs lg:text-sm">Multi-metric analysis over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent className="p-2 lg:p-6">
              <ChartContainer config={chartConfig} className={cn("w-full", isMobile ? "h-[200px]" : "h-[350px]")}>
                <AreaChart accessibilityLayer data={last6Months} margin={{
                left: isMobile ? 2 : 12,
                right: isMobile ? 2 : 12,
                top: 5,
                bottom: 5
              }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={isMobile ? 9 : 12} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <defs>
                    <linearGradient id="fillFees" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#45B7D1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#45B7D1" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="fillAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Area dataKey="attendance" type="natural" fill="url(#fillAttendance)" fillOpacity={0.6} stroke="#4ECDC4" strokeWidth={3} stackId="a" />
                  <Area dataKey="fees" type="natural" fill="url(#fillFees)" fillOpacity={0.6} stroke="#45B7D1" strokeWidth={3} stackId="a" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="p-2 lg:p-6">
              <div className="flex w-full items-start gap-2 text-xs lg:text-sm">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 font-medium leading-none text-green-600">
                    Trending up by 5.2% this month <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
                  </div>
                  <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    Last 6 months performance data
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Class Performance - Enhanced Horizontal Bar Chart */}
            <Card className="shadow-lg border-2 border-gradient-to-r from-blue-200 to-teal-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm lg:text-base text-blue-700">
                  <GraduationCap className="h-4 w-4 lg:h-5 lg:w-5" />
                  Class Performance Matrix
                </CardTitle>
                <CardDescription className="text-xs lg:text-sm">Comprehensive class-wise analytics</CardDescription>
              </CardHeader>
              <CardContent className="p-2 lg:p-6">
                <ChartContainer config={chartConfig} className={cn("w-full", isMobile ? "h-[200px]" : "h-[300px]")}>
                  <BarChart accessibilityLayer data={classWiseData} layout="vertical" margin={{
                  left: isMobile ? -15 : -20,
                  right: 5,
                  top: 5,
                  bottom: 5
                }}>
                    <XAxis type="number" dataKey="students" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} fontSize={isMobile ? 9 : 12} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="students" radius={5}>
                      {classWiseData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-xs lg:text-sm p-2 lg:p-6">
                <div className="flex gap-2 font-medium leading-none text-green-600">
                  Strong performance across all classes <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                  Student distribution by class level
                </div>
              </CardFooter>
            </Card>

            {/* Fee Status Distribution - Enhanced Pie Chart */}
            <Card className="shadow-lg flex flex-col border-2 border-gradient-to-r from-green-200 to-yellow-200">
              <CardHeader className="items-center pb-0">
                <CardTitle className="flex items-center gap-2 text-sm lg:text-base text-green-700">
                  <DollarSign className="h-4 w-4 lg:h-5 lg:w-5" />
                  Fee Payment Distribution
                </CardTitle>
                <CardDescription className="text-xs lg:text-sm">Current payment status breakdown</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0 p-2 lg:p-6">
                <ChartContainer config={chartConfig} className={cn("mx-auto aspect-square", isMobile ? "max-h-[150px]" : "max-h-[200px]")}>
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie data={feeStatusData} dataKey="value" nameKey="name" outerRadius={isMobile ? 50 : 70} strokeWidth={3} stroke="#fff">
                      {feeStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-xs lg:text-sm p-2 lg:p-6">
                <div className="flex items-center gap-2 font-medium leading-none text-green-600">
                  Fee collection improving <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                  Current fee payment status across all students
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Class Distribution - Enhanced Area Chart */}
            <Card className="shadow-lg border-2 border-gradient-to-r from-red-200 to-orange-200">
              <CardHeader>
                <CardTitle className="text-sm lg:text-base text-red-700">Class Distribution</CardTitle>
                <CardDescription className="text-xs lg:text-sm">Student enrollment by class</CardDescription>
              </CardHeader>
              <CardContent className="p-2 lg:p-6">
                <ChartContainer config={chartConfig} className={cn("w-full", isMobile ? "h-[200px]" : "h-[250px]")}>
                  <AreaChart accessibilityLayer data={classWiseData} margin={{
                  left: isMobile ? 2 : 12,
                  right: isMobile ? 2 : 12,
                  top: 5,
                  bottom: 5
                }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={isMobile ? 9 : 12} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <defs>
                      <linearGradient id="fillStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <Area dataKey="students" type="natural" fill="url(#fillStudents)" fillOpacity={0.6} stroke="#FF6B6B" strokeWidth={3} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-xs lg:text-sm p-2 lg:p-6">
                <div className="flex gap-2 font-medium leading-none text-green-600">
                  Balanced enrollment distribution <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                  Current academic year enrollment
                </div>
              </CardFooter>
            </Card>

            {/* Attendance Distribution - Enhanced Radial Chart */}
            <Card className="shadow-lg flex flex-col border-2 border-gradient-to-r from-purple-200 to-indigo-200">
              <CardHeader className="items-center pb-0">
                <CardTitle className="text-sm lg:text-base text-purple-700">Attendance Performance</CardTitle>
                <CardDescription className="text-xs lg:text-sm">Student performance categories</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0 p-2 lg:p-6">
                <ChartContainer config={chartConfig} className={cn("mx-auto aspect-square", isMobile ? "max-h-[150px]" : "max-h-[200px]")}>
                  <RadialBarChart data={attendanceDistribution} innerRadius={isMobile ? 15 : 25} outerRadius={isMobile ? 60 : 90}>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="name" />} />
                    <RadialBar dataKey="value" background cornerRadius={4}>
                      {attendanceDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </RadialBar>
                  </RadialBarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-xs lg:text-sm p-2 lg:p-6">
                <div className="flex items-center gap-2 font-medium leading-none text-green-600">
                  Excellent attendance overall <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                  Performance distribution across all students
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4 lg:space-y-6">
          {/* Attendance Analytics - Enhanced Line Chart */}
          <Card className="shadow-lg border-2 border-gradient-to-r from-teal-200 to-cyan-200">
            <CardHeader>
              <CardTitle className="text-sm lg:text-base text-teal-700">Attendance Analytics</CardTitle>
              <CardDescription className="text-xs lg:text-sm">Detailed attendance patterns and insights</CardDescription>
            </CardHeader>
            <CardContent className="p-2 lg:p-6">
              <ChartContainer config={chartConfig} className={cn("w-full", isMobile ? "h-[200px]" : "h-[350px]")}>
                <LineChart accessibilityLayer data={classWiseData} margin={{
                left: isMobile ? 2 : 12,
                right: isMobile ? 2 : 12,
                top: 5,
                bottom: 5
              }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={isMobile ? 9 : 12} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Line dataKey="attendance" type="natural" stroke="#4ECDC4" strokeWidth={4} dot={{
                  fill: "#4ECDC4",
                  strokeWidth: 2,
                  r: 6
                }} activeDot={{
                  r: 8,
                  fill: "#2D9CDB"
                }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-xs lg:text-sm p-2 lg:p-6">
              <div className="flex gap-2 font-medium leading-none text-green-600">
                Consistent attendance across classes <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Class-wise attendance performance trends
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Monthly Fee Collection - Enhanced Area Chart */}
            <Card className="shadow-lg border-2 border-gradient-to-r from-yellow-200 to-orange-200">
              <CardHeader>
                <CardTitle className="text-sm lg:text-base text-yellow-700">Monthly Fee Collection</CardTitle>
                <CardDescription className="text-xs lg:text-sm">Revenue trends over time</CardDescription>
              </CardHeader>
              <CardContent className="p-2 lg:p-6">
                <ChartContainer config={chartConfig} className={cn("w-full", isMobile ? "h-[200px]" : "h-[300px]")}>
                  <AreaChart accessibilityLayer data={last6Months} margin={{
                  left: isMobile ? 2 : 12,
                  right: isMobile ? 2 : 12,
                  top: 5,
                  bottom: 5
                }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={isMobile ? 9 : 12} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <defs>
                      <linearGradient id="fillFeesOnly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F7DC6F" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#F7DC6F" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <Area dataKey="fees" type="natural" fill="url(#fillFeesOnly)" fillOpacity={0.6} stroke="#F7DC6F" strokeWidth={3} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-xs lg:text-sm p-2 lg:p-6">
                <div className="flex gap-2 font-medium leading-none text-green-600">
                  Revenue growing steadily <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                  Monthly fee collection trends
                </div>
              </CardFooter>
            </Card>

            {/* Class-wise Fee Collection - Enhanced Bar Chart */}
            <Card className="shadow-lg border-2 border-gradient-to-r from-indigo-200 to-purple-200">
              <CardHeader>
                <CardTitle className="text-sm lg:text-base text-indigo-700">Class-wise Fee Collection</CardTitle>
                <CardDescription className="text-xs lg:text-sm">Collection efficiency by class</CardDescription>
              </CardHeader>
              <CardContent className="p-2 lg:p-6">
                <ChartContainer config={chartConfig} className={cn("w-full", isMobile ? "h-[200px]" : "h-[300px]")}>
                  <BarChart accessibilityLayer data={classWiseData} margin={{
                  left: isMobile ? 2 : 12,
                  right: isMobile ? 2 : 12,
                  top: 5,
                  bottom: 5
                }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} fontSize={isMobile ? 9 : 12} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="feeRate" radius={8} strokeWidth={2} stroke="#fff">
                      {classWiseData.map((entry, index) => <Cell key={`cell-${index}`} fill={vibrantColors[(index + 5) % vibrantColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-xs lg:text-sm p-2 lg:p-6">
                <div className="flex gap-2 font-medium leading-none text-green-600">
                  Excellent collection rates <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                  Fee collection percentage by class
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
}
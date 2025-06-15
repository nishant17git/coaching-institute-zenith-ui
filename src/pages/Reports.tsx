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
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, RadialBar, RadialBarChart, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts";
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
    color: "#FF3B82" // Bright pink
  },
  attendance: {
    label: "Attendance",
    color: "#00D9FF" // Electric cyan
  },
  fees: {
    label: "Fees",
    color: "#7C3AED" // Vibrant purple
  },
  collection: {
    label: "Collection Rate",
    color: "#F59E0B" // Bright amber
  },
  paid: {
    label: "Paid",
    color: "#10B981" // Emerald green
  },
  pending: {
    label: "Pending",
    color: "#F97316" // Vibrant orange
  },
  partial: {
    label: "Partial",
    color: "#8B5CF6" // Medium purple
  },
  excellent: {
    label: "Excellent (90%+)",
    color: "#22C55E" // Green
  },
  good: {
    label: "Good (80-89%)",
    color: "#3B82F6" // Blue
  },
  average: {
    label: "Average (70-79%)",
    color: "#F59E0B" // Amber
  },
  poor: {
    label: "Poor (<70%)",
    color: "#EF4444" // Red
  },
  class2: {
    label: "Class 2",
    color: "#FF3B82"
  },
  class3: {
    label: "Class 3",
    color: "#00D9FF"
  },
  class4: {
    label: "Class 4",
    color: "#7C3AED"
  },
  class5: {
    label: "Class 5",
    color: "#F59E0B"
  },
  class6: {
    label: "Class 6",
    color: "#10B981"
  },
  class7: {
    label: "Class 7",
    color: "#F97316"
  },
  class8: {
    label: "Class 8",
    color: "#8B5CF6"
  },
  class9: {
    label: "Class 9",
    color: "#06B6D4"
  }
} satisfies ChartConfig;

// Enhanced vibrant colors array for dynamic charts
const vibrantColors = ["#FF3B82", "#00D9FF", "#7C3AED", "#F59E0B", "#10B981", "#F97316", "#8B5CF6", "#06B6D4", "#EC4899", "#3B82F6", "#22C55E", "#EF4444", "#F59E0B", "#8B5CF6", "#00D9FF"];
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
      const transactionDate = new Date(t.payment_date);
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
    fill: "#10B981"
  }, {
    name: "Pending",
    value: students.filter(s => s.fee_status === "Pending").length,
    fill: "#F97316"
  }, {
    name: "Partial",
    value: students.filter(s => s.fee_status === "Partial").length,
    fill: "#8B5CF6"
  }];

  // Attendance distribution with fill colors
  const attendanceDistribution = [{
    name: "Excellent",
    value: students.filter(s => (s.attendance_percentage || 0) >= 90).length,
    fill: "#22C55E"
  }, {
    name: "Good",
    value: students.filter(s => (s.attendance_percentage || 0) >= 80 && (s.attendance_percentage || 0) < 90).length,
    fill: "#3B82F6"
  }, {
    name: "Average",
    value: students.filter(s => (s.attendance_percentage || 0) >= 70 && (s.attendance_percentage || 0) < 80).length,
    fill: "#F59E0B"
  }, {
    name: "Poor",
    value: students.filter(s => (s.attendance_percentage || 0) < 70).length,
    fill: "#EF4444"
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
    return <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-6 animate-fade-in max-w-7xl">
          <EnhancedPageHeader title="Analytics Dashboard" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-6 animate-fade-in max-w-7xl py-0 px-0">
        <EnhancedPageHeader title="Analytics Dashboard" showBackButton />

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard title="Total Students" value={totalStudents.toString()} description="Active enrollments" trend={{
          value: 5,
          isPositive: true
        }} icon={<Users className="h-4 w-4" />} className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200" />
          <StatCard title="Attendance Rate" value={`${averageAttendance}%`} description="Average attendance" trend={{
          value: 2,
          isPositive: true
        }} icon={<Calendar className="h-4 w-4" />} className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200" />
          <StatCard title="Fee Collection" value={`₹${totalFeesCollected.toLocaleString()}`} description="Total collected" trend={{
          value: 8,
          isPositive: true
        }} icon={<CreditCard className="h-4 w-4" />} className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200" />
          <StatCard title="Collection Rate" value={`${collectionRate}%`} description="Payment efficiency" trend={{
          value: 5,
          isPositive: true
        }} icon={<Target className="h-4 w-4" />} className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200" />
        </div>

        {/* Analytics Filters */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-slate-50 to-gray-50">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
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

        {/* Enhanced Tabs - Mobile Optimized */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/30 p-1 h-auto rounded-xl">
            <TabsTrigger value="overview" className={cn("flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium transition-all rounded-lg", isMobile ? "flex-col gap-1 py-2" : "gap-2")}>
              <BarChart3 className="h-4 w-4 shrink-0" />
              {!isMobile && <span>Overview</span>}
            </TabsTrigger>
            <TabsTrigger value="students" className={cn("flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium transition-all rounded-lg", isMobile ? "flex-col gap-1 py-2" : "gap-2")}>
              <Users className="h-4 w-4 shrink-0" />
              {!isMobile && <span>Students</span>}
            </TabsTrigger>
            <TabsTrigger value="attendance" className={cn("flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium transition-all rounded-lg", isMobile ? "flex-col gap-1 py-2" : "gap-2")}>
              <Calendar className="h-4 w-4 shrink-0" />
              {!isMobile && <span>Attendance</span>}
            </TabsTrigger>
            <TabsTrigger value="fees" className={cn("flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium transition-all rounded-lg", isMobile ? "flex-col gap-1 py-2" : "gap-2")}>
              <CreditCard className="h-4 w-4 shrink-0" />
              {!isMobile && <span>Finances</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Performance Trends */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Performance Trends
                </CardTitle>
                <CardDescription>Multi-metric analysis over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="w-full h-[300px] lg:h-[350px]">
                  <ChartContainer config={chartConfig}>
                    <AreaChart data={last6Months} margin={{
                    left: isMobile ? 12 : 20,
                    right: isMobile ? 12 : 20,
                    top: 20,
                    bottom: 20
                  }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={isMobile ? 10 : 12} tick={{
                      fill: '#64748B'
                    }} />
                      <YAxis tickLine={false} axisLine={false} fontSize={isMobile ? 10 : 12} tick={{
                      fill: '#64748B'
                    }} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <defs>
                        <linearGradient id="fillFees" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="fillAttendance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Area dataKey="attendance" type="monotone" fill="url(#fillAttendance)" fillOpacity={0.6} stroke="#00D9FF" strokeWidth={2} stackId="a" />
                      <Area dataKey="fees" type="monotone" fill="url(#fillFees)" fillOpacity={0.6} stroke="#7C3AED" strokeWidth={2} stackId="a" />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex w-full items-start gap-2 text-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 font-medium leading-none text-green-600">
                      Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 leading-none text-muted-foreground">
                      Last 6 months performance data
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Class Performance */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Class Performance
                  </CardTitle>
                  <CardDescription>Student distribution by class</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full h-[250px] lg:h-[280px]">
                    <ChartContainer config={chartConfig}>
                      <BarChart data={classWiseData} layout="vertical" margin={{
                      left: isMobile ? -15 : -20,
                      right: 15,
                      top: 10,
                      bottom: 10
                    }}>
                        <XAxis type="number" dataKey="students" hide />
                        <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} fontSize={isMobile ? 10 : 12} tick={{
                        fill: '#64748B'
                      }} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="students" radius={4}>
                          {classWiseData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none text-green-600">
                      Strong performance across classes <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                      Current enrollment distribution
                    </div>
                  </div>
                </CardFooter>
              </Card>

              {/* Fee Status Distribution */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
                <CardHeader className="items-center pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Fee Payment Status
                  </CardTitle>
                  <CardDescription>Current payment distribution</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full h-[200px] lg:h-[230px] flex justify-center">
                    <ChartContainer config={chartConfig}>
                      <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie data={feeStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={isMobile ? 70 : 85} strokeWidth={3} stroke="#fff">
                          {feeStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 font-medium leading-none text-green-600">
                      Fee collection improving <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                      Payment status across all students
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Class Distribution */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-red-50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-red-800">Class Distribution</CardTitle>
                  <CardDescription>Student enrollment by class</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full h-[250px] lg:h-[280px]">
                    <ChartContainer config={chartConfig}>
                      <AreaChart data={classWiseData} margin={{
                      left: isMobile ? 12 : 20,
                      right: isMobile ? 12 : 20,
                      top: 20,
                      bottom: 20
                    }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#FEE2E2" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={isMobile ? 10 : 12} tick={{
                        fill: '#64748B'
                      }} />
                        <YAxis tickLine={false} axisLine={false} fontSize={isMobile ? 10 : 12} tick={{
                        fill: '#64748B'
                      }} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <defs>
                          <linearGradient id="fillStudents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF3B82" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#FF3B82" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <Area dataKey="students" type="monotone" fill="url(#fillStudents)" fillOpacity={0.6} stroke="#FF3B82" strokeWidth={2} />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none text-green-600">
                      Balanced enrollment <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                      Current academic year enrollment
                    </div>
                  </div>
                </CardFooter>
              </Card>

              {/* Attendance Distribution */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
                <CardHeader className="items-center pb-4">
                  <CardTitle className="text-lg text-purple-800">Attendance Performance</CardTitle>
                  <CardDescription>Student performance categories</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full h-[200px] lg:h-[230px] flex justify-center">
                    <ChartContainer config={chartConfig}>
                      <RadialBarChart data={attendanceDistribution} innerRadius={isMobile ? 30 : 40} outerRadius={isMobile ? 80 : 100} cx="50%" cy="50%">
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="name" />} />
                        <RadialBar dataKey="value" background cornerRadius={6}>
                          {attendanceDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                        </RadialBar>
                      </RadialBarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 font-medium leading-none text-green-600">
                      Excellent attendance overall <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                      Performance distribution
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            {/* Attendance Analytics */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-teal-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-teal-800">Attendance Analytics</CardTitle>
                <CardDescription>Detailed attendance patterns and insights</CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="w-full h-[300px] lg:h-[350px]">
                  <ChartContainer config={chartConfig}>
                    <LineChart data={classWiseData} margin={{
                    left: isMobile ? 12 : 20,
                    right: isMobile ? 12 : 20,
                    top: 20,
                    bottom: 20
                  }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F0FDFA" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={isMobile ? 10 : 12} tick={{
                      fill: '#64748B'
                    }} />
                      <YAxis tickLine={false} axisLine={false} fontSize={isMobile ? 10 : 12} tick={{
                      fill: '#64748B'
                    }} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Line dataKey="attendance" type="monotone" stroke="#00D9FF" strokeWidth={3} dot={{
                      fill: "#00D9FF",
                      strokeWidth: 2,
                      r: 5
                    }} activeDot={{
                      r: 7,
                      fill: "#0891B2"
                    }} />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex-col items-start gap-2 text-sm">
                  <div className="flex gap-2 font-medium leading-none text-green-600">
                    Consistent attendance patterns <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="leading-none text-muted-foreground">
                    Class-wise attendance trends
                  </div>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="fees" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Fee Collection */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-yellow-50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-yellow-800">Monthly Collection</CardTitle>
                  <CardDescription>Revenue trends over time</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full h-[250px] lg:h-[280px]">
                    <ChartContainer config={chartConfig}>
                      <AreaChart data={last6Months} margin={{
                      left: isMobile ? 12 : 20,
                      right: isMobile ? 12 : 20,
                      top: 20,
                      bottom: 20
                    }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#FEF3C7" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={isMobile ? 10 : 12} tick={{
                        fill: '#64748B'
                      }} />
                        <YAxis tickLine={false} axisLine={false} fontSize={isMobile ? 10 : 12} tick={{
                        fill: '#64748B'
                      }} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <defs>
                          <linearGradient id="fillFeesOnly" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <Area dataKey="fees" type="monotone" fill="url(#fillFeesOnly)" fillOpacity={0.6} stroke="#F59E0B" strokeWidth={2} />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none text-green-600">
                      Revenue growing steadily <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                      Monthly collection trends
                    </div>
                  </div>
                </CardFooter>
              </Card>

              {/* Class-wise Fee Collection */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-indigo-800">Class-wise Collection</CardTitle>
                  <CardDescription>Collection efficiency by class</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full h-[250px] lg:h-[280px]">
                    <ChartContainer config={chartConfig}>
                      <BarChart data={classWiseData} margin={{
                      left: isMobile ? 12 : 20,
                      right: isMobile ? 12 : 20,
                      top: 20,
                      bottom: 20
                    }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E0E7FF" />
                        <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} fontSize={isMobile ? 10 : 12} tick={{
                        fill: '#64748B'
                      }} />
                        <YAxis tickLine={false} axisLine={false} fontSize={isMobile ? 10 : 12} tick={{
                        fill: '#64748B'
                      }} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="feeRate" radius={6} strokeWidth={2} stroke="#fff">
                          {classWiseData.map((entry, index) => <Cell key={`cell-${index}`} fill={vibrantColors[(index + 5) % vibrantColors.length]} />)}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none text-green-600">
                      Excellent collection rates <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                      Fee collection percentage by class
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}

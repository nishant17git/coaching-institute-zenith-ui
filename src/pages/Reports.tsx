
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
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, XAxis, YAxis, Cell, Legend } from "recharts";
import { Download, TrendingUp, Users, DollarSign, BookOpen, Calendar, Filter, Activity, BarChart3, CreditCard, Target, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

// Enhanced chart configuration with vibrant, bright colors
const chartConfig = {
  students: {
    label: "Students",
    color: "hsl(217, 91%, 60%)", // Bright blue
  },
  attendance: {
    label: "Attendance",
    color: "hsl(142, 76%, 36%)", // Bright green
  },
  fees: {
    label: "Fees",
    color: "hsl(271, 81%, 56%)", // Bright purple
  },
  collection: {
    label: "Collection Rate",
    color: "hsl(25, 95%, 53%)", // Bright orange
  },
  paid: {
    label: "Paid",
    color: "hsl(142, 76%, 36%)", // Bright green
  },
  pending: {
    label: "Pending",
    color: "hsl(48, 96%, 53%)", // Bright yellow
  },
  partial: {
    label: "Partial",
    color: "hsl(25, 95%, 53%)", // Bright orange
  },
  excellent: {
    label: "Excellent (90%+)",
    color: "hsl(142, 76%, 36%)", // Bright green
  },
  good: {
    label: "Good (80-89%)",
    color: "hsl(217, 91%, 60%)", // Bright blue
  },
  average: {
    label: "Average (70-79%)",
    color: "hsl(48, 96%, 53%)", // Bright yellow
  },
  poor: {
    label: "Poor (<70%)",
    color: "hsl(0, 84%, 60%)", // Bright red
  },
  feeRate: {
    label: "Fee Collection Rate",
    color: "hsl(25, 95%, 53%)", // Bright orange
  },
  month: {
    label: "Month",
    color: "hsl(217, 91%, 60%)", // Bright blue
  },
  target: {
    label: "Target",
    color: "hsl(142, 76%, 36%)", // Bright green
  }
} satisfies ChartConfig;

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
      const { data, error } = await supabase.from('students').select('*');
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
      const { data, error } = await supabase.from('attendance_records').select('*');
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
      const { data, error } = await supabase.from('fee_transactions').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Data processing
  const totalStudents = students.length;
  const averageAttendance = students.length > 0 ? Math.round(students.reduce((sum, s) => sum + (s.attendance_percentage || 0), 0) / students.length) : 0;
  const totalFeesCollected = feeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalFeesExpected = students.reduce((sum, s) => sum + (s.total_fees || 0), 0);
  const collectionRate = totalFeesExpected > 0 ? Math.round(totalFeesCollected / totalFeesExpected * 100) : 0;

  // Class-wise data
  const classWiseData = Array.from({ length: 8 }, (_, i) => {
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
    };
  }).filter(item => item.students > 0);

  // Monthly trends data
  const last6Months = Array.from({ length: 6 }, (_, i) => {
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

  // Fee status distribution with bright colors
  const feeStatusData = [
    { name: "Paid", value: students.filter(s => s.fee_status === "Paid").length, fill: "hsl(142, 76%, 36%)" },
    { name: "Pending", value: students.filter(s => s.fee_status === "Pending").length, fill: "hsl(48, 96%, 53%)" },
    { name: "Partial", value: students.filter(s => s.fee_status === "Partial").length, fill: "hsl(25, 95%, 53%)" }
  ];

  // Attendance distribution with bright colors
  const attendanceDistribution = [
    { name: "Excellent", value: students.filter(s => (s.attendance_percentage || 0) >= 90).length, fill: "hsl(142, 76%, 36%)" },
    { name: "Good", value: students.filter(s => (s.attendance_percentage || 0) >= 80 && (s.attendance_percentage || 0) < 90).length, fill: "hsl(217, 91%, 60%)" },
    { name: "Average", value: students.filter(s => (s.attendance_percentage || 0) >= 70 && (s.attendance_percentage || 0) < 80).length, fill: "hsl(48, 96%, 53%)" },
    { name: "Poor", value: students.filter(s => (s.attendance_percentage || 0) < 70).length, fill: "hsl(0, 84%, 60%)" }
  ];

  const exportReport = () => {
    try {
      const reportData = {
        overview: { totalStudents, averageAttendance, totalFeesCollected, collectionRate },
        classWise: classWiseData,
        trends: last6Months,
        timestamp: new Date().toISOString()
      };
      
      const csvContent = `Analytics Report\n\nOverview\nTotal Students,${totalStudents}\nAverage Attendance,${averageAttendance}%\nTotal Fees Collected,₹${totalFeesCollected.toLocaleString()}\nCollection Rate,${collectionRate}%\n\nClass-wise Data\n${classWiseData.map(c => `${c.name},${c.students} students,${c.attendance}% attendance,₹${c.fees.toLocaleString()} collected`).join('\n')}\n\nGenerated,${format(new Date(), 'dd/MM/yyyy HH:mm')}`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
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
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-6 animate-fade-in max-w-7xl">
          <EnhancedPageHeader title="Analytics Dashboard" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed header position */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <EnhancedPageHeader title="Analytics Dashboard" showBackButton />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-6">
          {/* Key Metrics Cards - Mobile First */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Students" 
              value={totalStudents.toString()} 
              description="Active enrollments" 
              trend={{ value: 5, isPositive: true }} 
              icon={<Users className="h-4 w-4" />} 
              className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200" 
            />
            <StatCard 
              title="Attendance Rate" 
              value={`${averageAttendance}%`} 
              description="Average attendance" 
              trend={{ value: 2, isPositive: true }} 
              icon={<Calendar className="h-4 w-4" />} 
              className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200" 
            />
            <StatCard 
              title="Fee Collection" 
              value={`₹${totalFeesCollected.toLocaleString()}`} 
              description="Total collected" 
              trend={{ value: 8, isPositive: true }} 
              icon={<CreditCard className="h-4 w-4" />} 
              className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200" 
            />
            <StatCard 
              title="Collection Rate" 
              value={`${collectionRate}%`} 
              description="Payment efficiency" 
              trend={{ value: 5, isPositive: true }} 
              icon={<Target className="h-4 w-4" />} 
              className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200" 
            />
          </div>

          {/* Analytics Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Filter className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Analytics Filters</h3>
                    <p className="text-sm text-gray-600">Customize your data view</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
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
                      {Array.from({ length: 8 }, (_, i) => (
                        <SelectItem key={i + 2} value={(i + 2).toString()}>
                          Class {i + 2}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={exportReport} variant="outline" className="gap-2 w-full sm:w-auto">
                    <Download className="h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Tabs with horizontal layout */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {!isMobile && <span>Overview</span>}
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {!isMobile && <span>Students</span>}
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {!isMobile && <span>Attendance</span>}
              </TabsTrigger>
              <TabsTrigger value="finances" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {!isMobile && <span>Finances</span>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Performance Trends Area Chart */}
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-900">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Performance Trends
                  </CardTitle>
                  <CardDescription className="text-gray-600">Multi-metric analysis over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full">
                    <ChartContainer config={chartConfig} className={cn("w-full", isMobile ? "h-[200px]" : "h-[280px]")}>
                      <AreaChart
                        data={last6Months}
                        margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tickFormatter={(value) => value.slice(0, 3)}
                          className="text-gray-600"
                          fontSize={isMobile ? 10 : 12}
                        />
                        <YAxis 
                          tickLine={false} 
                          axisLine={false} 
                          className="text-gray-600" 
                          fontSize={isMobile ? 10 : 12}
                          width={isMobile ? 30 : 40}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <defs>
                          <linearGradient id="fillAttendance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="fillFees" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(271, 81%, 56%)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(271, 81%, 56%)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <Area
                          dataKey="attendance"
                          type="natural"
                          fill="url(#fillAttendance)"
                          fillOpacity={0.4}
                          stroke="hsl(142, 76%, 36%)"
                          strokeWidth={2}
                        />
                        <Area
                          dataKey="fees"
                          type="natural"
                          fill="url(#fillFees)"
                          fillOpacity={0.4}
                          stroke="hsl(271, 81%, 56%)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 font-medium leading-none text-green-600">
                        Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2 leading-none text-gray-600">
                        Last 6 months performance data
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Class Performance Bar Chart */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-900">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      Class Performance
                    </CardTitle>
                    <CardDescription className="text-gray-600">Student distribution by class</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="w-full">
                      <ChartContainer config={chartConfig} className={cn("w-full", isMobile ? "h-[180px]" : "h-[200px]")}>
                        <BarChart 
                          data={classWiseData} 
                          margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
                        >
                          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.replace("Class ", "C")}
                            className="text-gray-600"
                            fontSize={isMobile ? 10 : 12}
                          />
                          <YAxis 
                            tickLine={false} 
                            axisLine={false} 
                            className="text-gray-600" 
                            fontSize={isMobile ? 10 : 12}
                            width={isMobile ? 25 : 35}
                          />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Bar dataKey="students" fill="hsl(217, 91%, 60%)" radius={6} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none text-green-600">
                      Strong performance across classes <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-gray-600">
                      Current enrollment distribution
                    </div>
                  </CardFooter>
                </Card>

                {/* Fee Status Pie Chart */}
                <Card className="shadow-sm border-0 flex flex-col">
                  <CardHeader className="items-center pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-900">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      Fee Payment Status
                    </CardTitle>
                    <CardDescription className="text-gray-600">Current payment distribution</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pb-6">
                    <div className="w-full flex justify-center">
                      <ChartContainer config={chartConfig} className={cn("w-full", isMobile ? "h-[180px] max-w-[200px]" : "h-[200px] max-w-[250px]")}>
                        <PieChart>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Pie 
                            data={feeStatusData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={isMobile ? 60 : 80} 
                          />
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 font-medium leading-none text-green-600">
                      Fee collection improving <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-gray-600">
                      Payment status across all students
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Class Distribution Area Chart */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl text-gray-900">Class Distribution</CardTitle>
                    <CardDescription className="text-gray-600">Student enrollment by class</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="w-full">
                      <ChartContainer config={chartConfig} className={cn("w-full", isMobile ? "h-[200px]" : "h-[220px]")}>
                        <AreaChart
                          data={classWiseData}
                          margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
                        >
                          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.replace("Class ", "C")}
                            className="text-gray-600"
                            fontSize={isMobile ? 10 : 12}
                          />
                          <YAxis 
                            tickLine={false} 
                            axisLine={false} 
                            className="text-gray-600" 
                            fontSize={isMobile ? 10 : 12}
                            width={isMobile ? 30 : 40}
                          />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <defs>
                            <linearGradient id="fillStudents" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <Area
                            dataKey="students"
                            type="natural"
                            fill="url(#fillStudents)"
                            fillOpacity={0.4}
                            stroke="hsl(217, 91%, 60%)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none text-green-600">
                      Balanced enrollment <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-gray-600">
                      Current academic year enrollment
                    </div>
                  </CardFooter>
                </Card>

                {/* Attendance Distribution Pie Chart */}
                <Card className="shadow-sm border-0 flex flex-col">
                  <CardHeader className="items-center pb-4">
                    <CardTitle className="text-lg sm:text-xl text-gray-900">Attendance Performance</CardTitle>
                    <CardDescription className="text-gray-600">Student performance categories</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pb-6">
                    <div className="w-full flex justify-center">
                      <ChartContainer config={chartConfig} className={cn("w-full", isMobile ? "h-[200px] max-w-[200px]" : "h-[220px] max-w-[250px]")}>
                        <PieChart>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Pie 
                            data={attendanceDistribution} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={isMobile ? 60 : 80} 
                          />
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 font-medium leading-none text-green-600">
                      Excellent attendance overall <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-gray-600">
                      Performance distribution
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-6">
              {/* Attendance Analytics Line Chart */}
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl text-gray-900">Attendance Analytics</CardTitle>
                  <CardDescription className="text-gray-600">Detailed attendance patterns and insights</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="w-full">
                    <ChartContainer config={chartConfig} className={cn("w-full", isMobile ? "h-[220px]" : "h-[300px]")}>
                      <LineChart
                        data={classWiseData}
                        margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tickFormatter={(value) => value.replace("Class ", "C")}
                          className="text-gray-600"
                          fontSize={isMobile ? 10 : 12}
                        />
                        <YAxis 
                          tickLine={false} 
                          axisLine={false} 
                          className="text-gray-600" 
                          fontSize={isMobile ? 10 : 12}
                          width={isMobile ? 30 : 40}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Line
                          dataKey="attendance"
                          type="natural"
                          stroke="hsl(142, 76%, 36%)"
                          strokeWidth={3}
                          dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 2, r: isMobile ? 3 : 4 }}
                          activeDot={{ r: isMobile ? 5 : 6, stroke: "hsl(142, 76%, 36%)", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="flex gap-2 font-medium leading-none text-green-600">
                    Consistent attendance patterns <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="leading-none text-gray-600">
                    Class-wise attendance trends
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="finances" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Fee Collection Area Chart */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl text-gray-900">Monthly Collection</CardTitle>
                    <CardDescription className="text-gray-600">Revenue trends over time</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="w-full">
                      <ChartContainer config={chartConfig} className={cn("w-full", isMobile ? "h-[200px]" : "h-[220px]")}>
                        <AreaChart
                          data={last6Months}
                          margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
                        >
                          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                            className="text-gray-600"
                            fontSize={isMobile ? 10 : 12}
                          />
                          <YAxis 
                            tickLine={false} 
                            axisLine={false} 
                            className="text-gray-600" 
                            fontSize={isMobile ? 10 : 12}
                            width={isMobile ? 30 : 40}
                          />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <defs>
                            <linearGradient id="fillFeesOnly" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(271, 81%, 56%)" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="hsl(271, 81%, 56%)" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <Area
                            dataKey="fees"
                            type="natural"
                            fill="url(#fillFeesOnly)"
                            fillOpacity={0.4}
                            stroke="hsl(271, 81%, 56%)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none text-green-600">
                      Revenue growing steadily <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-gray-600">
                      Monthly collection trends
                    </div>
                  </CardFooter>
                </Card>

                {/* Class-wise Fee Collection Bar Chart */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl text-gray-900">Class-wise Collection</CardTitle>
                    <CardDescription className="text-gray-600">Collection efficiency by class</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="w-full">
                      <ChartContainer config={chartConfig} className={cn("w-full", isMobile ? "h-[200px]" : "h-[220px]")}>
                        <BarChart 
                          data={classWiseData}
                          margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
                        >
                          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.replace("Class ", "C")}
                            className="text-gray-600"
                            fontSize={isMobile ? 10 : 12}
                          />
                          <YAxis 
                            tickLine={false} 
                            axisLine={false} 
                            className="text-gray-600" 
                            fontSize={isMobile ? 10 : 12}
                            width={isMobile ? 25 : 35}
                          />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Bar dataKey="feeRate" fill="hsl(25, 95%, 53%)" radius={6} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none text-green-600">
                      Excellent collection rates <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-gray-600">
                      Fee collection percentage by class
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

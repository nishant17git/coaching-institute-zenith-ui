import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Download, TrendingUp, CreditCard, Users, Calendar, 
  ChevronDown, InfoIcon, PieChart as PieChartIcon, 
  BarChart2, LineChart as LineChartIcon
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { monthlyFeeCollections, monthlyAttendance, classDistribution } from "@/mock/data";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { exportReportToPDF, type ReportPDFOptions } from "@/services/pdfService";
import { motion } from "framer-motion";

// Logo placeholder
const INSTITUTE_LOGO = "https://placehold.co/200x200/4F46E5/FFFFFF?text=IC";

export default function Reports() {
  const COLORS = ["#0A84FF", "#30D158", "#5E5CE6", "#FF9F0A", "#FF453A", "#BF5AF2", "#64D2FF"];
  const [activeTab, setActiveTab] = useState("fees");
  const [timeRange, setTimeRange] = useState("year");
  const [selectedClass, setSelectedClass] = useState("all");
  const [chartType, setChartType] = useState<"bar" | "line" | "area" | "pie">("area");
  
  const feeChartRef = useRef<HTMLDivElement>(null);
  const attendanceChartRef = useRef<HTMLDivElement>(null);
  const studentChartRef = useRef<HTMLDivElement>(null);
  const insightChartRef = useRef<HTMLDivElement>(null);
  
  // Enhanced data for insights
  const classPerformanceData = [
    { subject: "Math", "Class 9": 85, "Class 10": 78, "Class 11-S": 92, "Class 12-S": 88 },
    { subject: "Science", "Class 9": 78, "Class 10": 82, "Class 11-S": 88, "Class 12-S": 92 },
    { subject: "English", "Class 9": 82, "Class 10": 85, "Class 11-S": 80, "Class 12-S": 85 },
    { subject: "Social Studies", "Class 9": 75, "Class 10": 70, "Class 11-S": 65, "Class 12-S": 75 },
    { subject: "Languages", "Class 9": 88, "Class 10": 90, "Class 11-S": 82, "Class 12-S": 80 }
  ];
  
  const feeRecoveryTrend = [
    { month: "Apr", target: 100000, collected: 85000 },
    { month: "May", target: 100000, collected: 92000 },
    { month: "Jun", target: 100000, collected: 88000 },
    { month: "Jul", target: 100000, collected: 95000 },
    { month: "Aug", target: 100000, collected: 85000 },
    { month: "Sep", target: 100000, collected: 92000 },
    { month: "Oct", target: 100000, collected: 97000 }
  ];
  
  // Export current report as PDF
  const exportReport = async () => {
    let chartImages: string[] = [];
    let title = "Report";
    let summary: { label: string, value: string }[] = [];
    
    if (activeTab === "fees") {
      title = "Fee Collection Report";
      summary = [
        { label: "Time Period", value: timeRange === "year" ? "Annual" : "Last 6 Months" },
        { label: "Total Collection", value: "₹" + monthlyFeeCollections.reduce((sum, month) => sum + month.amount, 0).toLocaleString() },
        { label: "Collection Rate", value: "75%" },
        { label: "Outstanding Amount", value: "₹80,000" }
      ];
      
      if (feeChartRef.current) {
        try {
          const canvas = await html2canvas(feeChartRef.current);
          chartImages.push(canvas.toDataURL("image/png"));
        } catch (error) {
          console.error("Failed to capture chart:", error);
        }
      }
      
      if (insightChartRef.current) {
        try {
          const canvas = await html2canvas(insightChartRef.current);
          chartImages.push(canvas.toDataURL("image/png"));
        } catch (error) {
          console.error("Failed to capture chart:", error);
        }
      }
    } 
    else if (activeTab === "attendance") {
      title = "Attendance Report";
      summary = [
        { label: "Time Period", value: timeRange === "year" ? "Annual" : "Last 6 Months" },
        { label: "Average Attendance", value: "85%" },
        { label: "Present Days", value: "85%" },
        { label: "Absent Days", value: "10%" },
        { label: "Leave Days", value: "5%" }
      ];
      
      if (attendanceChartRef.current) {
        try {
          const canvas = await html2canvas(attendanceChartRef.current);
          chartImages.push(canvas.toDataURL("image/png"));
        } catch (error) {
          console.error("Failed to capture chart:", error);
        }
      }
    }
    else if (activeTab === "students") {
      title = "Student Distribution Report";
      summary = [
        { label: "Total Students", value: classDistribution.reduce((sum, item) => sum + item.value, 0).toString() },
        { label: "Most Populated Class", value: "Class 10" },
        { label: "Average Attendance", value: "87%" },
        { label: "Average Fee Collection", value: "82%" }
      ];
      
      if (studentChartRef.current) {
        try {
          const canvas = await html2canvas(studentChartRef.current);
          chartImages.push(canvas.toDataURL("image/png"));
        } catch (error) {
          console.error("Failed to capture chart:", error);
        }
      }
    }
    else if (activeTab === "insights") {
      title = "Academic Insights Report";
      summary = [
        { label: "Best Performing Class", value: "Class 11-S" },
        { label: "Best Subject", value: "Mathematics" },
        { label: "Improvement Areas", value: "Social Studies" },
        { label: "Overall Performance", value: "Good" }
      ];
      
      if (insightChartRef.current) {
        try {
          const canvas = await html2canvas(insightChartRef.current);
          chartImages.push(canvas.toDataURL("image/png"));
        } catch (error) {
          console.error("Failed to capture chart:", error);
        }
      }
    }
    
    const options: ReportPDFOptions = {
      title,
      chartImages,
      summary,
      instituteName: "Infinity Classes",
      logo: INSTITUTE_LOGO
    };
    
    exportReportToPDF(options);
    
    toast.success("Report exported successfully!");
  };
  
  // Render chart based on selected chart type
  const renderFeeChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyFeeCollections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`₹${value}`, "Amount"]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Bar 
                dataKey="amount" 
                name="Fee Collection" 
                fill="#0A84FF" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyFeeCollections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`₹${value}`, "Amount"]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                name="Fee Collection" 
                stroke="#0A84FF"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case "pie":
        // Transform data for pie chart
        const pieData = monthlyFeeCollections.map(item => ({
          name: item.month,
          value: item.amount
        }));
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`₹${value}`, "Amount"]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case "area":
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyFeeCollections}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0A84FF" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`₹${value}`, "Amount"]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="amount" 
                name="Fee Collection" 
                stroke="#0A84FF" 
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };
  
  // Render attendance chart based on selected chart type
  const renderAttendanceChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyAttendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value) => [`${value}%`, "Attendance"]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Bar 
                dataKey="attendance" 
                name="Attendance" 
                fill="#30D158" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyAttendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value) => [`${value}%`, "Attendance"]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="attendance"
                name="Attendance Percentage"
                stroke="#30D158"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case "pie":
        // Transform data for pie chart
        const pieData = monthlyAttendance.map(item => ({
          name: item.month,
          value: item.attendance
        }));
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, "Attendance"]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case "area":
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyAttendance}>
              <defs>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#30D158" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#30D158" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value) => [`${value}%`, "Attendance"]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="attendance"
                name="Attendance Percentage"
                stroke="#30D158"
                fillOpacity={1}
                fill="url(#colorAttendance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="year">Annual</SelectItem>
              <SelectItem value="half">Last 6 Months</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="bg-apple-blue hover:bg-blue-600 text-white" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue="fees" 
        value={activeTab}
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList className="flex w-full overflow-x-auto p-0.5 glass-effect">
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Fee Collection</span>
            <span className="inline sm:hidden">Fees</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Attendance</span>
            <span className="inline sm:hidden">Attend</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Students</span>
            <span className="inline sm:hidden">Students</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Academic Insights</span>
            <span className="inline sm:hidden">Insights</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Visualization Type Selector */}
        <div className="flex justify-end">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={chartType === "area" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setChartType("area")}
            >
              <AreaChart className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" />
            <Button
              variant={chartType === "line" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setChartType("line")}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" />
            <Button
              variant={chartType === "bar" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setChartType("bar")}
            >
              <BarChart2 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" />
            <Button
              variant={chartType === "pie" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setChartType("pie")}
            >
              <PieChartIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="fees" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-6 flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Collection</p>
                  <h2 className="text-3xl font-bold">₹4,95,000</h2>
                  <p className="text-sm text-green-600">+8% from last month</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3 self-center">
                  <CreditCard className="h-5 w-5 text-apple-blue" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Collection Rate</p>
                  <h2 className="text-3xl font-bold">78%</h2>
                  <p className="text-sm text-green-600">+5% from last month</p>
                </div>
                <div className="rounded-full bg-green-100 p-3 self-center">
                  <TrendingUp className="h-5 w-5 text-apple-green" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Fees</p>
                  <h2 className="text-3xl font-bold">₹1,20,000</h2>
                  <p className="text-sm text-red-600">+2% from last month</p>
                </div>
                <div className="rounded-full bg-orange-100 p-3 self-center">
                  <InfoIcon className="h-5 w-5 text-apple-orange" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Students with Dues</p>
                  <h2 className="text-3xl font-bold">42</h2>
                  <p className="text-sm text-orange-600">-3% from last month</p>
                </div>
                <div className="rounded-full bg-red-100 p-3 self-center">
                  <Users className="h-5 w-5 text-apple-red" />
                </div>
              </CardContent>
            </Card>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card md:col-span-2">
              <CardHeader>
                <CardTitle>Fee Collection Trends</CardTitle>
                <CardDescription>
                  Monthly fee collection for the current year
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]" ref={feeChartRef}>
                {renderFeeChart()}
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Fee Collection by Payment Mode</CardTitle>
                <CardDescription>
                  Distribution of payment methods used
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Cash', value: 45 },
                        { name: 'Online', value: 40 },
                        { name: 'Cheque', value: 15 },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {[0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, "Percentage"]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="glass-card" ref={insightChartRef}>
              <CardHeader>
                <CardTitle>Fee Recovery Trend</CardTitle>
                <CardDescription>
                  Actual vs Target fee collection
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={feeRecoveryTrend}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`₹${value}`, ""]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="target" name="Target" fill="#BF5AF2" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="collected" name="Collected" fill="#30D158" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-6 flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Attendance</p>
                  <h2 className="text-3xl font-bold">87%</h2>
                  <p className="text-sm text-green-600">+2% from last month</p>
                </div>
                <div className="rounded-full bg-green-100 p-3 self-center">
                  <Users className="h-5 w-5 text-apple-green" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Present Days</p>
                  <h2 className="text-3xl font-bold">85%</h2>
                  <p className="text-sm text-green-600">+3% from last month</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3 self-center">
                  <Calendar className="h-5 w-5 text-apple-blue" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Absent Days</p>
                  <h2 className="text-3xl font-bold">10%</h2>
                  <p className="text-sm text-green-600">-1% from last month</p>
                </div>
                <div className="rounded-full bg-red-100 p-3 self-center">
                  <InfoIcon className="h-5 w-5 text-apple-red" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-6 flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Leave Days</p>
                  <h2 className="text-3xl font-bold">5%</h2>
                  <p className="text-sm text-gray-500">Same as last month</p>
                </div>
                <div className="rounded-full bg-orange-100 p-3 self-center">
                  <Calendar className="h-5 w-5 text-apple-orange" />
                </div>
              </CardContent>
            </Card>
          </div>
        
          <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>Average Monthly Attendance</CardTitle>
                  <CardDescription>
                    Attendance percentage over the months
                  </CardDescription>
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="class2">Class 2</SelectItem>
                    <SelectItem value="class3">Class 3</SelectItem>
                    <SelectItem value="class4">Class 4</SelectItem>
                    <SelectItem value="class5">Class 5</SelectItem>
                    <SelectItem value="class6">Class 6</SelectItem>
                    <SelectItem value="class7">Class 7</SelectItem>
                    <SelectItem value="class8">Class 8</SelectItem>
                    <SelectItem value="class9">Class 9</SelectItem>
                    <SelectItem value="class10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="h-[400px]" ref={attendanceChartRef}>
              {renderAttendanceChart()}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Attendance Distribution</CardTitle>
                <CardDescription>
                  Breakdown of daily attendance status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data

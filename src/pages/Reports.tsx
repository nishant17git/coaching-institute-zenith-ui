
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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
import { monthlyFeeCollections, monthlyAttendance, classDistribution } from "@/mock/data";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { exportReportToPDF } from "@/services/pdfService";

// Logo placeholder
const INSTITUTE_LOGO = "https://placehold.co/200x200/4F46E5/FFFFFF?text=IC";

export default function Reports() {
  const COLORS = ["#0A84FF", "#30D158", "#5E5CE6", "#FF9F0A", "#FF453A", "#BF5AF2", "#64D2FF"];
  const [activeTab, setActiveTab] = useState("fees");
  
  const feeChartRef = useRef<HTMLDivElement>(null);
  const attendanceChartRef = useRef<HTMLDivElement>(null);
  const studentChartRef = useRef<HTMLDivElement>(null);
  
  // Export current report as PDF
  const exportReport = async () => {
    let chartImages: string[] = [];
    let title = "Report";
    let summary: { label: string, value: string }[] = [];
    
    if (activeTab === "fees") {
      title = "Fee Collection Report";
      summary = [
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
    } 
    else if (activeTab === "attendance") {
      title = "Attendance Report";
      summary = [
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
    
    exportReportToPDF(
      title,
      chartImages,
      summary,
      "Infinity Classes",
      INSTITUTE_LOGO
    );
    
    toast.success("Report exported successfully!");
  };
  
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
        <Button className="bg-apple-blue hover:bg-blue-600" onClick={exportReport}>
          <Download className="h-4 w-4 mr-2" /> Export Reports
        </Button>
      </div>

      <Tabs 
        defaultValue="fees" 
        value={activeTab}
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="fees">Fee Collection</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fees" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card md:col-span-2">
              <CardHeader>
                <CardTitle>Fee Collection Trends</CardTitle>
                <CardDescription>
                  Monthly fee collection for the current year
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]" ref={feeChartRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyFeeCollections}>
                    <CartesianGrid strokeDasharray="3 3" />
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
                    <Bar dataKey="amount" name="Fee Collection" fill="#0A84FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Fee Recovery Rate</CardTitle>
                <CardDescription>
                  Percentage of fees collected vs outstanding
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Collected', value: 75 },
                        { name: 'Outstanding', value: 25 },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill={COLORS[1]} />
                      <Cell fill={COLORS[4]} />
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
          </div>
        </TabsContent>
        
        <TabsContent value="attendance" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Average Monthly Attendance</CardTitle>
              <CardDescription>
                Attendance percentage over the months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]" ref={attendanceChartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" />
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
                    stroke="#0A84FF"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
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
                      data={[
                        { name: 'Present', value: 85 },
                        { name: 'Absent', value: 10 },
                        { name: 'Leave', value: 5 },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#30D158" />
                      <Cell fill="#FF453A" />
                      <Cell fill="#FF9F0A" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Attendance by Class</CardTitle>
                <CardDescription>
                  Average attendance percentage by class
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Class 9', value: 92 },
                      { name: 'Class 10', value: 88 },
                      { name: 'Class 11 S', value: 85 },
                      { name: 'Class 12 S', value: 90 },
                      { name: 'Class 11 C', value: 82 },
                      { name: 'Class 12 C', value: 86 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />
                    <Bar dataKey="value" name="Attendance %" fill="#5E5CE6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="students" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Class-wise Student Distribution</CardTitle>
                <CardDescription>
                  Number of students in each class
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]" ref={studentChartRef}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {classDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} students`, ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Student Performance</CardTitle>
                <CardDescription>
                  Average performance metrics by class
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Class 9', attendance: 92, feesCompliance: 85 },
                      { name: 'Class 10', attendance: 88, feesCompliance: 90 },
                      { name: 'Class 11 S', attendance: 85, feesCompliance: 95 },
                      { name: 'Class 12 S', attendance: 90, feesCompliance: 85 },
                      { name: 'Class 11 C', attendance: 82, feesCompliance: 80 },
                      { name: 'Class 12 C', attendance: 86, feesCompliance: 75 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="attendance" name="Attendance %" fill="#0A84FF" />
                    <Bar dataKey="feesCompliance" name="Fees Compliance %" fill="#30D158" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Growth Trends</CardTitle>
              <CardDescription>
                Student enrollment over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: 'Jan', students: 98 },
                    { month: 'Feb', students: 110 },
                    { month: 'Mar', students: 115 },
                    { month: 'Apr', students: 120 },
                    { month: 'May', students: 118 },
                    { month: 'Jun', students: 125 },
                    { month: 'Jul', students: 124 },
                    { month: 'Aug', students: 130 },
                    { month: 'Sep', students: 135 },
                    { month: 'Oct', students: 140 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} students`, ""]} />
                  <Legend />
                  <Line type="monotone" dataKey="students" name="Total Students" stroke="#BF5AF2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

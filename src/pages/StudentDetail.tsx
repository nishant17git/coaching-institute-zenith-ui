
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, MessageSquare, MapPin, Clock, CreditCard, CalendarDays } from "lucide-react";
import { students, feeTransactions, attendanceRecords } from "@/mock/data";
import { 
  PieChart,
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Find student by ID
  const student = students.find((s) => s.id === id);
  
  // Get student fee transactions and attendance records
  const studentFees = feeTransactions.filter((fee) => fee.studentId === id);
  const studentAttendance = attendanceRecords.filter((record) => record.studentId === id);
  
  // Attendance data for pie chart
  const attendanceData = [
    { name: "Present", value: studentAttendance.filter((r) => r.status === "Present").length },
    { name: "Absent", value: studentAttendance.filter((r) => r.status === "Absent").length },
    { name: "Leave", value: studentAttendance.filter((r) => r.status === "Leave").length },
  ];
  
  const COLORS = ["#30D158", "#FF453A", "#FF9F0A"];
  
  // Monthly attendance percentage
  const calculateMonthlyAttendance = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, index) => {
      // Get all records for this month (simplified)
      const totalDays = 20; // Assuming ~20 school days per month
      const presentDays = Math.floor(student?.attendancePercentage! * totalDays / 100);
      return {
        month,
        percentage: student?.attendancePercentage || 0,
      };
    });
  };
  
  if (!student) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Student not found</h2>
          <Button variant="outline" onClick={() => navigate("/students")}>
            Back to Students
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/students")}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{student.name}'s Profile</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Info Card */}
        <Card className="glass-card md:col-span-1">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Class</span>
              <Badge variant="outline">{student.class}</Badge>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Father's Name</div>
              <div>{student.fatherName}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Mother's Name</div>
              <div>{student.motherName}</div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="flex gap-2">
                <Phone className="h-4 w-4" />
                Call
              </Button>
              <Button variant="outline" size="sm" className="flex gap-2">
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Address
              </div>
              <div>{student.address}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" /> Joined On
              </div>
              <div>{new Date(student.joinDate).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs for Fees and Attendance */}
        <Card className="glass-card md:col-span-2">
          <CardHeader className="pb-2">
            <Tabs defaultValue="fees">
              <TabsList>
                <TabsTrigger value="fees">Fees</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="fees" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm text-muted-foreground">Total Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-semibold">₹{student.totalFees.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm text-muted-foreground">Paid Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-semibold text-apple-green">
                        ₹{student.paidFees.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Fee Transactions</h3>
                  <div className="space-y-3">
                    {studentFees.map((fee) => (
                      <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{fee.purpose}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <CreditCard className="h-3 w-3" /> {fee.paymentMode}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{fee.amount.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{new Date(fee.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="attendance" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-medium mb-4">Attendance Summary</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={attendanceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={60}
                          dataKey="value"
                          label={({ name }) => name}
                        >
                          {attendanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} days`, ``]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-4">Monthly Trend</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={calculateMonthlyAttendance().slice(0, 7)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />
                        <Line type="monotone" dataKey="percentage" stroke="#0A84FF" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Recent Attendance</h3>
                  <div className="space-y-2">
                    {studentAttendance.slice(0, 10).map((record) => (
                      <div 
                        key={record.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <div>{new Date(record.date).toLocaleDateString()}</div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            record.status === "Present" ? "border-apple-green text-apple-green" :
                            record.status === "Absent" ? "border-apple-red text-apple-red" :
                            record.status === "Leave" ? "border-apple-orange text-apple-orange" :
                            "border-apple-gray text-apple-gray"
                          }
                        >
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
          <CardContent>
            {/* Content moved inside TabsContent components above */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

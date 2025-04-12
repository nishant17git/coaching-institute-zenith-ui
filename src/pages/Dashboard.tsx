
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CreditCard, CalendarDays, TrendingUp, UserPlus, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { students, feeTransactions, monthlyFeeCollections } from "@/mock/data";

export default function Dashboard() {
  // Calculate statistics
  const totalStudents = students.length;
  const totalFees = students.reduce((sum, student) => sum + student.totalFees, 0);
  const collectedFees = students.reduce((sum, student) => sum + student.paidFees, 0);
  const pendingFees = totalFees - collectedFees;
  
  // Calculate students with attendance below 80%
  const lowAttendanceStudents = students.filter(student => student.attendancePercentage < 80).length;
  
  // Filter today's transactions
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = feeTransactions.filter(transaction => transaction.date === today);
  const todayCollection = todayTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Students"
          value={totalStudents}
          icon={<Users className="h-4 w-4" />}
          description="Active students in all classes"
          trend={{ value: 8, isPositive: true }}
        />
        
        <StatCard 
          title="Total Fees Collected"
          value={`₹${collectedFees.toLocaleString()}`}
          icon={<CreditCard className="h-4 w-4" />}
          description="Overall collection to date"
          trend={{ value: 12, isPositive: true }}
        />
        
        <StatCard 
          title="Pending Fees"
          value={`₹${pendingFees.toLocaleString()}`}
          icon={<AlertTriangle className="h-4 w-4" />}
          description="Outstanding payments"
          trend={{ value: 5, isPositive: false }}
        />
        
        <StatCard 
          title="Today's Collection"
          value={`₹${todayCollection.toLocaleString()}`}
          icon={<TrendingUp className="h-4 w-4" />}
          description={`${todayTransactions.length} transactions today`}
        />
      </div>

      <Tabs defaultValue="fees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fees">Fee Collection</TabsTrigger>
          <TabsTrigger value="students">Student Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fees" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Fee Collection Trends</CardTitle>
              <CardDescription>
                Monthly fee collection for the current year
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
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
                  <Bar dataKey="amount" fill="#0A84FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="students" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Admissions</CardTitle>
                <CardDescription>
                  Latest students who joined the institute
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students
                    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
                    .slice(0, 5)
                    .map((student) => (
                      <div key={student.id} className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <UserPlus className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{student.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {student.class} • Joined on {new Date(student.joinDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Attendance Concerns</CardTitle>
                <CardDescription>
                  Students with attendance below 80%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students
                    .filter(student => student.attendancePercentage < 80)
                    .slice(0, 5)
                    .map((student) => (
                      <div key={student.id} className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center mr-3">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{student.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {student.class} • {student.attendancePercentage}% attendance
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

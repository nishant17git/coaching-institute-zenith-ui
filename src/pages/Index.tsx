
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Student } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  GraduationCap, 
  AlertTriangle,
  CreditCard,
  CalendarClock,
  ChevronRight,
  Eye
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Index() {
  const { students, classes, isLoading } = useData();
  const [pendingFees, setPendingFees] = useState<Student[]>([]);
  const [classDistribution, setClassDistribution] = useState<any[]>([]);
  const navigate = useNavigate();
  
  // Calculate statistics and prepare data for charts and tables
  useEffect(() => {
    if (students.length > 0) {
      // Calculate pending fees students and sort them by outstanding amount (descending)
      const studentsWithPendingFees = students
        .filter(student => student.feeStatus !== "Paid")
        .map(student => ({
          ...student,
          outstandingAmount: student.totalFees - student.paidFees
        }))
        .sort((a: any, b: any) => b.outstandingAmount - a.outstandingAmount);
      
      setPendingFees(studentsWithPendingFees);
      
      // Calculate class distribution for chart
      const distribution = classes.map(cls => ({
        class: cls.name,
        count: cls.totalStudents
      }));
      setClassDistribution(distribution);
    }
  }, [students, classes]);

  const recentJoins = [...students]
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    .slice(0, 5);
    
  const lowAttendance = [...students]
    .filter(student => student.attendancePercentage < 75)
    .sort((a, b) => a.attendancePercentage - b.attendancePercentage)
    .slice(0, 5);
  
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Students"
          value={students.length.toString()}
          icon={<Users className="h-4 w-4" />}
          description="All registered students"
          trend={{ value: 3, isPositive: true }}
        />
        
        <StatCard 
          title="Total Classes"
          value={classes.length.toString()}
          icon={<GraduationCap className="h-4 w-4" />}
          description="Active classes"
        />
        
        <StatCard 
          title="Fee Collection"
          value={`₹${students.reduce((sum, student) => sum + student.paidFees, 0).toLocaleString()}`}
          icon={<CreditCard className="h-4 w-4" />}
          description="Total collected fees"
          trend={{ value: 12, isPositive: true }}
        />
        
        <StatCard 
          title="Pending Fees"
          value={`₹${students.reduce((sum, student) => sum + (student.totalFees - student.paidFees), 0).toLocaleString()}`}
          icon={<AlertTriangle className="h-4 w-4" />}
          description="Total outstanding fees"
          trend={pendingFees.length > 0 ? { value: pendingFees.length, isPositive: false } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Distribution Chart */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Class Distribution</CardTitle>
            <CardDescription>Number of students in each class</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="class" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0A84FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Joins */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Admissions</CardTitle>
            <CardDescription>Newly joined students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJoins.map(student => (
                <div key={student.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.class}</p>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarClock className="h-3 w-3 mr-1" />
                    {new Date(student.joinDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full mt-2" onClick={() => navigate('/students')}>
                View All Students <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Fees Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Pending Fees</CardTitle>
            <CardDescription>Students with outstanding payments (sorted by amount)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Amount Due</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingFees.slice(0, 5).map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell className="text-right">₹{student.outstandingAmount.toLocaleString()}</TableCell>
                    <TableCell className="w-10">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => navigate(`/students/${student.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="ghost" className="w-full mt-4" onClick={() => navigate('/fees')}>
              View All Fees <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        {/* Low Attendance Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Low Attendance</CardTitle>
            <CardDescription>Students with less than 75% attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Attendance</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowAttendance.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell className="text-right">
                      <span className={
                        student.attendancePercentage < 60 
                          ? "text-apple-red font-medium" 
                          : "text-apple-orange font-medium"
                      }>
                        {student.attendancePercentage}%
                      </span>
                    </TableCell>
                    <TableCell className="w-10">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => navigate(`/students/${student.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="ghost" className="w-full mt-4" onClick={() => navigate('/attendance')}>
              View Attendance <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

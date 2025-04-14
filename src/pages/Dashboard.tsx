
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/services/studentService";
import { StudentRecord } from "@/types";
import { useData } from "@/contexts/DataContext";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, School, LogOut, Settings, Eye, ChevronRight, AlertTriangle, CreditCard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { students, classes, isLoading } = useData();
  const [classDistribution, setClassDistribution] = useState<any[]>([]);
  const [pendingFees, setPendingFees] = useState<any[]>([]);
  const navigate = useNavigate();
  
  // Calculate statistics when students data changes
  useEffect(() => {
    if (students.length > 0) {
      // Calculate class distribution for chart
      const distribution = classes.map(cls => ({
        class: cls.name,
        count: cls.totalStudents
      }));
      setClassDistribution(distribution);
      
      // Calculate pending fees students
      const studentsWithPendingFees = students
        .filter(student => student.feeStatus !== "Paid")
        .map(student => ({
          ...student,
          outstandingAmount: student.totalFees - student.paidFees
        }))
        .sort((a: any, b: any) => b.outstandingAmount - a.outstandingAmount);
      
      setPendingFees(studentsWithPendingFees);
    }
  }, [students, classes]);

  const recentJoins = [...students]
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Students"
          value={students.length.toString()}
          icon={<Users className="h-4 w-4" />}
          description="All registered students"
          trend={students.length > 0 ? '+3% this month' : undefined}
        />
        
        <StatCard 
          title="Total Classes"
          value={classes.length.toString()}
          icon={<GraduationCap className="h-4 w-4" />}
          description="Classes 2-10"
        />
        
        <StatCard 
          title="Fee Collection"
          value={`₹${students.reduce((sum, student) => sum + student.paidFees, 0).toLocaleString()}`}
          icon={<CreditCard className="h-4 w-4" />}
          description="Total collected fees"
          trend="+12% this month"
        />
        
        <StatCard 
          title="Pending Fees"
          value={`₹${students.reduce((sum, student) => sum + (student.totalFees - student.paidFees), 0).toLocaleString()}`}
          icon={<AlertTriangle className="h-4 w-4" />}
          description="Total outstanding fees"
          trend={pendingFees.length > 0 ? `${pendingFees.length} students` : undefined}
          trendType="negative"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Distribution Chart */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Class Distribution</CardTitle>
            <CardDescription>
              Number of students in each class
            </CardDescription>
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
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button variant="ghost" className="w-full mt-2" onClick={() => navigate('/students')}>
                View All Students <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Pending Fees Table */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Fees</CardTitle>
            <CardDescription>Students with outstanding payments (sorted by amount)</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/fees')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Class</TableHead>
                  <TableHead className="hidden sm:table-cell">Guardian</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingFees.slice(0, 5).map((student: any) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.class}</TableCell>
                    <TableCell className="hidden sm:table-cell">{student.fatherName}</TableCell>
                    <TableCell className="text-right">₹{student.paidFees.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₹{student.totalFees.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-apple-red">
                      ₹{student.outstandingAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

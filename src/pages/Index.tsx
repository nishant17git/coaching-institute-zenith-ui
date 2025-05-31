
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Student } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStatCard } from "@/components/ui/dashboard-stat-card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { 
  Users, 
  GraduationCap, 
  AlertTriangle,
  CreditCard,
  CalendarClock,
  ChevronRight,
  Eye
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Index() {
  const { students, classes, isLoading } = useData();
  const [pendingFees, setPendingFees] = useState<Student[]>([]);
  const [classDistribution, setClassDistribution] = useState<any[]>([]);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
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
      
      // Calculate class distribution for chart with vibrant colors
      const getVibrantColor = (classNumber: number) => {
        if (classNumber === 10) {
          return '#D946EF'; // Magenta Pink for Class 10
        }
        
        const vibrantColors = [
          '#0EA5E9', // Ocean Blue
          '#8B5CF6', // Vivid Purple
          '#F97316', // Bright Orange
          '#22C55E', // Green
          '#F43F5E', // Raspberry
          '#3B82F6', // Bright Blue
          '#EC4899', // Hot Pink
          '#EAB308', // Yellow
          '#06B6D4', // Cyan
          '#6366F1', // Indigo
          '#10B981', // Emerald
        ];
        
        const index = (classNumber - 1) % vibrantColors.length;
        return vibrantColors[index];
      };
      
      const distribution = classes.map(cls => {
        const classNum = parseInt(cls.name.split(' ')[1]);
        return {
          class: cls.name,
          count: cls.totalStudents,
          fill: getVibrantColor(classNum)
        };
      });
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
    <div className="space-y-8 animate-slide-up">
      {/* Enhanced Header with Geist Font */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight font-geist bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Infinity Classes
            </h1>
            <p className="text-muted-foreground text-sm mt-1 font-geist">
              Welcome back! Here's your institute overview
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-geist">
            <CalendarClock className="h-4 w-4" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
      
      {/* Enhanced Summary Cards using the new design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatCard 
          type="students"
          label="Total Students"
          count={students.length}
          icon={<Users className="h-4 w-4" />}
          trend={{ value: 3, isPositive: true }}
        />
        
        <DashboardStatCard 
          type="classes"
          label="Total Classes"
          count={classes.length}
          icon={<GraduationCap className="h-4 w-4" />}
        />
        
        <DashboardStatCard 
          type="fees"
          label="Fee Collection"
          count={`₹${students.reduce((sum, student) => sum + student.paidFees, 0).toLocaleString()}`}
          icon={<CreditCard className="h-4 w-4" />}
          trend={{ value: 12, isPositive: true }}
        />
        
        <DashboardStatCard 
          type="pending"
          label="Pending Fees"
          count={`₹${students.reduce((sum, student) => sum + (student.totalFees - student.paidFees), 0).toLocaleString()}`}
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={pendingFees.length > 0 ? { value: pendingFees.length, isPositive: false } : undefined}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Performance Overview */}
      <PerformanceOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Distribution Chart */}
        <Card className="glass-card lg:col-span-2 overflow-hidden">
          <CardHeader>
            <CardTitle className="font-geist">Class Distribution</CardTitle>
            <CardDescription className="font-geist">Number of students in each class</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:pl-2 overflow-x-auto">
            <div className="h-[280px] min-w-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="font-geist">Loading chart data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={classDistribution}
                    margin={isMobile ? { top: 5, right: 10, left: 0, bottom: 5 } : { top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="class" 
                      fontSize={12}
                      tick={{ fill: '#888' }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      fontSize={12}
                      tick={{ fill: '#888' }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickLine={{ stroke: '#e0e0e0' }}
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #f0f0f0', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)' 
                      }} 
                    />
                    <Bar 
                      dataKey="count" 
                      radius={[4, 4, 0, 0]} 
                    >
                      {classDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || "#0A84FF"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Admissions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-geist">Recent Admissions</CardTitle>
            <CardDescription className="font-geist">Newly joined students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJoins.map(student => (
                <div key={student.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium font-geist">{student.name}</p>
                    <p className="text-sm text-muted-foreground font-geist">{student.class}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground hidden sm:flex items-center font-geist">
                      <CalendarClock className="h-3 w-3 mr-1" />
                      {new Date(student.joinDate).toLocaleDateString()}
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => navigate(`/students/${student.id}`)}
                      className="p-1.5 h-auto"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full mt-2 font-geist" onClick={() => navigate('/students')}>
                View All Students <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Fees Table */}
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <CardTitle className="font-geist">Pending Fees</CardTitle>
            <CardDescription className="font-geist">Students with outstanding payments</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-geist">Name</TableHead>
                    <TableHead className="hidden sm:table-cell font-geist">Class</TableHead>
                    <TableHead className="text-right font-geist">Amount Due</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingFees.slice(0, 5).map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium font-geist">{student.name}</TableCell>
                      <TableCell className="hidden sm:table-cell font-geist">{student.class}</TableCell>
                      <TableCell className="text-right font-geist">₹{student.outstandingAmount.toLocaleString()}</TableCell>
                      <TableCell className="w-10 p-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="p-1.5 h-auto"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingFees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 font-geist">
                        No pending fees
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <Button variant="ghost" className="w-full mt-4 font-geist" onClick={() => navigate('/fees')}>
              View All Fees <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        {/* Low Attendance Table */}
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <CardTitle className="font-geist">Low Attendance</CardTitle>
            <CardDescription className="font-geist">Students with less than 75% attendance</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-geist">Name</TableHead>
                    <TableHead className="hidden sm:table-cell font-geist">Class</TableHead>
                    <TableHead className="text-right font-geist">Attendance</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowAttendance.map(student => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium font-geist">{student.name}</TableCell>
                      <TableCell className="hidden sm:table-cell font-geist">{student.class}</TableCell>
                      <TableCell className="text-right">
                        <span className={
                          student.attendancePercentage < 60 
                            ? "text-apple-red font-medium font-geist" 
                            : "text-apple-orange font-medium font-geist"
                        }>
                          {student.attendancePercentage}%
                        </span>
                      </TableCell>
                      <TableCell className="w-10 p-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="p-1.5 h-auto"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {lowAttendance.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 font-geist">
                        All students have good attendance
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <Button variant="ghost" className="w-full mt-4 font-geist" onClick={() => navigate('/attendance')}>
              View Attendance <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional functional components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <UpcomingEvents />
      </div>
    </div>
  );
}

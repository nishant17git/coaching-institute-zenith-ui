
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [classDistribution, setClassDistribution] = useState<any[]>([]);
  const [pendingFees, setPendingFees] = useState<any[]>([]);

  // Fetch students data from Supabase
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch fee transactions from Supabase
  const { data: feeTransactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['fee_transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_transactions')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate class distribution and pending fees when data changes
  useEffect(() => {
    if (students.length > 0) {
      // Calculate class distribution for chart
      const classCounts: Record<number, number> = {};
      students.forEach(student => {
        if (!classCounts[student.class]) {
          classCounts[student.class] = 0;
        }
        classCounts[student.class]++;
      });
      
      const distribution = Object.keys(classCounts).map(cls => ({
        class: `Class ${cls}`,
        count: classCounts[parseInt(cls)]
      })).sort((a, b) => {
        const classA = parseInt(a.class.split(' ')[1]);
        const classB = parseInt(b.class.split(' ')[1]);
        return classA - classB;
      });
      
      setClassDistribution(distribution);
      
      // Calculate pending fees students
      const studentsWithPendingFees = students
        .filter(student => student.fee_status !== "Paid")
        .map(student => ({
          ...student,
          outstandingAmount: student.total_fees - student.paid_fees
        }))
        .sort((a: any, b: any) => b.outstandingAmount - a.outstandingAmount);
      
      setPendingFees(studentsWithPendingFees);
    }
  }, [students]);

  const recentJoins = [...students]
    .sort((a, b) => new Date(b.join_date).getTime() - new Date(a.join_date).getTime())
    .slice(0, 5);

  // Calculate total fees and collections
  const totalFees = students.reduce((sum, student) => sum + (student.total_fees || 0), 0);
  const collectedFees = students.reduce((sum, student) => sum + (student.paid_fees || 0), 0);

  // Animation settings for the dashboard elements
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <motion.h1 
          variants={item}
          className="text-2xl font-semibold tracking-tight"
        >
          Dashboard
        </motion.h1>
        
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
      
      <motion.div 
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard 
          title="Total Students"
          value={students.length.toString()}
          icon={<Users className="h-4 w-4" />}
          description="All registered students"
          trend={{ value: 3, isPositive: true }}
        />
        
        <StatCard 
          title="Total Classes"
          value={classDistribution.length.toString()}
          icon={<GraduationCap className="h-4 w-4" />}
          description="Classes 2-10"
        />
        
        <StatCard 
          title="Fee Collection"
          value={`₹${collectedFees.toLocaleString()}`}
          icon={<CreditCard className="h-4 w-4" />}
          description="Total collected fees"
          trend={{ value: 12, isPositive: true }}
        />
        
        <StatCard 
          title="Pending Fees"
          value={`₹${(totalFees - collectedFees).toLocaleString()}`}
          icon={<AlertTriangle className="h-4 w-4" />}
          description="Total outstanding fees"
          trend={pendingFees.length > 0 ? { value: pendingFees.length, isPositive: false } : undefined}
        />
      </motion.div>

      <motion.div 
        variants={item}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
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
              {studentsLoading ? (
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
                    <Bar dataKey="count" name="Students" fill="#0A84FF" radius={[4, 4, 0, 0]} />
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
            {studentsLoading ? (
              <div className="h-[220px] flex items-center justify-center">
                <p>Loading recent admissions...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJoins.map(student => (
                  <div key={student.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{student.full_name}</p>
                      <p className="text-sm text-muted-foreground">Class {student.class}</p>
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
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Pending Fees Table */}
      <motion.div variants={item}>
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
            {studentsLoading ? (
              <div className="h-[220px] flex items-center justify-center">
                <p>Loading pending fees data...</p>
              </div>
            ) : (
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
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell className="hidden md:table-cell">Class {student.class}</TableCell>
                        <TableCell className="hidden sm:table-cell">{student.guardian_name}</TableCell>
                        <TableCell className="text-right">₹{student.paid_fees.toLocaleString()}</TableCell>
                        <TableCell className="text-right">₹{student.total_fees.toLocaleString()}</TableCell>
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
                    {pendingFees.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No pending fees
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

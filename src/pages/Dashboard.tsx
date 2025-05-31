
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, School, Eye, ChevronRight, AlertTriangle, CreditCard, FileText, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { UserIcon } from "@/components/UserIcon";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { cn } from "@/lib/utils";
export default function Dashboard() {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const [classDistribution, setClassDistribution] = useState<any[]>([]);
  const [pendingFees, setPendingFees] = useState<any[]>([]);
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
    data: feeTransactions = [],
    isLoading: transactionsLoading
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
  useEffect(() => {
    if (students.length > 0) {
      // Generate vibrant colors for chart with special case for Class 10
      const getVibrantColor = (classNumber: number) => {
        if (classNumber === 10) {
          return '#D946EF'; // Magenta Pink for Class 10
        }
        const vibrantColors = ['#0EA5E9',
        // Ocean Blue
        '#8B5CF6',
        // Vivid Purple
        '#F97316',
        // Bright Orange
        '#22C55E',
        // Green
        '#F43F5E',
        // Raspberry
        '#3B82F6',
        // Bright Blue
        '#EC4899',
        // Hot Pink
        '#EAB308',
        // Yellow
        '#06B6D4',
        // Cyan
        '#6366F1',
        // Indigo
        '#10B981' // Emerald
        ];
        // Use modulo to ensure we don't go out of bounds
        const index = (classNumber - 1) % vibrantColors.length;
        return vibrantColors[index];
      };
      const classCounts: Record<number, number> = {};
      students.forEach(student => {
        if (!classCounts[student.class]) {
          classCounts[student.class] = 0;
        }
        classCounts[student.class]++;
      });
      const distribution = Object.keys(classCounts).map(cls => {
        const classNum = parseInt(cls);
        return {
          class: `Class ${cls}`,
          count: classCounts[classNum],
          fill: getVibrantColor(classNum)
        };
      }).sort((a, b) => {
        const classA = parseInt(a.class.split(' ')[1]);
        const classB = parseInt(b.class.split(' ')[1]);
        return classA - classB;
      });
      setClassDistribution(distribution);

      // Calculate pending fees
      const studentsWithPendingFees = students.filter(student => (student.fee_status || "Pending") !== "Paid").map(student => ({
        ...student,
        outstandingAmount: (student.total_fees || 0) - (student.paid_fees || 0)
      })).sort((a: any, b: any) => b.outstandingAmount - a.outstandingAmount);
      setPendingFees(studentsWithPendingFees);
    }
  }, [students]);
  const recentJoins = [...students].sort((a, b) => new Date(b.admission_date || b.created_at).getTime() - new Date(a.admission_date || a.created_at).getTime()).slice(0, 5);
  const totalFees = students.reduce((sum, student) => sum + (student.total_fees || 0), 0);
  const collectedFees = students.reduce((sum, student) => sum + (student.paid_fees || 0), 0);
  const container = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const item = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0
    }
  };
  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };
  return <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <motion.div variants={item} className="flex flex-col">
          <h1 className="infinity-title text-black font-normal font-geist">
            Infinity Classes
          </h1>
          
        </motion.div>
        
        <UserIcon username={user?.email?.split('@')[0] || 'Admin'} />
      </div>
      
      {/* Stats Section */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={students.length.toString()} icon={<Users className="h-6 w-6 text-blue-600" />} description="All registered students" trend={{
        value: 3,
        isPositive: true
      }} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-4 border-apple-blue" />
        
        <StatCard title="Total Classes" value={classDistribution.length.toString()} icon={<GraduationCap className="h-6 w-6 text-purple-600" />} description="Classes 2-10" className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b-4 border-apple-purple" />
        
        <StatCard title="Fee Collection" value={`₹${collectedFees.toLocaleString()}`} icon={<CreditCard className="h-6 w-6 text-green-600" />} description="Total collected fees" trend={{
        value: 12,
        isPositive: true
      }} className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-apple-green" />
        
        <StatCard title="Pending Fees" value={`₹${(totalFees - collectedFees).toLocaleString()}`} icon={<AlertTriangle className="h-6 w-6 text-red-600" />} description="Total outstanding fees" trend={pendingFees.length > 0 ? {
        value: pendingFees.length,
        isPositive: false
      } : undefined} className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-b-4 border-apple-red" />
      </motion.div>

      {/* Charts & Recent Admissions */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Distribution Chart */}
        <Card className="glass-effect lg:col-span-2 rounded-xl overflow-hidden shadow-md border-black/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-apple-blue" />
              Class Distribution
            </CardTitle>
            <CardDescription>
              Number of students in each class
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              {studentsLoading ? <div className="flex items-center justify-center h-full">
                  <p>Loading chart data...</p>
                </div> : <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classDistribution} margin={isMobile ? {
                top: 5,
                right: 10,
                left: 0,
                bottom: 5
              } : {
                top: 20,
                right: 30,
                left: 20,
                bottom: 5
              }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="class" fontSize={isMobile ? 10 : 12} tick={{
                  fill: '#888'
                }} interval={isMobile ? 1 : 0} axisLine={{
                  stroke: '#e0e0e0'
                }} />
                    <YAxis allowDecimals={false} fontSize={isMobile ? 10 : 12} width={isMobile ? 25 : 40} axisLine={{
                  stroke: '#e0e0e0'
                }} tickLine={{
                  stroke: '#e0e0e0'
                }} />
                    <RechartsTooltip contentStyle={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #f0f0f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }} />
                    <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                      {classDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Admissions */}
        <Card className="glass-effect rounded-xl overflow-hidden shadow-md border-black/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-apple-purple" />
              Recent Admissions
            </CardTitle>
            <CardDescription>Newly joined students</CardDescription>
          </CardHeader>
          <CardContent>
            {studentsLoading ? <div className="h-[220px] flex items-center justify-center">
                <p>Loading recent admissions...</p>
              </div> : <div className="space-y-4">
                {recentJoins.map((student, index) => <motion.div key={student.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-secondary/40 transition-colors" initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.1
            }}>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-secondary/80 flex items-center justify-center text-sm font-medium">
                        {student.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground">Class {student.class}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/students/${student.id}`)} className="rounded-full h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </motion.div>)}
                
                <Button variant="ghost" className="w-full mt-2 rounded-lg border border-dashed border-muted flex items-center justify-center gap-2 hover:border-muted-foreground/50 transition-colors" onClick={() => navigate('/students')}>
                  View All Students <ChevronRight className="h-4 w-4" />
                </Button>
              </div>}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Pending Fees */}
      <motion.div variants={item}>
        <Card className="glass-effect rounded-xl overflow-hidden shadow-md border-black/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-apple-red" />
                Pending Fees
              </CardTitle>
              <CardDescription className="mt-1 sm:mt-0">
                Students with outstanding payments
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/fees')} className="rounded-full">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {studentsLoading ? <div className="h-[220px] flex items-center justify-center">
                <p>Loading pending fees data...</p>
              </div> : <div className="space-y-1">
                {/* Mobile view for pending fees */}
                <div className="block sm:hidden">
                  {pendingFees.slice(0, 5).map((student: any, index) => <motion.div key={student.id} className="mb-3 p-3 bg-secondary/30 rounded-lg" initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: index * 0.1
              }}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{student.full_name}</div>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/students/${student.id}`)} className="rounded-full h-7 w-7 p-0">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">Class</div>
                          <div>{student.class}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Guardian</div>
                          <div className="truncate w-32">{student.guardian_name || student.father_name || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">Paid</div>
                          <div>₹{(student.paid_fees || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Total</div>
                          <div>₹{(student.total_fees || 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Due</div>
                          <div className="text-apple-red font-medium">₹{student.outstandingAmount.toLocaleString()}</div>
                        </div>
                      </div>
                    </motion.div>)}
                </div>
                
                {/* Desktop view for pending fees */}
                <div className="hidden sm:block rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Class</TableHead>
                        <TableHead className="hidden sm:table-cell">Guardian</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Outstanding</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingFees.slice(0, 5).map((student: any) => <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.full_name}</TableCell>
                          <TableCell className="hidden md:table-cell">Class {student.class}</TableCell>
                          <TableCell className="hidden sm:table-cell">{student.guardian_name || student.father_name || 'N/A'}</TableCell>
                          <TableCell className="text-right">₹{(student.paid_fees || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-right">₹{(student.total_fees || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-apple-red">
                            ₹{student.outstandingAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/students/${student.id}`)} className="rounded-full h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>)}
                      {pendingFees.length === 0 && <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No pending fees
                          </TableCell>
                        </TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </div>}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>;
}

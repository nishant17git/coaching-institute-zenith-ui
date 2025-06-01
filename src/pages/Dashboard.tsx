
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedStatCard } from "@/components/ui/enhanced-stat-card";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { Users, GraduationCap, CreditCard, Calendar, TrendingUp, Clock } from "lucide-react";
import { format, isToday, differenceInDays } from "date-fns";

export default function Dashboard() {
  // Fetch students data
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch fee transactions
  const { data: feeTransactions = [], isLoading: isLoadingFees } = useQuery({
    queryKey: ['feeTransactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_transactions')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch attendance records for today
  const { data: todayAttendance = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('date', today);
      
      if (error) throw error;
      return data;
    }
  });

  // Calculate statistics
  const totalStudents = students.length;
  const totalFees = students.reduce((sum, student) => sum + (student.total_fees || 0), 0);
  const totalPaid = students.reduce((sum, student) => sum + (student.paid_fees || 0), 0);
  const collectionRate = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0;
  
  // Attendance statistics
  const presentToday = todayAttendance.filter(record => record.status === 'Present').length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;
  
  // Recent admissions (last 30 days)
  const recentAdmissions = students.filter(student => {
    if (!student.admission_date) return false; // Use admission_date instead of join_date
    const admissionDate = new Date(student.admission_date);
    return differenceInDays(new Date(), admissionDate) <= 30;
  }).length;

  // Today's fee collections
  const todayCollections = feeTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.payment_date);
    return isToday(transactionDate);
  }).reduce((sum, transaction) => sum + transaction.amount, 0);

  const isLoading = isLoadingStudents || isLoadingFees || isLoadingAttendance;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening at your school today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedStatCard
          title="Total Students"
          value={totalStudents.toString()}
          icon={<Users className="h-5 w-5" />}
          trend="up"
          trendValue={`+${recentAdmissions}`}
          trendLabel="new this month"
          color="blue"
          isLoading={isLoading}
        />
        
        <EnhancedStatCard
          title="Today's Attendance"
          value={`${attendanceRate}%`}
          icon={<Calendar className="h-5 w-5" />}
          trend={attendanceRate >= 85 ? "up" : "down"}
          trendValue={`${presentToday}/${totalStudents}`}
          trendLabel="students present"
          color="green"
          isLoading={isLoading}
        />
        
        <EnhancedStatCard
          title="Fee Collection"
          value={`${collectionRate}%`}
          icon={<CreditCard className="h-5 w-5" />}
          trend={collectionRate >= 80 ? "up" : "down"}
          trendValue={`₹${todayCollections.toLocaleString()}`}
          trendLabel="collected today"
          color="purple"
          isLoading={isLoading}
        />
        
        <EnhancedStatCard
          title="Academic Performance"
          value="85%"
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
          trendValue="+5%"
          trendLabel="from last term"
          color="orange"
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview - Takes 2 columns */}
        <div className="lg:col-span-2">
          <PerformanceOverview />
        </div>
        
        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity />
        
        {/* Today's Summary */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-geist">
              <Clock className="h-5 w-5" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/20">
                <span className="text-sm font-medium font-geist">Present Students</span>
                <span className="font-semibold font-geist">{presentToday}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/20">
                <span className="text-sm font-medium font-geist">Fee Collections</span>
                <span className="font-semibold font-geist">₹{todayCollections.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/20">
                <span className="text-sm font-medium font-geist">New Admissions</span>
                <span className="font-semibold font-geist">{recentAdmissions}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/20">
                <span className="text-sm font-medium font-geist">Date</span>
                <span className="font-semibold font-geist">{format(new Date(), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

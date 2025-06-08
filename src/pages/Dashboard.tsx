import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedStatCard } from "@/components/ui/enhanced-stat-card";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { AttendanceTrendChart } from "@/components/dashboard/AttendanceTrendChart";
import { FeeStatusChart } from "@/components/dashboard/FeeStatusChart";
import { PendingFeesSection } from "@/components/dashboard/PendingFeesSection";
import { LowAttendanceSection } from "@/components/dashboard/LowAttendanceSection";
import { Users, GraduationCap, CreditCard, Calendar, TrendingUp, Clock } from "lucide-react";
import { format, isToday, differenceInDays, isValid, parseISO } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

// Helper function to safely parse dates
const safeParseDate = (dateValue: any): Date | null => {
  if (!dateValue) return null;
  try {
    const parsed = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    console.warn('Invalid date value in Dashboard:', dateValue);
    return null;
  }
};

// Helper function to safely check if date is today
const safeDateIsToday = (dateValue: any): boolean => {
  const date = safeParseDate(dateValue);
  return date ? isToday(date) : false;
};

// Helper function to safely calculate date difference
const safeDateDifference = (dateValue: any, compareDate: Date = new Date()): number => {
  const date = safeParseDate(dateValue);
  return date ? differenceInDays(compareDate, date) : Infinity;
};
export default function Dashboard() {
  const isMobile = useIsMobile();

  // Fetch students data
  const {
    data: students = [],
    isLoading: isLoadingStudents
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('students').select('*');
      if (error) throw error;
      return data;
    }
  });

  // Fetch fee transactions
  const {
    data: feeTransactions = [],
    isLoading: isLoadingFees
  } = useQuery({
    queryKey: ['feeTransactions'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('fee_transactions').select('*');
      if (error) throw error;
      return data;
    }
  });

  // Fetch attendance records for today
  const {
    data: todayAttendance = [],
    isLoading: isLoadingAttendance
  } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const {
        data,
        error
      } = await supabase.from('attendance_records').select('*').eq('date', today);
      if (error) throw error;
      return data;
    }
  });

  // Calculate statistics
  const totalStudents = students.length;
  const totalFees = students.reduce((sum, student) => sum + (student.total_fees || 0), 0);
  const totalPaid = students.reduce((sum, student) => sum + (student.paid_fees || 0), 0);
  const collectionRate = totalFees > 0 ? Math.round(totalPaid / totalFees * 100) : 0;

  // Attendance statistics
  const presentToday = todayAttendance.filter(record => record.status === 'Present').length;
  const attendanceRate = totalStudents > 0 ? Math.round(presentToday / totalStudents * 100) : 0;

  // Recent admissions (last 30 days) with safe date handling
  const recentAdmissions = students.filter(student => {
    return safeDateDifference(student.admission_date) <= 30;
  }).length;

  // Today's fee collections with safe date handling
  const todayCollections = feeTransactions.filter(transaction => {
    return safeDateIsToday(transaction.payment_date);
  }).reduce((sum, transaction) => sum + transaction.amount, 0);
  const isLoading = isLoadingStudents || isLoadingFees || isLoadingAttendance;
  return <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-spotify">Home</h1>
        <p className="text-muted-foreground text-sm font-spotify">We proffer august felicitations on your return, Sir; herewith, today's vicissitudes at your venerable institute.
      </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <EnhancedStatCard title="Total Students" value={totalStudents.toString()} icon={<Users className="h-5 w-5" />} trend={{
        value: recentAdmissions,
        isPositive: true
      }} description={`+${recentAdmissions} new this month`} gradientClass="from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-4 border-blue-500" iconColorClass="text-blue-600 dark:text-blue-400" />
        
        <EnhancedStatCard title="Today's Attendance" value={`${attendanceRate}%`} icon={<Calendar className="h-5 w-5" />} trend={{
        value: attendanceRate >= 85 ? 5 : -5,
        isPositive: attendanceRate >= 85
      }} description={`${presentToday}/${totalStudents} students present`} gradientClass="from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-green-500" iconColorClass="text-green-600 dark:text-green-400" />
        
        <EnhancedStatCard title="Fee Collection" value={`${collectionRate}%`} icon={<CreditCard className="h-5 w-5" />} trend={{
        value: collectionRate >= 80 ? 8 : -3,
        isPositive: collectionRate >= 80
      }} description={`₹${todayCollections.toLocaleString()} collected today`} gradientClass="from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-b-4 border-purple-500" iconColorClass="text-purple-600 dark:text-purple-400" />
        
        <EnhancedStatCard title="Academic Performance" value="85%" icon={<TrendingUp className="h-5 w-5" />} trend={{
        value: 5,
        isPositive: true
      }} description="+5% from last term" gradientClass="from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-b-4 border-orange-500" iconColorClass="text-orange-600 dark:text-orange-400" />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AttendanceTrendChart />
        <FeeStatusChart />
      </div>

      {/* Pending Fees and Low Attendance Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <PendingFeesSection />
        <LowAttendanceSection />
      </div>

      {/* Recent Activity and Today's Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <RecentActivity />
        
        {/* Today's Summary - Optimized for Mobile */}
        <Card className="glass-card">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 font-spotify sm:text-xl text-xl">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/20">
                <span className="text-sm font-medium font-spotify">Present Students</span>
                <span className="font-semibold font-spotify text-sm sm:text-base">{presentToday}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/20">
                <span className="text-sm font-medium font-spotify">Fee Collections</span>
                <span className="font-semibold font-spotify text-sm sm:text-base">₹{todayCollections.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/20">
                <span className="text-sm font-medium font-spotify">New Admissions</span>
                <span className="font-semibold font-spotify text-sm sm:text-base">{recentAdmissions}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/20">
                <span className="text-sm font-medium font-spotify">Date</span>
                <span className="font-semibold font-spotify text-sm sm:text-base">{format(new Date(), 'MMM dd, yyyy')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}

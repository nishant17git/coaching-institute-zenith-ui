import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

// Charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Icons
import { Download, Calendar, TrendingUp, Users, DollarSign, BookOpen } from "lucide-react";

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [reportType, setReportType] = useState("fees");

  // Date formatting for queries
  const startDate = startOfMonth(selectedMonth);
  const endDate = endOfMonth(selectedMonth);
  const formattedStartDate = format(startDate, "yyyy-MM-dd");
  const formattedEndDate = format(endDate, "yyyy-MM-dd");

  // Fetch monthly fee collections
  const { data: monthlyFeeCollections = [], isLoading: feesLoading } = useQuery({
    queryKey: ['monthlyFeeCollections', formattedStartDate, formattedEndDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_transactions')
        .select('*')
        .gte('payment_date', formattedStartDate)
        .lte('payment_date', formattedEndDate);
      
      if (error) throw error;
      return data || [];
    },
    enabled: reportType === 'fees'
  });

  // Fetch monthly attendance
  const { data: monthlyAttendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['monthlyAttendance', formattedStartDate, formattedEndDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .gte('date', formattedStartDate)
        .lte('date', formattedEndDate);
      
      if (error) throw error;
      return data || [];
    },
    enabled: reportType === 'attendance'
  });

  // Fetch class distribution
  const { data: classDistribution = [], isLoading: classLoading } = useQuery({
    queryKey: ['classDistribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('class');
      
      if (error) throw error;
      return data || [];
    },
    enabled: reportType === 'class'
  });

  // Calculate statistics based on report type
  const totalFeeCollection = monthlyFeeCollections.reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalPresent = monthlyAttendance.filter(record => record.status === 'Present').length;
  const totalAbsent = monthlyAttendance.filter(record => record.status === 'Absent').length;

  // Prepare data for charts
  const feeCollectionData = [{
    name: format(selectedMonth, 'MMMM'),
    value: totalFeeCollection
  }];

  const attendanceData = [
    { name: 'Present', value: totalPresent },
    { name: 'Absent', value: totalAbsent }
  ];

  const classData = () => {
    const classCounts: { [key: string]: number } = {};
    classDistribution.forEach(student => {
      const className = `Class ${student.class}`;
      classCounts[className] = (classCounts[className] || 0) + 1;
    });

    return Object.entries(classCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  const isLoading = feesLoading || attendanceLoading || classLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      <EnhancedPageHeader 
        title="Reports & Analytics" 
        action={
          <div className="flex gap-3">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Report" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fees">Fee Collection</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="class">Class Distribution</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-black hover:bg-black/80">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        } 
      />

      {/* Date Filter */}
      <div className="bg-background/60 backdrop-blur-sm p-5 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">
            {format(selectedMonth, 'MMMM yyyy')}
          </h3>
          <div className="ml-auto flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedMonth(new Date())}
            >
              Current
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedMonth(subMonths(new Date(), 1))}
            >
              Last Month
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedMonth(new Date(new Date().getFullYear(), 0, 1))}
            >
              This Year
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedMonth(subMonths(selectedMonth, -1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          {reportType === 'fees' && (
            <Card className="shadow-sm border-muted">
              <CardHeader>
                <CardTitle>Monthly Fee Collection</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Total fee collection for {format(selectedMonth, 'MMMM yyyy')}
                </p>
              </CardHeader>
              <CardContent>
                {monthlyFeeCollections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold">
                        ₹{totalFeeCollection.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Collected this month
                      </p>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={feeCollectionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState 
                    icon={<DollarSign className="h-10 w-10 text-muted-foreground" />} 
                    title="No fee collections this month" 
                    description="No fee transactions were recorded for the selected month." 
                  />
                )}
              </CardContent>
            </Card>
          )}

          {reportType === 'attendance' && (
            <Card className="shadow-sm border-muted">
              <CardHeader>
                <CardTitle>Monthly Attendance Report</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Attendance statistics for {format(selectedMonth, 'MMMM yyyy')}
                </p>
              </CardHeader>
              <CardContent>
                {monthlyAttendance.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="text-green-600">
                          <TrendingUp className="h-5 w-5 mr-2" /> Present
                        </div>
                        <div className="font-bold text-xl">{totalPresent}</div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-red-600">
                          <Users className="h-5 w-5 mr-2" /> Absent
                        </div>
                        <div className="font-bold text-xl">{totalAbsent}</div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={attendanceData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          <Cell fill="#82ca9d" name="Present" />
                          <Cell fill="#d04848" name="Absent" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState 
                    icon={<Calendar className="h-10 w-10 text-muted-foreground" />} 
                    title="No attendance records this month" 
                    description="No attendance records were found for the selected month." 
                  />
                )}
              </CardContent>
            </Card>
          )}

          {reportType === 'class' && (
            <Card className="shadow-sm border-muted">
              <CardHeader>
                <CardTitle>Class Distribution</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Distribution of students across different classes
                </p>
              </CardHeader>
              <CardContent>
                {classDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={classData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    icon={<BookOpen className="h-10 w-10 text-muted-foreground" />}
                    title="No class data available"
                    description="There is no class data to display."
                  />
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

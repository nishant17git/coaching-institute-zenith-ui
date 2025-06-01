
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { motion } from "framer-motion";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useIsMobile } from "@/hooks/use-mobile";

// Icons
import { Search, Download, FileText, Calendar, Users, TrendingUp, DollarSign } from "lucide-react";

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [reportType, setReportType] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);
  const isMobile = useIsMobile();

  // Fetch students data
  const {
    data: students = [],
    isLoading: studentsLoading
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase.from('students').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch fee transactions
  const {
    data: feeTransactions = [],
    isLoading: feesLoading
  } = useQuery({
    queryKey: ['feeTransactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_transactions')
        .select(`
          *,
          students (
            full_name,
            class
          )
        `)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch attendance records
  const {
    data: attendanceRecords = [],
    isLoading: attendanceLoading
  } = useQuery({
    queryKey: ['attendanceRecords'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          students (
            full_name,
            class
          )
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch test results
  const {
    data: testResults = [],
    isLoading: testsLoading
  } = useQuery({
    queryKey: ['testResults'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          *,
          tests (
            test_name,
            subject,
            test_date,
            class
          ),
          students (
            full_name,
            class
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate statistics
  const totalStudents = students.length;
  const totalFeeCollected = feeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const averageAttendance = students.length > 0 
    ? Math.round(students.reduce((sum, student) => sum + (student.attendance_percentage || 0), 0) / students.length)
    : 0;
  const averageTestScore = testResults.length > 0 
    ? Math.round(testResults.reduce((sum, result) => sum + (result.percentage || 0), 0) / testResults.length)
    : 0;

  // Filter data based on filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === "all" || student.class.toString() === classFilter;
    return matchesSearch && matchesClass;
  });

  const filteredFeeTransactions = feeTransactions.filter(transaction => {
    const student = transaction.students;
    if (!student) return false;
    
    const matchesSearch = student.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === "all" || student.class.toString() === classFilter;
    
    let matchesDate = true;
    if (dateRange?.from && dateRange?.to) {
      const transactionDate = new Date(transaction.payment_date);
      matchesDate = transactionDate >= dateRange.from && transactionDate <= dateRange.to;
    }
    
    return matchesSearch && matchesClass && matchesDate;
  });

  const isLoading = studentsLoading || feesLoading || attendanceLoading || testsLoading;
  const classes = [...new Set(students.map(student => student.class))].sort();

  const handleDownloadReport = (type: string) => {
    // This would implement actual PDF/Excel generation
    console.log(`Downloading ${type} report`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <EnhancedPageHeader 
        title="Reports" 
        action={
          <Button onClick={() => handleDownloadReport('comprehensive')} className="bg-black hover:bg-black/80">
            <Download className="h-4 w-4 mr-2" /> Download All
          </Button>
        } 
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-4 border-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" /> Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Enrolled</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <DollarSign className="h-4 w-4" /> Fee Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalFeeCollected.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total amount</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b-4 border-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-4 w-4" /> Avg Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAttendance}%</div>
            <div className="text-xs sm:text-sm text-muted-foreground">All students</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b-4 border-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
              <FileText className="h-4 w-4" /> Avg Test Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageTestScore}%</div>
            <div className="text-xs sm:text-sm text-muted-foreground">All tests</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-background/60 backdrop-blur-sm p-5 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search students..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10 h-11 text-base" 
            />
          </div>

          <div className="flex flex-row gap-3 w-full sm:w-auto">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="fees">Fee Reports</SelectItem>
                <SelectItem value="attendance">Attendance Reports</SelectItem>
                <SelectItem value="tests">Test Reports</SelectItem>
              </SelectContent>
            </Select>

            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(classNum => (
                  <SelectItem key={classNum} value={classNum.toString()}>Class {classNum}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Fee Transactions Report */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div>
                <span className="text-base block">Fee Transactions</span>
                <span className="text-xs text-muted-foreground">{filteredFeeTransactions.length} transactions</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownloadReport('fees')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-medium">₹{filteredFeeTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Latest Payment:</span>
                <span className="font-medium">
                  {filteredFeeTransactions.length > 0 
                    ? format(new Date(filteredFeeTransactions[0].payment_date), 'MMM dd, yyyy')
                    : 'No payments'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Report */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div>
                <span className="text-base block">Students Report</span>
                <span className="text-xs text-muted-foreground">{filteredStudents.length} students</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownloadReport('students')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Classes:</span>
                <span className="font-medium">{classes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Attendance:</span>
                <span className="font-medium">{averageAttendance}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Report */}
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div>
                <span className="text-base block">Attendance Report</span>
                <span className="text-xs text-muted-foreground">{attendanceRecords.length} records</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownloadReport('attendance')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Present Today:</span>
                <span className="font-medium text-green-600">
                  {attendanceRecords.filter(r => r.status === "Present" && r.date === format(new Date(), 'yyyy-MM-dd')).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Avg:</span>
                <span className="font-medium">{averageAttendance}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading && <LoadingState />}
    </div>
  );
}

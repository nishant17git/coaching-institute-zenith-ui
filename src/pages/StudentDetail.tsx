
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { StudentDetailHeader } from "@/components/students/StudentDetailHeader";
import { StudentTestResults } from "@/components/students/StudentTestResults";

// Icons
import { ArrowLeft, Phone, MessageCircle, Calendar, CreditCard, BookOpen, TrendingUp } from "lucide-react";

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch student data
  const {
    data: student,
    isLoading: isLoadingStudent
  } = useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      if (!id) throw new Error('Student ID is required');
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Fetch fee transactions for this student
  const {
    data: feeTransactions = [],
    isLoading: isLoadingTransactions
  } = useQuery({
    queryKey: ['studentFeeTransactions', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('fee_transactions')
        .select('*')
        .eq('student_id', id)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Fetch attendance records for this student
  const {
    data: attendanceRecords = [],
    isLoading: isLoadingAttendance
  } = useQuery({
    queryKey: ['studentAttendance', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', id)
        .order('date', { ascending: false })
        .limit(30); // Last 30 records
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Fetch test results for this student
  const {
    data: testResults = [],
    isLoading: isLoadingTests
  } = useQuery({
    queryKey: ['studentTestResults', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          *,
          tests!inner(test_name, subject, test_date, test_type)
        `)
        .eq('student_id', id) // Use student_id instead of studentId
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const isLoading = isLoadingStudent || isLoadingTransactions || isLoadingAttendance || isLoadingTests;

  if (isLoading) {
    return <LoadingState />;
  }

  if (!student) {
    return (
      <EmptyState 
        icon={<BookOpen className="h-10 w-10 text-muted-foreground" />}
        title="Student not found"
        description="The requested student could not be found."
      />
    );
  }

  const handleCall = () => {
    if (student.contact_number) {
      window.open(`tel:${student.contact_number}`, '_self');
      toast.success(`Calling ${student.full_name}...`);
    } else {
      toast.error("No phone number available");
    }
  };

  const handleWhatsApp = () => {
    if (student.whatsapp_number || student.contact_number) {
      const number = student.whatsapp_number || student.contact_number;
      window.open(`https://wa.me/${number.replace(/[^0-9]/g, '')}`, '_blank');
      toast.success("Opening WhatsApp...");
    } else {
      toast.error("No WhatsApp number available");
    }
  };

  // Calculate statistics
  const totalPaid = feeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const balance = (student.total_fees || 0) - totalPaid;
  const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
  const totalDays = attendanceRecords.length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
  const averageScore = testResults.length > 0 
    ? Math.round(testResults.reduce((sum, r) => sum + (r.marks_obtained / r.total_marks) * 100, 0) / testResults.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/students')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{student.full_name}</h1>
          <p className="text-muted-foreground">Class {student.class} • Roll No. {student.roll_number}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCall}
            disabled={!student.contact_number}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleWhatsApp}
            disabled={!student.whatsapp_number && !student.contact_number}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ₹{totalPaid.toLocaleString()} paid of ₹{(student.total_fees || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendancePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {presentDays}/{totalDays} days present
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Average from {testResults.length} tests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={student.status === 'Active' ? 'success' : 'secondary'} className="text-sm">
              {student.status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Since {format(new Date(student.admission_date || new Date()), 'MMM yyyy')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Fee History</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="academic">Academic Records</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="font-medium">{student.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                    <p className="font-medium">{student.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{format(new Date(student.date_of_birth), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                    <p className="font-medium">{student.blood_group || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="font-medium">{student.address || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aadhaar Number</p>
                  <p className="font-medium">{student.aadhaar_number || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Guardian Information */}
            <Card>
              <CardHeader>
                <CardTitle>Guardian Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Father's Name</p>
                  <p className="font-medium">{student.father_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mother's Name</p>
                  <p className="font-medium">{student.mother_name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Guardian Name</p>
                  <p className="font-medium">{student.guardian_name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                  <p className="font-medium">{student.contact_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">WhatsApp Number</p>
                  <p className="font-medium">{student.whatsapp_number || 'Same as contact'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium">{student.email || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {feeTransactions.length === 0 ? (
                <EmptyState 
                  icon={<CreditCard className="h-8 w-8 text-muted-foreground" />}
                  title="No fee transactions"
                  description="No fee payments have been recorded for this student."
                />
              ) : (
                <div className="space-y-3">
                  {feeTransactions.map(transaction => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">₹{transaction.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.payment_date), 'MMM dd, yyyy')} • {transaction.payment_mode}
                        </p>
                        <p className="text-sm text-muted-foreground">{transaction.purpose}</p>
                      </div>
                      <Badge variant="outline">#{transaction.receipt_number}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceRecords.length === 0 ? (
                <EmptyState 
                  icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
                  title="No attendance records"
                  description="No attendance records have been found for this student."
                />
              ) : (
                <div className="space-y-3">
                  {attendanceRecords.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{format(new Date(record.date), 'MMM dd, yyyy')}</p>
                        {record.check_in_time && (
                          <p className="text-sm text-muted-foreground">
                            Check-in: {record.check_in_time}
                            {record.check_out_time && ` | Check-out: ${record.check_out_time}`}
                          </p>
                        )}
                        {record.remarks && (
                          <p className="text-sm text-muted-foreground">{record.remarks}</p>
                        )}
                      </div>
                      <Badge variant={
                        record.status === 'Present' ? 'success' : 
                        record.status === 'Absent' ? 'destructive' : 
                        record.status === 'Leave' ? 'warning' : 
                        'secondary'
                      }>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <EmptyState 
                  icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
                  title="No test results"
                  description="No test results have been recorded for this student."
                />
              ) : (
                <div className="space-y-3">
                  {testResults.map(result => {
                    const percentage = Math.round((result.marks_obtained / result.total_marks) * 100);
                    const getGrade = (pct: number) => {
                      if (pct >= 90) return { grade: 'A+', color: 'bg-green-500' };
                      if (pct >= 80) return { grade: 'A', color: 'bg-blue-500' };
                      if (pct >= 70) return { grade: 'B', color: 'bg-purple-500' };
                      if (pct >= 60) return { grade: 'C', color: 'bg-yellow-500' };
                      return { grade: 'D', color: 'bg-red-500' };
                    };
                    
                    const { grade, color } = getGrade(percentage);
                    
                    return (
                      <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{result.tests?.test_name || 'Unknown Test'}</h4>
                            <Badge variant="outline">{result.tests?.subject || 'Unknown Subject'}</Badge>
                            <Badge className={`${color} text-white`}>
                              {grade}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {result.tests?.test_date && format(new Date(result.tests.test_date), 'MMM dd, yyyy')} • {result.tests?.test_type}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{result.marks_obtained}/{result.total_marks}</div>
                          <div className="text-sm text-muted-foreground">{percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

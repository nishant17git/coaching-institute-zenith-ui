
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { EnhancedCallModal } from "@/components/ui/enhanced-call-modal";
import { useIsMobile } from "@/hooks/use-mobile";
import { StudentDetailHeader } from "@/components/students/StudentDetailHeader";
import { StudentTestResults } from "@/components/students/StudentTestResults";
import { AttendanceHistoryCard } from "@/components/student-attendance/AttendanceHistoryCard";
import { AttendanceHistoryTable } from "@/components/student-attendance/AttendanceHistoryTable";
import { StudentNotFoundState } from "@/components/student-attendance/StudentNotFoundState";
import { StudentOverviewCard } from "@/components/student-attendance/StudentOverviewCard";
import { FeeTransactionForm } from "@/components/fees/FeeTransactionForm";

// Icons
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  Edit, 
  MoreVertical, 
  Calendar,
  TrendingUp,
  GraduationCap,
  Award,
  Clock,
  BookOpen,
  Users,
  Target,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  DollarSign,
  Plus
} from "lucide-react";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);

  // Fetch student data
  const { data: student, isLoading: studentLoading, error: studentError } = useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      if (!id) throw new Error('Student ID is required');
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching student:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!id
  });

  // Fetch attendance records
  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching attendance:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!id
  });

  // Fetch test results
  const { data: testResults = [], isLoading: testResultsLoading } = useQuery({
    queryKey: ['test_results', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          *,
          test_id
        `)
        .eq('student_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching test results:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!id
  });

  // Fetch tests for test results
  const { data: tests = [] } = useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tests')
        .select('*');

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch fee transactions
  const { data: feeTransactions = [], isLoading: feeTransactionsLoading } = useQuery({
    queryKey: ['fee_transactions', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('fee_transactions')
        .select('*')
        .eq('student_id', id)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching fee transactions:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!id
  });

  // Add fee payment mutation
  const addFeePaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      console.log('Adding fee payment with data:', paymentData);

      // Insert the fee transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('fee_transactions')
        .insert(paymentData)
        .select()
        .single();

      if (transactionError) {
        console.error('Transaction error:', transactionError);
        throw transactionError;
      }

      // Update the student's paid fees
      if (student) {
        const newPaidFees = (student.paid_fees || 0) + paymentData.amount;
        const newFeeStatus = newPaidFees >= student.total_fees ? 'Paid' : 
                            newPaidFees > 0 ? 'Partial' : 'Pending';

        const { error: updateError } = await supabase
          .from('students')
          .update({
            paid_fees: newPaidFees,
            fee_status: newFeeStatus
          })
          .eq('id', student.id);

        if (updateError) {
          console.error('Student update error:', updateError);
          throw updateError;
        }
      }

      return transactionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['fee_transactions', id] });
      setIsFeeDialogOpen(false);
      toast.success("Fee payment added successfully", {
        description: "The fee transaction has been recorded"
      });
    },
    onError: (error: any) => {
      console.error('Fee payment addition error:', error);
      toast.error(`Failed to add fee payment: ${error.message}`);
    }
  });

  // Calculate attendance statistics
  const attendanceStats = React.useMemo(() => {
    if (!attendanceRecords.length) return null;

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.status === 'Present').length;
    const absentDays = attendanceRecords.filter(record => record.status === 'Absent').length;
    const lateDays = attendanceRecords.filter(record => record.status === 'Late').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendancePercentage
    };
  }, [attendanceRecords]);

  // Calculate test performance statistics
  const testStats = React.useMemo(() => {
    if (!testResults.length) return null;

    const totalTests = testResults.length;
    const averagePercentage = testResults.reduce((sum, result) => sum + (result.percentage || 0), 0) / totalTests;
    const highestScore = Math.max(...testResults.map(result => result.percentage || 0));
    const lowestScore = Math.min(...testResults.map(result => result.percentage || 0));

    return {
      totalTests,
      averagePercentage: Math.round(averagePercentage),
      highestScore,
      lowestScore
    };
  }, [testResults]);

  // Handle fee submission with proper Promise<void> return type
  const handleFeeSubmit = async (data: any): Promise<void> => {
    await addFeePaymentMutation.mutateAsync(data);
  };

  if (studentLoading) return <LoadingState />;
  if (studentError || !student) return <StudentNotFoundState />;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <StudentDetailHeader 
          student={student}
          onBack={() => navigate('/students')}
          onCall={() => setIsCallModalOpen(true)}
          onEdit={() => navigate(`/students/${id}/edit`)}
        />

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StudentOverviewCard
            title="Attendance"
            value={`${attendanceStats?.attendancePercentage || 0}%`}
            description={`${attendanceStats?.presentDays || 0} of ${attendanceStats?.totalDays || 0} days`}
            icon={<Calendar className="h-5 w-5" />}
            color="blue"
          />
          
          <StudentOverviewCard
            title="Test Average"
            value={`${testStats?.averagePercentage || 0}%`}
            description={`${testStats?.totalTests || 0} tests taken`}
            icon={<Award className="h-5 w-5" />}
            color="green"
          />
          
          <StudentOverviewCard
            title="Fee Status"
            value={student.fee_status}
            description={`₹${student.paid_fees || 0} of ₹${student.total_fees || 0}`}
            icon={<CreditCard className="h-5 w-5" />}
            color={student.fee_status === 'Paid' ? 'green' : student.fee_status === 'Partial' ? 'yellow' : 'red'}
          />
          
          <StudentOverviewCard
            title="Class Rank"
            value="#-"
            description="Coming soon"
            icon={<TrendingUp className="h-5 w-5" />}
            color="purple"
          />
        </div>

        {/* Detailed Information Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Full Name:</span>
                      <p className="font-medium">{student.full_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Class:</span>
                      <p className="font-medium">{student.class}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Roll Number:</span>
                      <p className="font-medium">{student.roll_number}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gender:</span>
                      <p className="font-medium">{student.gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date of Birth:</span>
                      <p className="font-medium">{student.date_of_birth ? format(new Date(student.date_of_birth), 'dd MMM yyyy') : 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Admission Date:</span>
                      <p className="font-medium">{student.admission_date ? format(new Date(student.admission_date), 'dd MMM yyyy') : 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Father's Name:</span>
                      <p className="font-medium">{student.father_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mother's Name:</span>
                      <p className="font-medium">{student.mother_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Contact Number:</span>
                      <p className="font-medium">{student.contact_number}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">WhatsApp Number:</span>
                      <p className="font-medium">{student.whatsapp_number || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{student.email || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Address:</span>
                      <p className="font-medium">{student.address || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            {attendanceLoading ? (
              <LoadingState />
            ) : attendanceRecords.length === 0 ? (
              <EmptyState 
                icon={<Calendar className="h-10 w-10 text-muted-foreground" />} 
                title="No attendance records" 
                description="No attendance records found for this student." 
              />
            ) : (
              <>
                <AttendanceHistoryCard 
                  attendanceStats={attendanceStats} 
                  student={student}
                />
                <AttendanceHistoryTable 
                  attendanceRecords={attendanceRecords}
                />
              </>
            )}
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-6">
            {testResultsLoading ? (
              <LoadingState />
            ) : (
              <StudentTestResults 
                testResults={testResults}
                tests={tests}
                testStats={testStats}
              />
            )}
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Fee Records</h3>
              <Button 
                onClick={() => setIsFeeDialogOpen(true)}
                className="bg-black hover:bg-black/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </div>

            {/* Fee Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Fees</p>
                      <p className="text-2xl font-bold">₹{student.total_fees || 0}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Paid Amount</p>
                      <p className="text-2xl font-bold text-green-600">₹{student.paid_fees || 0}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Amount</p>
                      <p className="text-2xl font-bold text-red-600">
                        ₹{Math.max(0, (student.total_fees || 0) - (student.paid_fees || 0))}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fee Transactions */}
            {feeTransactionsLoading ? (
              <LoadingState />
            ) : feeTransactions.length === 0 ? (
              <EmptyState 
                icon={<FileText className="h-10 w-10 text-muted-foreground" />} 
                title="No fee transactions" 
                description="No fee transactions found for this student." 
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feeTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">₹{transaction.amount}</p>
                          <p className="text-sm text-muted-foreground">{transaction.purpose}</p>
                          <p className="text-xs text-muted-foreground">
                            Receipt: {transaction.receipt_number} • {transaction.payment_mode}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(new Date(transaction.payment_date), 'dd MMM yyyy')}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.academic_year}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Call Modal */}
      <EnhancedCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        student={student}
      />

      {/* Add Fee Payment Dialog */}
      <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Fee Payment</DialogTitle>
            <DialogDescription>
              Record a new fee payment for {student.full_name}.
            </DialogDescription>
          </DialogHeader>
          <FeeTransactionForm 
            onSubmit={handleFeeSubmit}
            preSelectedStudentId={student.id}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

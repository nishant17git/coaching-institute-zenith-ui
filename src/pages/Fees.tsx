
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { StudentFeeCard } from "@/components/fees/StudentFeeCard";

// Icons
import { Search, Plus, CreditCard, FileText, Filter } from "lucide-react";

export default function Fees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    payment_mode: "Cash",
    receipt_number: "",
    purpose: "School Fees",
    academic_year: "2024-25"
  });

  // Fetch students data
  const {
    data: students = [],
    isLoading: isLoadingStudents
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch fee transactions
  const {
    data: feeTransactions = [],
    isLoading: isLoadingTransactions
  } = useQuery({
    queryKey: ['feeTransactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_transactions')
        .select(`
          *,
          students!inner(full_name, class)
        `)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Add payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const { data, error } = await supabase
        .from('fee_transactions')
        .insert([{
          student_id: paymentData.student_id,
          amount: paymentData.amount,
          payment_date: new Date().toISOString().split('T')[0], // Use payment_date instead of date
          payment_mode: paymentData.payment_mode,
          receipt_number: paymentData.receipt_number,
          purpose: paymentData.purpose,
          academic_year: paymentData.academic_year
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsAddPaymentDialogOpen(false);
      setSelectedStudentId(null);
      resetForm();
      toast.success("Payment added successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to add payment: ${error.message}`);
    }
  });

  const resetForm = () => {
    setFormData({
      amount: "",
      payment_mode: "Cash",
      receipt_number: "",
      purpose: "School Fees",
      academic_year: "2024-25"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudentId) return;

    const paymentData = {
      student_id: selectedStudentId,
      amount: parseFloat(formData.amount),
      payment_mode: formData.payment_mode,
      receipt_number: formData.receipt_number,
      purpose: formData.purpose,
      academic_year: formData.academic_year
    };

    addPaymentMutation.mutate(paymentData);
  };

  const handleAddPayment = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsAddPaymentDialogOpen(true);
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const nameMatches = student.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatches = statusFilter === "all" || student.fee_status === statusFilter;
    const classMatches = classFilter === "all" || student.class.toString() === classFilter;
    
    return nameMatches && statusMatches && classMatches;
  });

  // Get unique classes for filter
  const classes = [...new Set(students.map(student => student.class.toString()))];

  // Calculate statistics
  const totalFees = students.reduce((sum, student) => sum + (student.total_fees || 0), 0);
  const totalPaid = students.reduce((sum, student) => sum + (student.paid_fees || 0), 0);
  const totalPending = totalFees - totalPaid;
  const paidStudents = students.filter(student => student.fee_status === "Paid").length;
  const pendingStudents = students.filter(student => student.fee_status === "Pending").length;
  const partialStudents = students.filter(student => student.fee_status === "Partial").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <EnhancedPageHeader 
        title="Fee Management" 
        subtitle="Manage student fee collections and payments"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalFees.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalPending.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0}%
            </div>
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

          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Fee Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Student Fee Cards */}
      {isLoadingStudents ? (
        <LoadingState />
      ) : filteredStudents.length === 0 ? (
        <EmptyState 
          icon={<CreditCard className="h-10 w-10 text-muted-foreground" />} 
          title="No students found" 
          description="No students match your current filters." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => (
            <StudentFeeCard
              key={student.id}
              student={student}
              onAddPayment={handleAddPayment}
            />
          ))}
        </div>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <LoadingState />
          ) : feeTransactions.length === 0 ? (
            <EmptyState 
              icon={<FileText className="h-8 w-8 text-muted-foreground" />}
              title="No transactions found"
              description="No fee transactions have been recorded yet."
            />
          ) : (
            <div className="space-y-3">
              {feeTransactions.slice(0, 10).map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{transaction.students?.full_name}</h4>
                      <Badge variant="outline">Class {transaction.students?.class}</Badge>
                      <Badge variant="secondary">{transaction.payment_mode}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(transaction.payment_date), 'MMM dd, yyyy')} • {transaction.purpose}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">₹{transaction.amount}</div>
                    <div className="text-sm text-muted-foreground">#{transaction.receipt_number}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Fee Payment</DialogTitle>
            <DialogDescription>
              Record a new fee payment for the selected student.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="student">Student</Label>
              <Select 
                value={selectedStudentId || ""} 
                onValueChange={setSelectedStudentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} - Class {student.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="5000"
                  required
                />
              </div>
              <div>
                <Label htmlFor="payment_mode">Payment Mode</Label>
                <Select 
                  value={formData.payment_mode} 
                  onValueChange={(value) => setFormData({ ...formData, payment_mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="receipt_number">Receipt Number</Label>
                <Input
                  id="receipt_number"
                  value={formData.receipt_number}
                  onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                  placeholder="RCP001"
                  required
                />
              </div>
              <div>
                <Label htmlFor="academic_year">Academic Year</Label>
                <Input
                  id="academic_year"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  placeholder="2024-25"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="School Fees"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddPaymentDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={addPaymentMutation.isPending}
              >
                Add Payment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

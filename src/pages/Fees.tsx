import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { FeeTransactionForm } from "@/components/fees/FeeTransactionForm";
import { FeeTransactionCard } from "@/components/fees/FeeTransactionCard";
import { StudentFeeCard } from "@/components/fees/StudentFeeCard";

// Icons
import { Search, Download, Plus, HandCoins, ReceiptIndianRupee, School, Users } from "lucide-react";

import { useDebounce } from "@/hooks/useDebounce";

export default function Fees() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "amount" | "student">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"transactions" | "students">("transactions");
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Fetch students data with fee totals calculation
  const {
    data: students = [],
    isLoading: studentsLoading
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('class', { ascending: true })
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch fee transactions
  const {
    data: feeTransactions = [],
    isLoading: transactionsLoading
  } = useQuery({
    queryKey: ['feeTransactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_transactions')
        .select('*')
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Calculate summary from actual data
  const totalFees = students.reduce((sum, student) => sum + (student.total_fees || 0), 0);
  const collectedFees = students.reduce((sum, student) => sum + (student.paid_fees || 0), 0);
  const pendingFees = totalFees - collectedFees;
  const percentageCollected = totalFees > 0 ? Math.round((collectedFees / totalFees) * 100) : 0;

  // Add payment mutation with updated structure
  const addPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      // Format the data for submission with required fields
      const formattedData = {
        student_id: paymentData.student_id,
        amount: paymentData.amount,
        payment_date: paymentData.date,
        payment_mode: paymentData.paymentMode,
        receipt_number: paymentData.receiptNumber,
        purpose: paymentData.purpose,
        academic_year: new Date().getFullYear().toString(),
        term: 'General',
        discount: 0,
        late_fee: 0,
        notes: paymentData.notes || '',
        due_date: paymentData.date,
        months: paymentData.months || []
      };

      // Insert the fee transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('fee_transactions')
        .insert(formattedData)
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update the student's paid fees
      const student = students.find(s => s.id === paymentData.student_id);
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

        if (updateError) throw updateError;
      }

      return transactionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['feeTransactions'] });
      setIsAddPaymentDialogOpen(false);
      setSelectedTransaction(null);
      setSelectedStudentId(null);
      toast.success("Payment added successfully", {
        description: "The fee transaction has been recorded",
        action: {
          label: "View",
          onClick: () => setActiveTab("transactions")
        }
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to add payment: ${error.message}`);
    }
  });

  // Update payment mutation with updated structure
  const updatePaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      // Format the data for submission
      const formattedData = {
        student_id: paymentData.student_id,
        amount: paymentData.amount,
        payment_date: paymentData.date,
        payment_mode: paymentData.paymentMode,
        receipt_number: paymentData.receiptNumber,
        purpose: paymentData.purpose,
        notes: paymentData.notes || '',
        months: paymentData.months || []
      };

      // Calculate amount difference for student fee update
      const originalTransaction = feeTransactions.find(t => t.id === selectedTransaction.id);
      const amountDifference = paymentData.amount - originalTransaction.amount;

      // Update the fee transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('fee_transactions')
        .update(formattedData)
        .eq('id', selectedTransaction.id)
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update the student's paid fees if amount changed
      if (amountDifference !== 0) {
        const student = students.find(s => s.id === paymentData.student_id);
        if (student) {
          const newPaidFees = (student.paid_fees || 0) + amountDifference;
          const newFeeStatus = newPaidFees >= student.total_fees ? 'Paid' : 
                              newPaidFees > 0 ? 'Partial' : 'Pending';

          const { error: updateError } = await supabase
            .from('students')
            .update({
              paid_fees: newPaidFees,
              fee_status: newFeeStatus
            })
            .eq('id', student.id);

          if (updateError) throw updateError;
        }
      }

      return transactionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['feeTransactions'] });
      setIsAddPaymentDialogOpen(false);
      setSelectedTransaction(null);
      toast.success("Payment updated successfully", {
        description: "The fee transaction has been updated",
        action: {
          label: "View",
          onClick: () => setActiveTab("transactions")
        }
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to update payment: ${error.message}`);
    }
  });

  // Delete payment mutation
  const deletePaymentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTransaction) throw new Error("No transaction selected");

      // Get the transaction to be deleted
      const transaction = feeTransactions.find(t => t.id === selectedTransaction.id);
      if (!transaction) throw new Error("Transaction not found");

      // Delete the transaction
      const { error: deleteError } = await supabase
        .from('fee_transactions')
        .delete()
        .eq('id', transaction.id);

      if (deleteError) throw deleteError;

      // Update the student's paid fees
      const student = students.find(s => s.id === transaction.student_id);
      if (student) {
        const newPaidFees = Math.max(0, (student.paid_fees || 0) - transaction.amount);
        const newFeeStatus = newPaidFees >= student.total_fees ? 'Paid' : 
                            newPaidFees > 0 ? 'Partial' : 'Pending';

        const { error: updateError } = await supabase
          .from('students')
          .update({
            paid_fees: newPaidFees,
            fee_status: newFeeStatus
          })
          .eq('id', student.id);

        if (updateError) throw updateError;
      }

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['feeTransactions'] });
      setIsAddPaymentDialogOpen(false);
      setSelectedTransaction(null);
      toast.success("Payment deleted successfully", {
        description: "The fee transaction has been removed"
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete payment: ${error.message}`);
    }
  });

  // Enhanced filter and sort transactions with debounced search
  const filteredTransactions = feeTransactions.filter(transaction => {
    const student = students.find(s => s.id === transaction.student_id);
    const searchLower = debouncedSearchQuery.toLowerCase().trim();
    
    // Enhanced search matching
    const studentMatches = !searchLower || (
      student?.full_name?.toLowerCase().includes(searchLower) ||
      student?.class?.toString().includes(searchLower) ||
      student?.roll_number?.toString().includes(searchLower) ||
      student?.contact_number?.includes(searchLower)
    );
    
    const receiptMatches = !searchLower || transaction.receipt_number?.toLowerCase().includes(searchLower);
    const purposeMatches = !searchLower || transaction.purpose?.toLowerCase().includes(searchLower);
    const amountMatches = !searchLower || transaction.amount?.toString().includes(searchQuery);

    // Handle status filter
    const statusMatches = statusFilter === "all" || 
                         (statusFilter === "paid" && transaction.payment_mode !== null) ||
                         (statusFilter === "pending" && transaction.payment_mode === null);

    // Handle period filter
    let periodMatches = true;
    if (periodFilter !== "all") {
      const today = new Date();
      const transactionDate = new Date(transaction.payment_date);

      if (periodFilter === "thisMonth") {
        periodMatches = transactionDate.getMonth() === today.getMonth() && 
                       transactionDate.getFullYear() === today.getFullYear();
      } else if (periodFilter === "lastMonth") {
        const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
        const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
        periodMatches = transactionDate.getMonth() === lastMonth && 
                       transactionDate.getFullYear() === lastMonthYear;
      } else if (periodFilter === "thisYear") {
        periodMatches = transactionDate.getFullYear() === today.getFullYear();
      }
    }

    return (studentMatches || receiptMatches || purposeMatches || amountMatches) && statusMatches && periodMatches;
  }).sort((a, b) => {
    // Handle sorting
    if (sortField === "date") {
      const dateA = new Date(a.payment_date).getTime();
      const dateB = new Date(b.payment_date).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortField === "amount") {
      return sortDirection === "asc" ? a.amount - b.amount : b.amount - a.amount;
    } else if (sortField === "student") {
      const studentA = students.find(s => s.id === a.student_id)?.full_name || "";
      const studentB = students.find(s => s.id === b.student_id)?.full_name || "";
      return sortDirection === "asc" ? studentA.localeCompare(studentB) : studentB.localeCompare(studentA);
    }
    return 0;
  });

  // Toggle sort direction
  const handleSort = (field: "date" | "amount" | "student") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Export fees data as CSV
  const exportFeeData = () => {
    try {
      // Create CSV content
      let csvContent = "Student,Class,Date,Amount,Payment Mode,Receipt,Purpose\n";
      feeTransactions.forEach(transaction => {
        const student = students.find(s => s.id === transaction.student_id);
        if (student) {
          const row = [
            student.full_name,
            `Class ${student.class}`,
            new Date(transaction.payment_date).toLocaleDateString(),
            `₹${transaction.amount}`,
            transaction.payment_mode,
            transaction.receipt_number,
            transaction.purpose || ""
          ].map(item => `"${item}"`).join(",");
          csvContent += row + "\n";
        }
      });

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `fee_transactions_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Fee data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export fee data");
    }
  };

  const handleAddPaymentForStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setSelectedTransaction(null);
    setIsAddPaymentDialogOpen(true);
  };

  const handleEditTransaction = (transaction: any) => {
    // Format transaction data for the form
    setSelectedTransaction({
      ...transaction,
      paymentMode: transaction.payment_mode
    });
    setSelectedStudentId(transaction.student_id);
    setIsAddPaymentDialogOpen(true);
  };

  // Handle form submission based on whether it's an add or edit operation
  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedTransaction) {
        // Edit payment logic
        await updatePaymentMutation.mutateAsync({
          ...data,
          id: selectedTransaction.id
        });
      } else {
        // Add payment logic
        await addPaymentMutation.mutateAsync(data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save payment.");
    }
  };

  const handleDeleteTransaction = () => {
    return deletePaymentMutation.mutate();
  };

  // Enhanced filtered students for the Student Fee Status section
  const filteredStudents = students.filter(student => {
    const searchLower = debouncedSearchQuery.toLowerCase().trim();
    return !searchLower || (
      student.full_name?.toLowerCase().includes(searchLower) ||
      student.class?.toString().includes(searchLower) ||
      student.roll_number?.toString().includes(searchLower) ||
      student.father_name?.toLowerCase().includes(searchLower) ||
      student.contact_number?.includes(searchLower)
    );
  }).sort((a, b) => {
    // Sort by fee status: Pending first, then Partial, then Paid
    const statusOrder = { "Pending": 0, "Partial": 1, "Paid": 2 };
    const statusA = statusOrder[a.fee_status as keyof typeof statusOrder] || 0;
    const statusB = statusOrder[b.fee_status as keyof typeof statusOrder] || 0;
    return statusA - statusB;
  });

  // Determine if there are pending operations
  const isPending = addPaymentMutation.isPending || updatePaymentMutation.isPending || deletePaymentMutation.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      <EnhancedPageHeader 
        title="Fees" 
        action={
          <Button 
            onClick={() => {
              setSelectedTransaction(null);
              setSelectedStudentId(null);
              setIsAddPaymentDialogOpen(true);
            }} 
            className="bg-black hover:bg-black/80"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Payment
          </Button>
        } 
      />

      {/* Fee Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-4 border-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              <School className="h-4 w-4" /> Total Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalFees.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">All students</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <HandCoins className="h-4 w-4" /> Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{collectedFees.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{percentageCollected}% of total</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-b-4 border-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
              <ReceiptIndianRupee className="h-4 w-4" /> Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingFees.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{100 - percentageCollected}% remaining</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b-4 border-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
              <Users className="h-4 w-4" /> Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {students.filter(s => s.fee_status === "Paid").length} paid in full
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="bg-background/60 backdrop-blur-sm p-5 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search students, receipts, amounts..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10 h-11 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:scale-[1.01]" 
            />
            {debouncedSearchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                {activeTab === "transactions" ? filteredTransactions.length : filteredStudents.length} found
              </div>
            )}
          </div>

          <div className="flex flex-row gap-3 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs for Transactions and Student Fee Status */}
      <Tabs defaultValue="transactions" value={activeTab} onValueChange={value => setActiveTab(value as "transactions" | "students")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Fee Transactions</TabsTrigger>
          <TabsTrigger value="students">Student Fee Status</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-4">
          <Card className="shadow-sm border-muted">
            <CardContent className="p-4">
              {transactionsLoading || studentsLoading ? (
                <LoadingState />
              ) : filteredTransactions.length === 0 ? (
                <EmptyState 
                  icon={<ReceiptIndianRupee className="h-10 w-10 text-muted-foreground" />} 
                  title="No transactions found" 
                  description="No fee transactions match your current filters." 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTransactions.map(transaction => (
                    <FeeTransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      student={students.find(s => s.id === transaction.student_id)}
                      onEdit={handleEditTransaction}
                    />
                  ))}
                </div>
              )}

              {filteredTransactions.length > 0 && (
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={exportFeeData} className="gap-2">
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Fee Status Tab */}
        <TabsContent value="students" className="mt-4">
          <Card className="shadow-sm border-muted">
            <CardContent className="p-4">
              {studentsLoading ? (
                <LoadingState />
              ) : filteredStudents.length === 0 ? (
                <EmptyState 
                  icon={<Users className="h-10 w-10 text-muted-foreground" />} 
                  title="No students found" 
                  description="No students match your search criteria." 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map(student => (
                    <StudentFeeCard
                      key={student.id}
                      student={student}
                      onAddPayment={handleAddPaymentForStudent}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Payment Dialog */}
      <Dialog 
        open={isAddPaymentDialogOpen} 
        onOpenChange={open => {
          if (!isPending) {
            setIsAddPaymentDialogOpen(open);
            if (!open) {
              setSelectedStudentId(null);
              setSelectedTransaction(null);
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedTransaction ? "Edit Fee Payment" : "Add Fee Payment"}</DialogTitle>
            <DialogDescription>
              {selectedTransaction ? "Update an existing fee payment record." : "Record a new fee payment for a student."}
            </DialogDescription>
          </DialogHeader>
          <FeeTransactionForm 
            transaction={selectedTransaction} 
            onSubmit={handleFormSubmit} 
            onDelete={selectedTransaction ? handleDeleteTransaction : undefined} 
            preSelectedStudentId={selectedStudentId} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}


import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { StudentRecord } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useIsMobile } from "@/hooks/use-mobile";

// Icons
import { Search, ArrowUpDown, Download, Calendar, Plus, Loader2, Coins, Receipt, CreditCard, School, Users } from "lucide-react";

export default function Fees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Generate receipt number (current date + random 4 digits)
  const generateReceiptNumber = () => {
    const date = new Date();
    const dateStr = format(date, 'yyyyMMdd');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `REC${dateStr}${randomNum}`;
  };

  // Add fee payment form schema
  const paymentSchema = z.object({
    student_id: z.string({ required_error: "Student is required" }),
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),
    date: z.string().refine(val => new Date(val) <= new Date(), { 
      message: "Date cannot be in the future" 
    }),
    payment_mode: z.string().refine(val => ["Cash", "Online", "Cheque"].includes(val), {
      message: "Invalid payment mode"
    }),
    receipt_number: z.string().min(3, "Receipt number is required"),
    purpose: z.string().optional()
  });

  type PaymentFormValues = z.infer<typeof paymentSchema>;
  
  const queryClient = useQueryClient();

  // Fetch students data
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

  // Fetch fee transactions
  const { data: feeTransactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['feeTransactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_transactions')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate summary
  const totalFees = students.reduce((sum, student) => sum + (student.total_fees || 0), 0);
  const collectedFees = students.reduce((sum, student) => sum + (student.paid_fees || 0), 0);
  const pendingFees = totalFees - collectedFees;
  const percentageCollected = totalFees > 0 ? Math.round((collectedFees / totalFees) * 100) : 0;

  // Add payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      // Insert the fee transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('fee_transactions')
        .insert(paymentData)
        .select();
      
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
            fee_status: newFeeStatus as "Paid" | "Partial" | "Pending"
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
      toast.success("Payment added successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to add payment: ${error.message}`);
    }
  });

  // Filter and sort transactions
  const filteredTransactions = feeTransactions
    .filter(transaction => {
      // Handle search
      const student = students.find(s => s.id === transaction.student_id);
      const studentMatches = student?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      
      // Handle status filter
      const statusMatches = statusFilter === "all" || 
                           (statusFilter === "paid" && transaction.payment_mode !== null) ||
                           (statusFilter === "pending" && transaction.payment_mode === null);
      
      // Handle period filter
      let periodMatches = true;
      if (periodFilter !== "all") {
        const today = new Date();
        const transactionDate = new Date(transaction.date);
        
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
      
      return studentMatches && statusMatches && periodMatches;
    })
    .sort((a, b) => {
      // Handle sorting
      if (sortField === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortDirection === "asc" 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      }
    });

  // Toggle sort direction
  const handleSort = (field: "date" | "amount") => {
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
            new Date(transaction.date).toLocaleDateString(),
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
    setIsAddPaymentDialogOpen(true);
  };

  const AddPaymentForm = () => {
    const form = useForm<PaymentFormValues>({
      resolver: zodResolver(paymentSchema),
      defaultValues: {
        student_id: selectedStudentId || "",
        amount: 0,
        date: format(new Date(), "yyyy-MM-dd"),
        payment_mode: "Cash",
        receipt_number: generateReceiptNumber(),
        purpose: "Fee Payment"
      }
    });

    // Reset form when dialog opens with selected student
    React.useEffect(() => {
      if (selectedStudentId) {
        form.setValue('student_id', selectedStudentId);
      }
    }, [selectedStudentId, form]);
    
    // Get student by ID for showing due amount
    const selectedStudentId = form.watch("student_id");
    const selectedStudent = students.find(s => s.id === selectedStudentId);
    const outstandingAmount = selectedStudent ? 
      selectedStudent.total_fees - selectedStudent.paid_fees : 0;
    
    const onSubmit = (data: PaymentFormValues) => {
      addPaymentMutation.mutate(data);
    };
    
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="student_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name} - Class {student.class}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {selectedStudent && (
            <div className="text-sm p-3 rounded-md bg-muted/50 border border-muted-foreground/10">
              <div className="grid grid-cols-2 gap-2">
                <span>Total Fees:</span>
                <span className="text-right font-medium">₹{selectedStudent.total_fees.toLocaleString()}</span>
                
                <span>Paid Fees:</span>
                <span className="text-right font-medium">₹{selectedStudent.paid_fees.toLocaleString()}</span>
                
                <span>Outstanding:</span>
                <span className="text-right font-medium text-red-500">₹{outstandingAmount.toLocaleString()}</span>
              </div>
            </div>
          )}
          
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} max={format(new Date(), "yyyy-MM-dd")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="payment_mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Mode</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="receipt_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receipt Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Fee payment purpose" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsAddPaymentDialogOpen(false);
                setSelectedStudentId(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={addPaymentMutation.isPending}
            >
              {addPaymentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : "Add Payment"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <EnhancedPageHeader 
        title="Fee Management" 
        description="Manage student fees and payments"
        action={
          <div className="flex gap-2">
            <Button onClick={() => setIsAddPaymentDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" /> Add Payment
            </Button>
            <Button variant="outline" onClick={exportFeeData}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        }
      />

      {/* Fee Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-4 border-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              <School className="h-4 w-4" /> Total Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalFees.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">All students</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <Coins className="h-4 w-4" /> Collected Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{collectedFees.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">{percentageCollected}% of total</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b-4 border-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
              <Receipt className="h-4 w-4" /> Pending Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingFees.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">{100 - percentageCollected}% remaining</div>
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
            <div className="text-sm text-muted-foreground">
              {students.filter(s => s.fee_status === "Paid").length} paid in full
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/60 backdrop-blur-sm"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="thisYear">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      <Card className="shadow-sm border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Fee Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading || studentsLoading ? (
            <LoadingState />
          ) : filteredTransactions.length === 0 ? (
            <EmptyState 
              icon={<Receipt className="h-10 w-10 text-muted-foreground" />} 
              title="No transactions found" 
              description="No fee transactions match your current filters." 
            />
          ) : (
            <div className="overflow-hidden rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Student</th>
                      <th 
                        className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center gap-1">
                          Date
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer"
                        onClick={() => handleSort("amount")}
                      >
                        <div className="flex items-center gap-1">
                          Amount
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Mode</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Receipt #</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => {
                      const student = students.find(s => s.id === transaction.student_id);
                      
                      return (
                        <motion.tr 
                          key={transaction.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border-t hover:bg-muted/30"
                        >
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-medium">{student?.full_name || 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">Class {student?.class}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{new Date(transaction.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-medium">₹{transaction.amount.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <Badge variant={transaction.payment_mode === "Cash" ? "outline" : 
                                          transaction.payment_mode === "Online" ? "secondary" : "default"}>
                              {transaction.payment_mode}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">{transaction.receipt_number}</td>
                          <td className="px-4 py-3 text-sm">{transaction.purpose || '-'}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Fee Status */}
      <Card className="shadow-sm border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Student Fee Status</CardTitle>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <LoadingState />
          ) : students.length === 0 ? (
            <EmptyState 
              icon={<Users className="h-10 w-10 text-muted-foreground" />} 
              title="No students found" 
              description="No students have been added to the system yet." 
            />
          ) : (
            <div className="overflow-hidden rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Student</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Class</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total Fees</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Paid</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Balance</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students
                      .filter(student => 
                        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        student.class.toString().includes(searchQuery)
                      )
                      .map((student) => {
                        const balance = student.total_fees - student.paid_fees;
                        const percentage = student.total_fees > 0 ? 
                          Math.round((student.paid_fees / student.total_fees) * 100) : 0;
                        
                        return (
                          <motion.tr 
                            key={student.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border-t hover:bg-muted/30"
                          >
                            <td className="px-4 py-3 font-medium">{student.full_name}</td>
                            <td className="px-4 py-3">Class {student.class}</td>
                            <td className="px-4 py-3">₹{student.total_fees.toLocaleString()}</td>
                            <td className="px-4 py-3 text-green-600 font-medium">₹{student.paid_fees.toLocaleString()}</td>
                            <td className="px-4 py-3 text-red-500 font-medium">₹{balance.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <Badge className={
                                student.fee_status === "Paid" ? "bg-green-100 text-green-800 hover:bg-green-200" :
                                student.fee_status === "Partial" ? "bg-amber-100 text-amber-800 hover:bg-amber-200" :
                                "bg-red-100 text-red-800 hover:bg-red-200"
                              }>
                                {student.fee_status} {student.fee_status === "Partial" && `(${percentage}%)`}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                onClick={() => handleAddPaymentForStudent(student.id)}
                              >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Payment
                              </Button>
                            </td>
                          </motion.tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentDialogOpen} onOpenChange={(open) => {
        setIsAddPaymentDialogOpen(open);
        if (!open) setSelectedStudentId(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Fee Payment</DialogTitle>
            <DialogDescription>
              Record a new fee payment for a student.
            </DialogDescription>
          </DialogHeader>
          <AddPaymentForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}

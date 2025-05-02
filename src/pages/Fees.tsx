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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useIsMobile } from "@/hooks/use-mobile";

// Icons
import { Search, ArrowUpDown, Download, Calendar, Plus, Loader2, Coins, Receipt, CreditCard } from "lucide-react";

export default function Fees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
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
  
  const AddPaymentForm = () => {
    const form = useForm<PaymentFormValues>({
      resolver: zodResolver(paymentSchema),
      defaultValues: {
        student_id: "",
        amount: 0,
        date: format(new Date(), "yyyy-MM-dd"),
        payment_mode: "Cash",
        receipt_number: generateReceiptNumber(),
        purpose: "Fee Payment"
      }
    });
    
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
            <div className="text-sm p-3 rounded-md bg-muted">
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
              onClick={() => setIsAddPaymentDialogOpen(false)}
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

  // Update the button click handlers to use paymentForm instead of form
  const handlePayButtonClick = (student: any) => {
    // We need to ensure the student has the correct type for fee_status
    // Type assertion to fix the issue
    const validFeeStatus = student.fee_status as "Paid" | "Pending" | "Partial";
    
    const typedStudent: StudentRecord = {
      ...student,
      fee_status: validFeeStatus
    };
    
    // Instead of using paymentForm, we'll set the dialog state and pass the student data
    setIsAddPaymentDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Fee Management" 
        action={
          <div className="flex gap-2">
            <Button onClick={() => setIsAddPaymentDialogOpen(true)} className="bg-apple-green hover:bg-green-600">
              <Plus className="h-4 w-4 mr-2" /> Add Payment
            </Button>
            <Button 
              className="bg-apple-blue hover:bg-blue-600 text-white"
              onClick={exportFeeData}
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: "Total Fees", 
            value: `₹${totalFees.toLocaleString()}`,
            icon: <Coins className="h-6 w-6 text-muted-foreground" />,
            delay: 0,
            color: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
          },
          { 
            title: "Collected", 
            value: `₹${collectedFees.toLocaleString()}`,
            icon: <Receipt className="h-6 w-6 text-apple-green" />,
            delay: 1,
            color: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30"
          },
          { 
            title: "Pending", 
            value: `₹${pendingFees.toLocaleString()}`,
            icon: <CreditCard className="h-6 w-6 text-apple-red" />,
            delay: 2,
            color: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30"
          },
          { 
            title: "Percentage Collected", 
            value: `${percentageCollected}%`,
            icon: null,
            progressBar: true,
            progress: percentageCollected,
            delay: 3,
            color: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30"
          }
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <GlassCard className={`${card.color}`}>
              <GlassCardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <GlassCardTitle className="text-sm text-muted-foreground">{card.title}</GlassCardTitle>
                  {card.icon && card.icon}
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="text-2xl font-semibold">{card.value}</div>
                {card.progressBar && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <motion.div 
                        className="bg-apple-green h-2.5 rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: `${card.progress}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="transactions" className="flex-1 sm:flex-initial">Transactions</TabsTrigger>
          <TabsTrigger value="pending" className="flex-1 sm:flex-initial">Pending Fees</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {transactionsLoading ? (
            <LoadingState text="Loading transactions..." />
          ) : filteredTransactions.length === 0 ? (
            <EmptyState 
              icon={<Receipt className="h-10 w-10 text-muted-foreground" />}
              title="No transactions found"
              description="There are no fee transactions matching your search criteria."
              action={
                <Button onClick={() => setIsAddPaymentDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Payment
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {/* Mobile view: cards */}
              {isMobile ? (
                <AnimatePresence>
                  {filteredTransactions.map((transaction, index) => {
                    const student = students.find(s => s.id === transaction.student_id);
                    return (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <GlassCard>
                          <GlassCardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-lg">{student?.full_name || "Unknown Student"}</p>
                                <p className="text-sm text-muted-foreground">Class {student?.class || "N/A"}</p>
                              </div>
                              <Badge 
                                variant={
                                  transaction.payment_mode === "Cash" ? "outline" : 
                                  transaction.payment_mode === "Online" ? "secondary" : 
                                  "default"
                                }
                              >
                                {transaction.payment_mode}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mt-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Date</p>
                                <p>{new Date(transaction.date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Amount</p>
                                <p className="font-medium">₹{transaction.amount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Receipt No.</p>
                                <p className="text-sm">{transaction.receipt_number}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Purpose</p>
                                <p className="text-sm">{transaction.purpose || "Fee Payment"}</p>
                              </div>
                            </div>
                          </GlassCardContent>
                        </GlassCard>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              ) : (
                // Desktop view: table
                <GlassCard>
                  <div className="rounded-md overflow-hidden">
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 text-sm font-medium">
                      <div>Student</div>
                      <div 
                        className="cursor-pointer flex items-center justify-start" 
                        onClick={() => handleSort("date")}
                      >
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                      <div 
                        className="cursor-pointer flex items-center justify-start" 
                        onClick={() => handleSort("amount")}
                      >
                        Amount
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                      <div className="hidden md:block">Payment Mode</div>
                    </div>
                    <div className="divide-y">
                      <AnimatePresence>
                        {filteredTransactions.map((transaction, index) => {
                          const student = students.find(s => s.id === transaction.student_id);
                          return (
                            <motion.div 
                              key={transaction.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.03 }}
                              className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 items-center hover:bg-muted/20"
                            >
                              <div>
                                <div className="font-medium">{student?.full_name || "Unknown"}</div>
                                <div className="text-sm text-muted-foreground">Class {student?.class || "N/A"}</div>
                              </div>
                              <div>{new Date(transaction.date).toLocaleDateString()}</div>
                              <div className="font-medium">₹{transaction.amount.toLocaleString()}</div>
                              <div className="hidden md:block">
                                <Badge 
                                  variant={
                                    transaction.payment_mode === "Cash" ? "outline" : 
                                    transaction.payment_mode === "Online" ? "secondary" : 
                                    "default"
                                  }
                                >
                                  {transaction.payment_mode}
                                </Badge>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Receipt: {transaction.receipt_number}
                                </div>
                              </div>
                              <div className="block md:hidden mt-2">
                                <Badge 
                                  variant={
                                    transaction.payment_mode === "Cash" ? "outline" : 
                                    transaction.payment_mode === "Online" ? "secondary" : 
                                    "default"
                                  }
                                >
                                  {transaction.payment_mode}
                                </Badge>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  Receipt: {transaction.receipt_number}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending">
          {studentsLoading ? (
            <LoadingState text="Loading student data..." />
          ) : (
            <div className="space-y-4">
              {/* Mobile view: cards */}
              {isMobile ? (
                <AnimatePresence>
                  {students
                    .filter(student => student.fee_status !== "Paid")
                    .sort((a, b) => (b.total_fees - b.paid_fees) - (a.total_fees - a.paid_fees))
                    .map((student, index) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <GlassCard>
                          <GlassCardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-lg">{student.full_name}</p>
                                <p className="text-sm text-muted-foreground">Class {student.class}</p>
                              </div>
                              <Badge 
                                variant={student.fee_status === "Partial" ? "secondary" : "destructive"}
                              >
                                {student.fee_status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mt-4 mb-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Total</p>
                                <p>₹{student.total_fees.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Paid</p>
                                <p className="text-apple-green">₹{student.paid_fees.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Pending</p>
                                <p className="text-apple-red font-medium">₹{(student.total_fees - student.paid_fees).toLocaleString()}</p>
                              </div>
                            </div>
                            
                            <Button 
                              className="w-full"
                              onClick={() => handlePayButtonClick(student)}
                            >
                              <Plus className="h-4 w-4 mr-1" /> Pay Fees
                            </Button>
                          </GlassCardContent>
                        </GlassCard>
                      </motion.div>
                    ))}
                </AnimatePresence>
              ) : (
                // Desktop view: card list
                <GlassCard>
                  <div className="rounded-md overflow-hidden">
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-5 text-sm font-medium">
                      <div>Student</div>
                      <div className="hidden sm:block">Total Fees</div>
                      <div className="hidden sm:block">Paid</div>
                      <div>Pending</div>
                      <div className="hidden sm:block text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      <AnimatePresence>
                        {students
                          .filter(student => student.fee_status !== "Paid")
                          .sort((a, b) => (b.total_fees - b.paid_fees) - (a.total_fees - a.paid_fees))
                          .map((student, index) => (
                            <motion.div
                              key={student.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.03 }}
                              className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-2 hover:bg-muted/20"
                            >
                              <div>
                                <div className="font-medium">{student.full_name}</div>
                                <div className="text-sm text-muted-foreground">Class {student.class}</div>
                                <div className="sm:hidden grid grid-cols-3 gap-2 mt-2 text-sm">
                                  <div>
                                    <div className="text-muted-foreground">Total</div>
                                    <div>₹{student.total_fees.toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">Paid</div>
                                    <div className="text-apple-green">₹{student.paid_fees.toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground">Pending</div>
                                    <div className="text-apple-red font-medium">₹{(student.total_fees - student.paid_fees).toLocaleString()}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="hidden sm:block">₹{student.total_fees.toLocaleString()}</div>
                              <div className="hidden sm:block text-apple-green">₹{student.paid_fees.toLocaleString()}</div>
                              <div className="hidden sm:flex justify-between items-center">
                                <span className="text-apple-red font-medium">₹{(student.total_fees - student.paid_fees).toLocaleString()}</span>
                              </div>
                              <div className="hidden sm:flex justify-end">
                                <Button 
                                  size="sm" 
                                  onClick={() => handlePayButtonClick(student)}
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Pay
                                </Button>
                              </div>
                              <div className="sm:hidden mt-2">
                                <Button 
                                  className="w-full"
                                  onClick={() => handlePayButtonClick(student)}
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Pay Fees
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                      </AnimatePresence>
                      {students.filter(student => student.fee_status !== "Paid").length === 0 && (
                        <div className="p-4 text-center text-muted-foreground">
                          No pending fees
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Fee Payment</DialogTitle>
            <DialogDescription>
              Record a new fee payment for a student.
            </DialogDescription>
          </DialogHeader>

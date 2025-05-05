
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useIsMobile } from "@/hooks/use-mobile";

// Icons
import { Search, ArrowUpDown, Download, Calendar, Plus, Loader2, Coins, Receipt, CreditCard, School, Users, Filter, SlidersHorizontal } from "lucide-react";

// New components for improved mobile experience
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

export default function Fees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

  useEffect(() => {
    if (selectedStudentId) {
      // Handle selected student effect
    }
  }, [selectedStudentId]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const AddPaymentForm = () => {
    // Initialize form first before any hooks or effects
    const defaultValues = {
      student_id: selectedStudentId || "",
      amount: 0,
      date: format(new Date(), "yyyy-MM-dd"),
      payment_mode: "Cash",
      receipt_number: generateReceiptNumber(),
      purpose: "Fee Payment"
    };

    const form = useForm<PaymentFormValues>({
      resolver: zodResolver(paymentSchema),
      defaultValues
    });

    // Watch student ID for showing due amount
    const watchedStudentId = form.watch("student_id");
    const selectedStudent = students.find(s => s.id === watchedStudentId);
    const outstandingAmount = selectedStudent ? 
      selectedStudent.total_fees - selectedStudent.paid_fees : 0;

    // Effect to update form when selected student changes
    useEffect(() => {
      if (selectedStudentId) {
        form.setValue('student_id', selectedStudentId, {
          shouldValidate: true
        });
      }
    }, [selectedStudentId, form]);

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
            <div className="text-sm p-3 rounded-md bg-muted/50 border border-muted-foreground/10 space-y-1">
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

  // Mobile transaction card component
  const TransactionCard = ({ transaction, student }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border rounded-lg p-4 bg-white shadow-sm mb-2"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium">{student?.full_name || 'Unknown'}</h3>
            <p className="text-xs text-muted-foreground">Class {student?.class}</p>
          </div>
          <Badge variant={transaction.payment_mode === "Cash" ? "outline" : 
                        transaction.payment_mode === "Online" ? "secondary" : "default"}>
            {transaction.payment_mode}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-y-1 text-sm mt-3">
          <span className="text-muted-foreground">Date:</span>
          <span>{new Date(transaction.date).toLocaleDateString()}</span>
          
          <span className="text-muted-foreground">Amount:</span>
          <span className="font-medium">₹{transaction.amount.toLocaleString()}</span>
          
          <span className="text-muted-foreground">Receipt:</span>
          <span className="truncate">{transaction.receipt_number}</span>
          
          {transaction.purpose && (
            <>
              <span className="text-muted-foreground">Purpose:</span>
              <span>{transaction.purpose}</span>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  // Student Fee Card component
  const StudentFeeCard = ({ student }) => {
    const balance = student.total_fees - student.paid_fees;
    const percentage = student.total_fees > 0 ? 
      Math.round((student.paid_fees / student.total_fees) * 100) : 0;
      
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border rounded-lg p-4 bg-white shadow-sm mb-2"
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium">{student.full_name}</h3>
            <p className="text-xs text-muted-foreground">Class {student.class}</p>
          </div>
          <Badge className={
            student.fee_status === "Paid" ? "bg-green-100 text-green-800 hover:bg-green-200" :
            student.fee_status === "Partial" ? "bg-amber-100 text-amber-800 hover:bg-amber-200" :
            "bg-red-100 text-red-800 hover:bg-red-200"
          }>
            {student.fee_status} {student.fee_status === "Partial" && `(${percentage}%)`}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                percentage >= 75 ? "bg-green-500" : 
                percentage >= 25 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-2 gap-y-1 text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span>₹{student.total_fees.toLocaleString()}</span>
            
            <span className="text-muted-foreground">Paid:</span>
            <span className="text-green-600 font-medium">₹{student.paid_fees.toLocaleString()}</span>
            
            <span className="text-muted-foreground">Balance:</span>
            <span className="text-red-500 font-medium">₹{balance.toLocaleString()}</span>
          </div>
        </div>
        
        <Button 
          size="sm" 
          variant="outline"
          className="w-full mt-3 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          onClick={() => handleAddPaymentForStudent(student.id)}
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Payment
        </Button>
      </motion.div>
    );
  };

  const FilterDrawer = () => (
    <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <DrawerContent className="p-4 max-h-[85vh]">
        <div className="mx-auto w-full max-w-sm">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Filters</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={periodFilter} onValueChange={(value) => {
                setPeriodFilter(value);
                setCurrentPage(1);
              }}>
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <div className="flex gap-2">
                <Button
                  variant={sortField === "date" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSort("date")}
                  className="flex-1"
                >
                  Date {sortField === "date" && (
                    sortDirection === "asc" ? "↑" : "↓"
                  )}
                </Button>
                <Button
                  variant={sortField === "amount" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSort("amount")}
                  className="flex-1"
                >
                  Amount {sortField === "amount" && (
                    sortDirection === "asc" ? "↑" : "↓"
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              className="w-full mt-2" 
              variant="outline"
              onClick={() => {
                setStatusFilter("all");
                setPeriodFilter("all");
                setSearchQuery("");
                setCurrentPage(1);
                setIsFilterOpen(false);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center mt-4 items-center gap-1 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          &lt;
        </Button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => {
            // Show first page, last page, current page and pages around current page
            return page === 1 || 
                   page === totalPages || 
                   (page >= currentPage - 1 && page <= currentPage + 1);
          })
          .map((page, index, array) => {
            // Add ellipsis
            const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
            const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
            
            return (
              <React.Fragment key={page}>
                {showEllipsisBefore && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
                
                {showEllipsisAfter && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
              </React.Fragment>
            );
          })}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          &gt;
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-4 border-blue-500">
          <CardHeader className="pb-2 p-3 md:p-4">
            <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
              <School className="h-4 w-4" /> Total Fees
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3 md:p-6">
            <div className="text-lg md:text-2xl font-bold">₹{totalFees.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">All students</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-green-500">
          <CardHeader className="pb-2 p-3 md:p-4">
            <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
              <Coins className="h-4 w-4" /> Collected
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3 md:p-6">
            <div className="text-lg md:text-2xl font-bold">₹{collectedFees.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{percentageCollected}% of total</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b-4 border-amber-500">
          <CardHeader className="pb-2 p-3 md:p-4">
            <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400">
              <Receipt className="h-4 w-4" /> Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3 md:p-6">
            <div className="text-lg md:text-2xl font-bold">₹{pendingFees.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">{100 - percentageCollected}% remaining</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b-4 border-purple-500">
          <CardHeader className="pb-2 p-3 md:p-4">
            <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">
              <Users className="h-4 w-4" /> Students
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-3 md:p-6">
            <div className="text-lg md:text-2xl font-bold">{students.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {students.filter(s => s.fee_status === "Paid").length} paid in full
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for navigating between transactions and student fees */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="transactions">Fee Transactions</TabsTrigger>
          <TabsTrigger value="students">Student Fee Status</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters and Search - Mobile View */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-background/60 backdrop-blur-sm"
              />
            </div>

            {isMobile ? (
              <Button 
                variant="outline" 
                className="flex md:hidden items-center gap-2"
                onClick={() => setIsFilterOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {(statusFilter !== "all" || periodFilter !== "all") && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {statusFilter !== "all" && periodFilter !== "all" ? "2" : "1"}
                  </Badge>
                )}
              </Button>
            ) : (
              <>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full md:w-48">
                  <Select value={periodFilter} onValueChange={(value) => {
                    setPeriodFilter(value);
                    setCurrentPage(1);
                  }}>
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
              </>
            )}
          </div>

          {/* Transactions List */}
          {transactionsLoading || studentsLoading ? (
            <LoadingState />
          ) : filteredTransactions.length === 0 ? (
            <EmptyState 
              icon={<Receipt className="h-10 w-10 text-muted-foreground" />} 
              title="No transactions found" 
              description="No fee transactions match your current filters." 
            />
          ) : isMobile ? (
            // Mobile view - cards
            <div className="space-y-1">
              {paginatedTransactions.map((transaction) => {
                const student = students.find(s => s.id === transaction.student_id);
                return (
                  <TransactionCard 
                    key={transaction.id} 
                    transaction={transaction} 
                    student={student} 
                  />
                );
              })}
              <Pagination />
            </div>
          ) : (
            // Desktop view - table
            <Card className="shadow-sm border-muted">
              <CardContent className="p-0">
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
                        {paginatedTransactions.map((transaction) => {
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
                <div className="p-4">
                  <Pagination />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          {/* Search for students */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/60 backdrop-blur-sm"
            />
          </div>

          {/* Student Fee Status */}
          {studentsLoading ? (
            <LoadingState />
          ) : students.length === 0 ? (
            <EmptyState 
              icon={<Users className="h-10 w-10 text-muted-foreground" />} 
              title="No students found" 
              description="No students have been added to the system yet." 
            />
          ) : isMobile ? (
            // Mobile view - cards
            <div className="space-y-1">
              {students
                .filter(student => 
                  student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  student.class.toString().includes(searchQuery)
                )
                .map((student) => (
                  <StudentFeeCard key={student.id} student={student} />
                ))}
            </div>
          ) : (
            // Desktop view - table
            <Card className="shadow-sm border-muted">
              <CardContent className="p-0">
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
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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

      {/* Filter Drawer for Mobile */}
      <FilterDrawer />
    </div>
  );
}

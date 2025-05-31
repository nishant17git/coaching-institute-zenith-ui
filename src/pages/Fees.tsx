
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Loader2, Plus, Search, Filter, Download, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { StudentFeeCard } from "@/components/fees/StudentFeeCard";
import { useNewData } from "@/contexts/NewDataContext";
import { newStudentService } from "@/services/newStudentService";

export default function Fees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const { students, classes, isLoading } = useNewData();
  const queryClient = useQueryClient();

  // Get fee transactions for all students to calculate fee status
  const { data: allFeeTransactions = [] } = useQuery({
    queryKey: ['allFeeTransactions'],
    queryFn: async () => {
      const transactions = await Promise.all(
        students.map(student => newStudentService.getStudentFees(student.id))
      );
      return transactions.flat();
    },
    enabled: students.length > 0
  });

  // Calculate fee status for each student
  const studentsWithFeeStatus = students.map(student => {
    const studentTransactions = allFeeTransactions.filter(t => t.student_id === student.id);
    const totalPaid = studentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = 50000; // This should come from fee structure
    const balance = totalFees - totalPaid;
    
    let feeStatus: "Paid" | "Partial" | "Pending" = "Pending";
    if (totalPaid >= totalFees) {
      feeStatus = "Paid";
    } else if (totalPaid > 0) {
      feeStatus = "Partial";
    }

    return {
      ...student,
      totalFees,
      paidFees: totalPaid,
      balance,
      feeStatus
    };
  });

  // Filter students based on search term, class, and fee status
  const filteredStudents = studentsWithFeeStatus.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toString().includes(searchTerm);

    const matchesClass = selectedClass === "all" || student.class.includes(selectedClass.replace("Class ", ""));
    const matchesStatus = selectedStatus === "all" || student.feeStatus.toLowerCase() === selectedStatus;

    return matchesSearch && matchesClass && matchesStatus;
  });

  // Add fee transaction mutation
  const addFeeTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      return await newStudentService.addFeeTransaction({
        student_id: transactionData.studentId,
        amount: parseFloat(transactionData.amount),
        payment_date: transactionData.date,
        payment_mode: transactionData.paymentMode,
        receipt_number: transactionData.receiptNumber,
        purpose: transactionData.purpose,
        academic_year: "2024-25", // Default academic year
        late_fee: 0,
        discount: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allFeeTransactions'] });
      setIsAddPaymentDialogOpen(false);
      toast.success("Fee payment added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add fee payment");
    }
  });

  const handleAddPayment = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsAddPaymentDialogOpen(true);
  };

  // Add Fee Payment Form
  const AddFeePaymentForm = () => {
    const form = useForm({
      defaultValues: {
        amount: "",
        date: new Date().toISOString().split('T')[0],
        paymentMode: "Cash",
        receiptNumber: "",
        purpose: "School Fees"
      }
    });

    const onSubmit = (data: any) => {
      if (!selectedStudentId) return;

      addFeeTransactionMutation.mutate({
        studentId: selectedStudentId,
        ...data
      });
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter amount" 
                    {...field} 
                    required 
                  />
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
                  <Input type="date" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Mode</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receiptNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receipt Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter receipt number" {...field} required />
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
                <FormLabel>Purpose</FormLabel>
                <FormControl>
                  <Input placeholder="Payment purpose" {...field} required />
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
              disabled={addFeeTransactionMutation.isPending}
            >
              {addFeeTransactionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : "Add Payment"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  const selectedStudent = selectedStudentId ? students.find(s => s.id === selectedStudentId) : null;

  return (
    <div className="space-y-6 animate-fade-in font-spotify">
      <div className="flex items-center justify-between">
        <EnhancedPageHeader 
          title="Fee Management" 
          description="Track and manage student fee payments"
        />
        <Button variant="outline" className="font-spotify">
          <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.name}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fee Cards */}
        {isLoading ? (
          <LoadingState />
        ) : filteredStudents.length === 0 ? (
          <EmptyState 
            icon={<DollarSign className="h-10 w-10 text-muted-foreground" />}
            title="No students found"
            description="Try adjusting your search or filters to find students."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <StudentFeeCard
                key={student.id}
                student={student}
                onAddPayment={handleAddPayment}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
        <DialogContent className="max-w-md font-spotify">
          <DialogHeader>
            <DialogTitle className="font-spotify">Add Fee Payment</DialogTitle>
            <DialogDescription className="font-spotify">
              {selectedStudent && `Add fee payment for ${selectedStudent.name}`}
            </DialogDescription>
          </DialogHeader>
          <AddFeePaymentForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}

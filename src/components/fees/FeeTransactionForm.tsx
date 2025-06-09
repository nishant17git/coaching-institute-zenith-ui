
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Fee transaction form schema
const feeTransactionSchema = z.object({
  student_id: z.string().min(1, "Please select a student"),
  amount: z.coerce.number().positive("Amount must be positive"),
  paymentDate: z.date({ required_error: "Payment date is required" }),
  paymentMode: z.enum(["Cash", "Online", "Cheque", "UPI"]),
  purpose: z.enum(["Tuition Fee", "Admission Fee", "Test Series Fee"]),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
  months: z.array(z.string()).min(1, "Please select at least one month"),
});

type FeeTransactionFormValues = z.infer<typeof feeTransactionSchema>;

interface FeeTransactionFormProps {
  onSubmit: (data: FeeTransactionFormValues) => Promise<void>;
  submitLabel?: string;
  students?: any[];
  studentName?: string;
  transaction?: any;
  onDelete?: () => Promise<void>;
  preSelectedStudentId?: string;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function FeeTransactionForm({ 
  onSubmit, 
  submitLabel = "Add Payment", 
  students = [],
  studentName,
  transaction,
  onDelete,
  preSelectedStudentId
}: FeeTransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const defaultValues = transaction ? {
    student_id: transaction.student_id || preSelectedStudentId || "",
    amount: transaction.amount || 0,
    paymentDate: transaction.paymentDate ? new Date(transaction.paymentDate) : transaction.payment_date ? new Date(transaction.payment_date) : new Date(),
    paymentMode: transaction.paymentMode || transaction.payment_mode || "Cash" as const,
    purpose: transaction.purpose || "Tuition Fee" as const,
    receiptNumber: transaction.receiptNumber || transaction.receipt_number || "",
    notes: transaction.notes || "",
    months: transaction.months || [format(new Date(), "MMMM")],
  } : {
    student_id: preSelectedStudentId || "",
    amount: 0,
    paymentDate: new Date(),
    paymentMode: "Cash" as const,
    purpose: "Tuition Fee" as const,
    receiptNumber: "",
    notes: "",
    months: [format(new Date(), "MMMM")],
  };

  const form = useForm<FeeTransactionFormValues>({
    resolver: zodResolver(feeTransactionSchema),
    defaultValues,
  });

  const handleSubmit = async (data: FeeTransactionFormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast.success(transaction ? "Payment updated successfully" : "Payment added successfully", {
        description: `Payment of ₹${data.amount} has been ${transaction ? 'updated' : 'recorded'}`
      });
      if (!transaction) {
        form.reset(defaultValues);
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error("Failed to process payment", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;

    try {
      setIsDeleting(true);
      await onDelete();
      toast.success("Payment deleted successfully");
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error("Failed to delete payment", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedMonths = form.watch("months");

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-geist">
                <CreditCard className="h-5 w-5 text-primary" />
                Fee Payment Details
                {studentName && <span className="text-sm text-muted-foreground">for {studentName}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!preSelectedStudentId && (
                <FormField
                  control={form.control}
                  name="student_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium font-geist">Student *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 font-geist">
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px]">
                          <SelectGroup>
                            <SelectLabel className="font-geist">Students</SelectLabel>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.id} className="font-geist">
                                {student.full_name} - Class {student.class}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage className="font-geist" />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium font-geist">Amount (₹) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter payment amount" 
                          className="h-11 font-geist" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="font-geist" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium font-geist">Payment Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onSelect={field.onChange}
                          placeholder="Select payment date"
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          className="h-11 font-geist"
                          fromYear={2020}
                          toYear={new Date().getFullYear()}
                        />
                      </FormControl>
                      <FormMessage className="font-geist" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="months"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium font-geist">Payment for Months *</FormLabel>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 p-3 border rounded-md bg-background">
                      {months.map((month) => (
                        <FormField
                          key={month}
                          control={form.control}
                          name="months"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(month)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, month]);
                                    } else {
                                      field.onChange(current.filter((m) => m !== month));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-xs font-geist font-normal cursor-pointer">
                                {month.slice(0, 3)}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage className="font-geist" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium font-geist">Payment Purpose *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 font-geist">
                            <SelectValue placeholder="Select payment purpose" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="font-geist">Fee Types</SelectLabel>
                            <SelectItem value="Tuition Fee" className="font-geist">Tuition Fee</SelectItem>
                            <SelectItem value="Admission Fee" className="font-geist">Admission Fee</SelectItem>
                            <SelectItem value="Test Series Fee" className="font-geist">Test Series Fee</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage className="font-geist" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium font-geist">Payment Mode *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 font-geist">
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="font-geist">Payment Methods</SelectLabel>
                            <SelectItem value="Cash" className="font-geist">Cash</SelectItem>
                            <SelectItem value="Online" className="font-geist">Online</SelectItem>
                            <SelectItem value="UPI" className="font-geist">UPI</SelectItem>
                            <SelectItem value="Cheque" className="font-geist">Cheque</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage className="font-geist" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="receiptNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium font-geist">Receipt Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter receipt number (optional)" 
                        className="h-11 font-geist" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="font-geist" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium font-geist">Notes</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Additional notes (optional)" 
                        className="h-11 font-geist" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="font-geist" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            {transaction && onDelete && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-11 px-6 font-geist font-medium"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            )}
            <div className="flex-1 flex justify-end">
              <Button 
                type="submit" 
                className="h-11 px-8 font-geist font-medium" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  transaction ? "Update Payment" : submitLabel
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

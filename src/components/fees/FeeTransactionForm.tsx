import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CreditCard, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Fee transaction form schema
const feeTransactionSchema = z.object({
  studentId: z.string().min(1, "Please select a student"),
  amount: z.coerce.number().positive("Amount must be positive"),
  paymentDate: z.date({ required_error: "Payment date is required" }),
  paymentMode: z.enum(["Cash", "Online", "Cheque", "UPI"]),
  purpose: z.enum(["Tuition Fee", "Admission Fee", "Test Series Fee"]),
  receiptNumber: z.string().min(1, "Receipt number is required"),
  notes: z.string().optional(),
  months: z.array(z.string()).min(1, "Please select at least one month"),
});

type FeeTransactionFormValues = z.infer<typeof feeTransactionSchema>;

interface FeeTransactionFormProps {
  onSubmit: (data: any) => void;
  submitLabel?: string;
  studentName?: string;
  transaction?: any;
  onDelete?: () => void;
  preSelectedStudentId?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Generate unique receipt number
const generateReceiptNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RCP${timestamp.slice(-6)}${random}`;
};

export function FeeTransactionForm({ 
  onSubmit, 
  submitLabel = "Add Payment", 
  studentName,
  transaction,
  onDelete,
  preSelectedStudentId
}: FeeTransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch students for the dropdown
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, full_name, class')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  const defaultValues = transaction ? {
    studentId: transaction.student_id || preSelectedStudentId || "",
    amount: transaction.amount || 0,
    paymentDate: transaction.paymentDate ? new Date(transaction.paymentDate) : transaction.date ? new Date(transaction.date) : new Date(),
    paymentMode: transaction.paymentMode || "Cash" as const,
    purpose: transaction.purpose || "Tuition Fee" as const,
    receiptNumber: transaction.receiptNumber || generateReceiptNumber(),
    notes: transaction.notes || "",
    months: transaction.months || [],
  } : {
    studentId: preSelectedStudentId || "",
    amount: 0,
    paymentDate: new Date(),
    paymentMode: "Cash" as const,
    purpose: "Tuition Fee" as const,
    receiptNumber: generateReceiptNumber(),
    notes: "",
    months: [],
  };

  const form = useForm<FeeTransactionFormValues>({
    resolver: zodResolver(feeTransactionSchema),
    defaultValues,
  });

  // Auto-generate receipt number when form loads if not editing
  useEffect(() => {
    if (!transaction && !form.getValues('receiptNumber')) {
      form.setValue('receiptNumber', generateReceiptNumber());
    }
  }, [form, transaction]);

  const handleSubmit = async (data: FeeTransactionFormValues) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onSubmit(data); // Let parent handle error/success
      if (!transaction) {
        // Optionally reset form after add
        form.reset({
          ...defaultValues,
          receiptNumber: generateReceiptNumber(),
          months: [],
        });
      }
    } catch (error) {
      // Let parent handle the toast, but can fallback:
      // toast.error('Submission failed');
      // (If parent handles errors fully, you don't need this.)
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStudent = students.find(s => s.id === form.watch('studentId'));

  return (
    <div className="w-full h-full flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-sf-pro">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Fee Payment Details
                    {studentName && <span className="text-sm sm:text-base text-muted-foreground">for {studentName}</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Student Selection */}
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-medium font-sf-pro flex items-center gap-2">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                          Select Student *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!!preSelectedStudentId}>
                          <FormControl>
                            <SelectTrigger className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base">
                              <SelectValue placeholder="Choose a student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel className="font-sf-pro">Students</SelectLabel>
                              {students.map((student) => (
                                <SelectItem key={student.id} value={student.id} className="font-sf-pro text-sm sm:text-base">
                                  {student.full_name} - Class {student.class}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-sf-pro text-sm" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium font-sf-pro">Amount (₹) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter payment amount" 
                              className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="font-sf-pro text-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium font-sf-pro flex items-center gap-2">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                            Payment Date *
                          </FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              onSelect={field.onChange}
                              placeholder="Select payment date"
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base"
                              fromYear={2020}
                              toYear={new Date().getFullYear()}
                            />
                          </FormControl>
                          <FormMessage className="font-sf-pro text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Month Selection */}
                  <FormField
                    control={form.control}
                    name="months"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-medium font-sf-pro">Payment Months *</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg bg-muted/20">
                          {MONTHS.map((month) => (
                            <div key={month} className="flex items-center space-x-1 sm:space-x-2">
                              <Checkbox
                                id={month}
                                checked={field.value?.includes(month)}
                                onCheckedChange={(checked) => {
                                  const updatedMonths = checked
                                    ? [...(field.value || []), month]
                                    : (field.value || []).filter((m) => m !== month);
                                  field.onChange(updatedMonths);
                                }}
                                className="data-[state=checked]:bg-primary h-4 w-4 sm:h-5 sm:w-5"
                              />
                              <label
                                htmlFor={month}
                                className="text-sm sm:text-base font-sf-pro leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {month.slice(0, 3)}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage className="font-sf-pro text-sm" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium font-sf-pro">Payment Purpose *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base">
                                <SelectValue placeholder="Select payment purpose" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel className="font-sf-pro">Fee Types</SelectLabel>
                                <SelectItem value="Tuition Fee" className="font-sf-pro text-sm sm:text-base">Tuition Fee</SelectItem>
                                <SelectItem value="Admission Fee" className="font-sf-pro text-sm sm:text-base">Admission Fee</SelectItem>
                                <SelectItem value="Test Series Fee" className="font-sf-pro text-sm sm:text-base">Test Series Fee</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage className="font-sf-pro text-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium font-sf-pro">Payment Mode *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base">
                                <SelectValue placeholder="Select payment mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel className="font-sf-pro">Payment Methods</SelectLabel>
                                <SelectItem value="Cash" className="font-sf-pro text-sm sm:text-base">Cash</SelectItem>
                                <SelectItem value="Online" className="font-sf-pro text-sm sm:text-base">Online</SelectItem>
                                <SelectItem value="UPI" className="font-sf-pro text-sm sm:text-base">UPI</SelectItem>
                                <SelectItem value="Cheque" className="font-sf-pro text-sm sm:text-base">Cheque</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage className="font-sf-pro text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="receiptNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-medium font-sf-pro">Receipt Number *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Auto-generated receipt number" 
                            className="h-11 sm:h-12 font-sf-pro bg-muted/50 text-sm sm:text-base" 
                            disabled
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="font-sf-pro text-sm" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-medium font-sf-pro">Notes</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Additional notes (optional)" 
                            className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="font-sf-pro text-sm" />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </ScrollArea>

      <div className="flex-shrink-0 border-t bg-white p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          {transaction && onDelete && (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={onDelete}
              className="h-11 sm:h-12 px-4 sm:px-6 font-sf-pro font-medium text-sm sm:text-base order-2 sm:order-1"
            >
              Delete
            </Button>
          )}
          <div className="flex-1 flex justify-end order-1 sm:order-2">
            <Button 
              type="submit" 
              className="h-11 sm:h-12 px-6 sm:px-8 font-sf-pro font-medium text-sm sm:text-base w-full sm:w-auto" 
              disabled={isSubmitting}
              size="lg"
              onClick={form.handleSubmit(handleSubmit)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  {transaction ? "Updating..." : submitLabel}
                </>
              ) : (
                transaction ? "Update Payment" : submitLabel
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

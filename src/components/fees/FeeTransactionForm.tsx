
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, CalendarIcon, CreditCard, FileText, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

// Fee transaction form schema
const feeTransactionFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["Cash", "Online", "Cheque", "UPI"]),
  paymentDate: z.string().min(1, "Payment date is required"),
  description: z.string().optional(),
  receiptNumber: z.string().optional(),
});

type FeeTransactionFormValues = z.infer<typeof feeTransactionFormSchema>;

interface FeeTransactionFormProps {
  studentName?: string;
  onSubmit: (data: FeeTransactionFormValues) => void;
  submitLabel?: string;
  initialData?: Partial<FeeTransactionFormValues>;
  transaction?: any; // For editing existing transactions
  onDelete?: () => void;
  preSelectedStudentId?: string;
}

// Function to generate receipt number
const generateReceiptNumber = () => {
  const prefix = "RCP";
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}${timestamp}${random}`;
};

export function FeeTransactionForm({ 
  studentName, 
  onSubmit, 
  submitLabel = "Add Payment", 
  initialData,
  transaction,
  onDelete,
  preSelectedStudentId
}: FeeTransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use transaction data if available, otherwise use initialData
  const transactionData = transaction ? {
    amount: transaction.amount || 0,
    paymentMethod: transaction.payment_mode || transaction.paymentMethod || "Cash" as const,
    paymentDate: transaction.date || format(new Date(), "yyyy-MM-dd"),
    description: transaction.purpose || transaction.description || "",
    receiptNumber: transaction.receipt_number || transaction.receiptNumber || "",
  } : initialData;

  const defaultValues = {
    amount: transactionData?.amount || 0,
    paymentMethod: transactionData?.paymentMethod || "Cash" as const,
    paymentDate: transactionData?.paymentDate || format(new Date(), "yyyy-MM-dd"),
    description: transactionData?.description || "",
    receiptNumber: transactionData?.receiptNumber || "",
  };

  const form = useForm<FeeTransactionFormValues>({
    resolver: zodResolver(feeTransactionFormSchema),
    defaultValues,
  });

  // Auto-generate receipt number for new transactions
  useEffect(() => {
    if (!transaction && !initialData?.receiptNumber) {
      const autoReceiptNumber = generateReceiptNumber();
      form.setValue("receiptNumber", autoReceiptNumber);
    }
  }, [form, transaction, initialData]);

  const handleSubmit = async (data: FeeTransactionFormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(data);
      if (!transaction && !initialData) {
        form.reset(defaultValues);
        // Generate new receipt number for next transaction
        const newReceiptNumber = generateReceiptNumber();
        form.setValue("receiptNumber", newReceiptNumber);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDate = form.watch("paymentDate") ? new Date(form.watch("paymentDate")) : undefined;

  return (
    <div className="w-full h-full flex flex-col font-geist">
      <div className="flex-1 form-scroll-container px-2 sm:px-4 py-2 sm:py-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
            {/* Student Information */}
            {studentName && (
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-geist">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Payment for {studentName}
                  </CardTitle>
                </CardHeader>
              </Card>
            )}

            {/* Payment Details */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-geist">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                          className="h-10 sm:h-11 font-geist" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="font-geist" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Payment Method *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 sm:h-11 font-geist">
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel className="font-geist">Payment Methods</SelectLabel>
                              <SelectItem value="Cash" className="font-geist">Cash</SelectItem>
                              <SelectItem value="Online" className="font-geist">Online Transfer</SelectItem>
                              <SelectItem value="Cheque" className="font-geist">Cheque</SelectItem>
                              <SelectItem value="UPI" className="font-geist">UPI</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-10 sm:h-11 w-full justify-start text-left font-normal font-geist",
                                  !selectedDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              disabled={(date) => date > new Date()}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
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
                          placeholder="Auto-generated receipt number" 
                          className="h-10 sm:h-11 font-geist bg-gray-50" 
                          readOnly
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="font-geist" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-geist">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium font-geist">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter any additional notes (optional)" 
                          className="min-h-[80px] font-geist" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="font-geist" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>

      {/* Submit and Delete Buttons - Fixed at bottom */}
      <div className="flex-shrink-0 border-t bg-background px-2 sm:px-4 py-3 sm:py-4">
        <div className="max-w-2xl mx-auto flex justify-between gap-3">
          {onDelete && (
            <Button 
              type="button" 
              variant="destructive"
              onClick={onDelete}
              className="h-10 sm:h-11 px-6 sm:px-8 font-geist font-medium" 
              disabled={isSubmitting}
            >
              Delete
            </Button>
          )}
          <Button 
            type="submit" 
            onClick={form.handleSubmit(handleSubmit)}
            className="h-10 sm:h-11 px-6 sm:px-8 font-geist font-medium flex-1 sm:flex-none sm:ml-auto" 
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

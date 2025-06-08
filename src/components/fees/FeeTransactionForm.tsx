
import React, { useState } from "react";
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
import { Loader2, CalendarIcon, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Fee transaction form schema
const feeTransactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMode: z.enum(["Cash", "Online", "Cheque", "UPI"]),
  purpose: z.enum(["Tuition Fee", "Admission Fee", "Test Series Fee"]),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
});

type FeeTransactionFormValues = z.infer<typeof feeTransactionSchema>;

interface FeeTransactionFormProps {
  onSubmit: (data: FeeTransactionFormValues) => void;
  submitLabel?: string;
  studentName?: string;
  transaction?: any; // For editing existing transactions
  onDelete?: () => void; // For deleting transactions
  preSelectedStudentId?: string; // For pre-selecting a student
}

export function FeeTransactionForm({ 
  onSubmit, 
  submitLabel = "Add Payment", 
  studentName,
  transaction,
  onDelete,
  preSelectedStudentId
}: FeeTransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = transaction ? {
    amount: transaction.amount || 0,
    paymentDate: transaction.paymentDate || transaction.date || format(new Date(), "yyyy-MM-dd"),
    paymentMode: transaction.paymentMode || "Cash" as const,
    purpose: transaction.purpose || "Tuition Fee" as const,
    receiptNumber: transaction.receiptNumber || "",
    notes: transaction.notes || "",
  } : {
    amount: 0,
    paymentDate: format(new Date(), "yyyy-MM-dd"),
    paymentMode: "Cash" as const,
    purpose: "Tuition Fee" as const,
    receiptNumber: "",
    notes: "",
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
      if (!transaction) {
        form.reset(defaultValues);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDate = form.watch("paymentDate") ? new Date(form.watch("paymentDate")) : undefined;

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
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-11 w-full justify-start text-left font-normal font-geist",
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
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={2020}
                            toYear={new Date().getFullYear()}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="font-geist" />
                    </FormItem>
                  )}
                />
              </div>

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
                onClick={onDelete}
                className="h-11 px-6 font-geist font-medium"
              >
                Delete
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

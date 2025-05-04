
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";

// Generate receipt number (current date + random 4 digits)
const generateReceiptNumber = () => {
  const date = new Date();
  const dateStr = format(date, "yyyyMMdd");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `REC${dateStr}${randomNum}`;
};

// Form schema
const feeTransactionSchema = z.object({
  amount: z.coerce
    .number()
    .min(1, "Amount must be greater than 0"),
  date: z.string().refine((val) => new Date(val) <= new Date(), {
    message: "Date cannot be in the future",
  }),
  paymentMode: z.string({
    required_error: "Please select a payment mode",
  }),
  receiptNumber: z.string().min(3, "Receipt number is required"),
  purpose: z.string().min(1, "Purpose is required"),
});

type FeeTransactionFormValues = z.infer<typeof feeTransactionSchema>;

interface FeeTransactionFormProps {
  transaction?: any;
  onSubmit: (data: FeeTransactionFormValues) => void;
  onDelete?: () => void;
}

export function FeeTransactionForm({
  transaction,
  onSubmit,
  onDelete,
}: FeeTransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Set default values
  const defaultValues = {
    amount: transaction ? transaction.amount : 0,
    date: transaction ? format(new Date(transaction.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    paymentMode: transaction ? transaction.paymentMode : "Cash",
    receiptNumber: transaction ? transaction.receiptNumber : generateReceiptNumber(),
    purpose: transaction ? transaction.purpose : "Fee Payment",
  };

  const form = useForm<FeeTransactionFormValues>({
    resolver: zodResolver(feeTransactionSchema),
    defaultValues,
  });

  const handleSubmit = async (data: FeeTransactionFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    max={format(new Date(), "yyyy-MM-dd")}
                  />
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
          name="receiptNumber"
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
              <FormLabel>Purpose</FormLabel>
              <FormControl>
                <Input placeholder="Fee payment purpose" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="mt-6">
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting || isDeleting}
              className="mr-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || isDeleting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {transaction ? "Updating..." : "Adding..."}
              </>
            ) : (
              transaction ? "Update" : "Add"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

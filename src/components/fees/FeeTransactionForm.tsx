
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Trash2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FeeTransaction } from "@/types";

interface FeeTransactionFormProps {
  transaction?: FeeTransaction;
  onSubmit: (data: any) => void;
  onDelete?: () => void;
}

const feeTransactionSchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  amount: z.number().min(1, "Amount must be at least 1"),
  paymentMode: z.enum(["Cash", "Online", "Cheque"]),
  date: z.string().min(1, "Date is required"),
  receiptNumber: z.string().min(1, "Receipt number is required"),
});

export function FeeTransactionForm({
  transaction,
  onSubmit,
  onDelete,
}: FeeTransactionFormProps) {
  const [transactionDate, setTransactionDate] = useState<Date | undefined>(
    transaction?.date ? new Date(transaction.date) : new Date()
  );

  const form = useForm({
    resolver: zodResolver(feeTransactionSchema),
    defaultValues: {
      purpose: transaction?.purpose || '',
      amount: transaction?.amount || 0,
      paymentMode: transaction?.paymentMode || "Cash",
      date: transaction?.date || new Date().toISOString().split('T')[0],
      receiptNumber: transaction?.receiptNumber || `REC-${Date.now().toString().substr(-6)}`,
    },
  });

  const handleSubmit = (values: any) => {
    onSubmit({
      ...values,
      amount: Number(values.amount),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose *</FormLabel>
              <FormControl>
                <Input placeholder="Fee purpose" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (₹) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Amount"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
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
                <FormLabel>Payment Mode *</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={transactionDate}
                      onSelect={(date) => {
                        setTransactionDate(date);
                        field.onChange(date ? date.toISOString().split('T')[0] : '');
                      }}
                      disabled={(date) =>
                        date > new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receiptNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receipt Number *</FormLabel>
                <FormControl>
                  <Input placeholder="Receipt number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-4 flex justify-between">
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
          <Button type="submit" className={onDelete ? "" : "w-full"}>
            {transaction ? 'Update' : 'Add'} Transaction
          </Button>
        </div>
      </form>
    </Form>
  );
}

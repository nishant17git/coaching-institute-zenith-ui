
import React from "react";
import { format, isValid, parseISO } from "date-fns";
import { Edit, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { exportFeeInvoicePDF } from "@/services/pdfService";
import { FeeTransaction } from "@/types";

interface FeeTransactionCardProps {
  transaction: any;
  student?: any;
  onEdit: (transaction: any) => void;
  className?: string;
}

// Helper function to safely format dates
const safeFormatDate = (dateValue: string | null | undefined, formatString: string = 'dd MMM yyyy'): string => {
  if (!dateValue) return 'Invalid Date';
  
  try {
    const date = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
    if (!isValid(date)) return 'Invalid Date';
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export function FeeTransactionCard({ transaction, student, onEdit, className }: FeeTransactionCardProps) {
  // Determine the gradient and icon color based on payment mode
  const gradientClass = 
    transaction.payment_mode === "Cash" ? "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b-4 border-amber-500" : 
    transaction.payment_mode === "Online" ? "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-4 border-blue-500" : 
    "from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-green-500";

  const iconColorClass = 
    transaction.payment_mode === "Cash" ? "text-amber-600 dark:text-amber-400" : 
    transaction.payment_mode === "Online" ? "text-blue-600 dark:text-blue-400" : 
    "text-green-600 dark:text-green-400";

  const handleShareInvoice = () => {
    try {
      if (!student) {
        toast.error("Student information not available");
        return;
      }

      // Format transaction data for PDF generation
      // Ensure the paymentMode is cast to the correct type
      const paymentMode = transaction.payment_mode as "Cash" | "Online" | "Cheque";
      
      const formattedTransaction: FeeTransaction = {
        id: transaction.id,
        studentId: transaction.student_id,
        amount: transaction.amount,
        date: transaction.payment_date,
        paymentMode: paymentMode,
        receiptNumber: transaction.receipt_number || 'N/A',
        purpose: transaction.purpose || 'School Fees'
      };

      // Format student data for PDF generation
      const formattedStudent = {
        id: student.id,
        name: student.full_name,
        class: student.class,
        totalFees: student.total_fees,
        paidFees: student.paid_fees,
        feeStatus: student.fee_status,
        attendancePercentage: 0, // Not available in this context
        joinDate: new Date().toISOString(), // Not available in this context
        father: '', // Added father field
        mother: '', // Added mother field
        fatherName: '', // Not available in this context
        motherName: '', // Not available in this context
        phoneNumber: '', // Not available in this context
        whatsappNumber: '', // Not available in this context
        address: '', // Not available in this context
      };

      // Export the invoice as PDF
      exportFeeInvoicePDF({
        transaction: formattedTransaction,
        student: formattedStudent,
        instituteName: "Infinity Classes",
        instituteAddress: "123 Education Street, Knowledge City",
        institutePhone: "+1 234 567 8900",
      });
      
      toast.success("Invoice generated successfully", {
        description: "The fee invoice has been downloaded"
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("overflow-hidden shadow-sm hover:shadow-md transition-all bg-gradient-to-br", gradientClass, className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-secondary/80 flex items-center justify-center text-sm font-medium">
                {student?.full_name?.charAt(0) || '?'}
              </div>
              <span className="text-base">{student?.full_name || 'Unknown Student'}</span>
            </div>
            <Badge variant={
              transaction.payment_mode === "Cash" ? "warning" : 
              transaction.payment_mode === "Online" ? "info" : 
              "success"
            }>
              {transaction.payment_mode}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Receipt #{transaction.receipt_number || 'N/A'}
            </div>
            <div className="text-lg font-bold text-green-600">
              ₹{transaction.amount.toLocaleString()}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 rounded-lg p-2.5 bg-secondary/20">
              <p className="text-xs text-muted-foreground font-medium">Date</p>
              <p className="font-medium">{safeFormatDate(transaction.payment_date)}</p>
            </div>
            
            <div className="space-y-1 rounded-lg p-2.5 bg-secondary/20">
              <p className="text-xs text-muted-foreground font-medium">Class</p>
              <p className="font-medium">{student?.class || 'N/A'}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-border/40">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground font-medium">Purpose</p>
                <p className="text-sm font-medium line-clamp-1">{transaction.purpose || '—'}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-secondary transition-colors" 
                  onClick={() => onEdit(transaction)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-secondary transition-colors" 
                  onClick={handleShareInvoice}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Share Invoice</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

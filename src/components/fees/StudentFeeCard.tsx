
import React from "react";
import { Plus, User, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { exportFeeInvoicePDF } from "@/services/pdfService";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FeeTransaction } from "@/types";

interface StudentFeeCardProps {
  student: any;
  onAddPayment: (studentId: string) => void;
  className?: string;
}

export function StudentFeeCard({ student, onAddPayment, className }: StudentFeeCardProps) {
  const balance = student.total_fees - student.paid_fees;
  const percentage = student.total_fees > 0 ? Math.round(student.paid_fees / student.total_fees * 100) : 0;
  
  // Determine status and gradient for the card
  let gradientClass = "";
  let iconColorClass = "";
  
  if (student.fee_status === "Paid") {
    gradientClass = "from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-green-500";
    iconColorClass = "text-green-600 dark:text-green-400";
  } else if (student.fee_status === "Partial") {
    gradientClass = "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b-4 border-amber-500";
    iconColorClass = "text-amber-600 dark:text-amber-400";
  } else {
    gradientClass = "from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-b-4 border-red-500";
    iconColorClass = "text-red-600 dark:text-red-400";
  }
    
  // Progress bar width calculation
  const progressWidth = `${percentage}%`;
  
  // Get the latest transaction for this student
  const { data: latestTransaction } = useQuery({
    queryKey: ['latestStudentTransaction', student.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_transactions')
        .select('*')
        .eq('student_id', student.id)
        .order('payment_date', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    }
  });

  const handleShareInvoice = () => {
    try {
      if (!latestTransaction) {
        toast.error("No transaction found for this student");
        return;
      }

      // Format transaction data for PDF generation
      // Ensure the paymentMode is cast to the correct type
      const paymentMode = latestTransaction.payment_mode as "Cash" | "Online" | "Cheque";
      
      const formattedTransaction: FeeTransaction = {
        id: latestTransaction.id,
        studentId: latestTransaction.student_id,
        amount: latestTransaction.amount,
        date: latestTransaction.payment_date,
        paymentMode: paymentMode,
        receiptNumber: latestTransaction.receipt_number || 'N/A',
        purpose: latestTransaction.purpose || 'School Fees'
      };

      // Format student data for PDF generation
      const formattedStudent = {
        id: student.id,
        name: student.full_name,
        class: student.class,
        totalFees: student.total_fees,
        paidFees: student.paid_fees,
        feeStatus: student.fee_status,
        father: '', // Added father field
        mother: '', // Added mother field
        attendancePercentage: 0, // Not available in this context
        joinDate: new Date().toISOString(), // Not available in this context
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
        instituteName: "School Management System",
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
              <div className="h-9 w-9 rounded-full bg-secondary/80 flex items-center justify-center text-sm font-medium">
                {student.full_name?.charAt(0) || '?'}
              </div>
              <div>
                <span className="text-base block">{student.full_name}</span>
                <span className="text-xs text-muted-foreground">Class {student.class}</span>
              </div>
            </div>
            <Badge variant={
              student.fee_status === "Paid" ? "success" : 
              student.fee_status === "Partial" ? "warning" : 
              "danger"
            } className="capitalize px-2.5 py-1">
              {student.fee_status} {student.fee_status === "Partial" && `(${percentage}%)`}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-secondary/30 rounded-full mb-4 overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-700", 
                student.fee_status === "Paid" ? "bg-green-500" : 
                student.fee_status === "Partial" ? "bg-amber-500" : 
                "bg-red-500"
              )}
              style={{ width: progressWidth }}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1 bg-secondary/20 rounded-lg p-2.5 text-center">
              <p className="text-xs text-muted-foreground font-medium">Total</p>
              <p className="font-semibold">₹{student.total_fees?.toLocaleString()}</p>
            </div>
            <div className="space-y-1 bg-green-500/10 rounded-lg p-2.5 text-center">
              <p className="text-xs text-muted-foreground font-medium">Paid</p>
              <p className="font-semibold text-green-600">₹{student.paid_fees?.toLocaleString()}</p>
            </div>
            <div className="space-y-1 bg-red-500/10 rounded-lg p-2.5 text-center">
              <p className="text-xs text-muted-foreground font-medium">Balance</p>
              <p className="font-semibold text-red-600">₹{balance.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-border/40 flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onAddPayment(student.id)}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100 hover:border-blue-200 font-medium transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Payment
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleShareInvoice}
              className="h-9 px-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-100 hover:border-purple-200 transition-all"
              disabled={!latestTransaction}
            >
              <Share2 className="h-3.5 w-3.5 mr-1" />
              Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


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
import { newStudentService } from "@/services/newStudentService";
import { FeeTransaction } from "@/types";

interface StudentFeeCardProps {
  student: any;
  onAddPayment: (studentId: string) => void;
  className?: string;
}

export function StudentFeeCard({ student, onAddPayment, className }: StudentFeeCardProps) {
  // Get student fee transactions to calculate totals
  const { data: feeTransactions = [] } = useQuery({
    queryKey: ['studentFees', student.id],
    queryFn: () => newStudentService.getStudentFees(student.id)
  });

  // Calculate fee totals from transactions
  const totalPaid = feeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalFees = 50000; // This should come from fee structure - using default for now
  const balance = totalFees - totalPaid;
  const percentage = totalFees > 0 ? Math.round(totalPaid / totalFees * 100) : 0;
  
  // Determine fee status
  let feeStatus: "Paid" | "Partial" | "Pending" = "Pending";
  if (totalPaid >= totalFees) {
    feeStatus = "Paid";
  } else if (totalPaid > 0) {
    feeStatus = "Partial";
  }
  
  // Determine status and gradient for the card
  let gradientClass = "";
  let iconColorClass = "";
  
  if (feeStatus === "Paid") {
    gradientClass = "from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-green-500";
    iconColorClass = "text-green-600 dark:text-green-400";
  } else if (feeStatus === "Partial") {
    gradientClass = "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b-4 border-amber-500";
    iconColorClass = "text-amber-600 dark:text-amber-400";
  } else {
    gradientClass = "from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-b-4 border-red-500";
    iconColorClass = "text-red-600 dark:text-red-400";
  }
    
  // Progress bar width calculation
  const progressWidth = `${percentage}%`;
  
  // Get the latest transaction for this student
  const latestTransaction = feeTransactions[0]; // Already sorted by date desc

  const handleShareInvoice = () => {
    try {
      if (!latestTransaction) {
        toast.error("No transaction found for this student");
        return;
      }

      // Format transaction data for PDF generation
      const formattedTransaction: FeeTransaction = {
        id: latestTransaction.id,
        studentId: latestTransaction.student_id,
        amount: latestTransaction.amount,
        date: latestTransaction.payment_date,
        paymentMode: latestTransaction.payment_mode as "Cash" | "Online" | "Cheque",
        receiptNumber: latestTransaction.receipt_number || 'N/A',
        purpose: latestTransaction.purpose || 'School Fees'
      };

      // Format student data for PDF generation
      const formattedStudent = {
        id: student.id,
        name: student.full_name,
        class: student.class,
        totalFees: totalFees,
        paidFees: totalPaid,
        feeStatus: feeStatus,
        father: student.father_name,
        mother: student.mother_name || '',
        attendancePercentage: 0,
        joinDate: student.admission_date || new Date().toISOString(),
        fatherName: student.father_name,
        motherName: student.mother_name || '',
        phoneNumber: student.contact_number,
        whatsappNumber: student.whatsapp_number || '',
        address: student.address || '',
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
              feeStatus === "Paid" ? "success" : 
              feeStatus === "Partial" ? "warning" : 
              "danger"
            } className="capitalize px-2.5 py-1">
              {feeStatus} {feeStatus === "Partial" && `(${percentage}%)`}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-secondary/30 rounded-full mb-4 overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-700", 
                feeStatus === "Paid" ? "bg-green-500" : 
                feeStatus === "Partial" ? "bg-amber-500" : 
                "bg-red-500"
              )}
              style={{ width: progressWidth }}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1 bg-secondary/20 rounded-lg p-2.5 text-center">
              <p className="text-xs text-muted-foreground font-medium">Total</p>
              <p className="font-semibold">₹{totalFees?.toLocaleString()}</p>
            </div>
            <div className="space-y-1 bg-green-500/10 rounded-lg p-2.5 text-center">
              <p className="text-xs text-muted-foreground font-medium">Paid</p>
              <p className="font-semibold text-green-600">₹{totalPaid?.toLocaleString()}</p>
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

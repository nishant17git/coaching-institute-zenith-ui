
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Receipt, Calendar, CreditCard } from "lucide-react";

interface FeeTransactionCardProps {
  transaction: any;
  student: any;
  onEdit: (transaction: any) => void;
}

export const FeeTransactionCard: React.FC<FeeTransactionCardProps> = ({
  transaction,
  student,
  onEdit
}) => {
  const getPaymentModeColor = (mode: string) => {
    switch (mode) {
      case "Cash": return "bg-green-100 text-green-800";
      case "Online": return "bg-blue-100 text-blue-800";
      case "Cheque": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <div>
            <span className="text-base block">{student?.full_name || "Unknown Student"}</span>
            <span className="text-xs text-muted-foreground">Class {student?.class || "N/A"} • Receipt #{transaction.receipt_number}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(transaction)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-green-600">₹{transaction.amount.toLocaleString()}</span>
            <Badge className={getPaymentModeColor(transaction.payment_mode)}>
              {transaction.payment_mode}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(transaction.payment_date), 'MMM dd, yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Receipt className="h-4 w-4" />
            <span className="truncate">{transaction.purpose}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

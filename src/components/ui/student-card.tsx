
import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Phone, MessageCircle } from "lucide-react";
import { Student } from "@/types";

interface StudentCardProps {
  student: Student;
  onViewDetails: (studentId: string) => void;
}

export function StudentCard({ student, onViewDetails }: StudentCardProps) {
  // Phone call handler
  const handlePhoneCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`tel:${student.phoneNumber}`, "_blank");
  };

  // WhatsApp handler
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://wa.me/${student.phoneNumber.replace(/\D/g, '')}`, "_blank");
  };

  return (
    <Card className="glass-card overflow-hidden hover-lift transition-all animate-fade-in shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-0 space-y-0">
        <div className="flex space-x-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-apple-blue to-apple-indigo flex items-center justify-center text-white font-medium text-lg shadow-sm">
            {student.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h3 className="font-medium leading-none">{student.name}</h3>
            <p className="text-sm text-muted-foreground">Class: {student.class}</p>
          </div>
        </div>
        <Badge 
          variant={student.feeStatus === "Paid" ? "outline" : "destructive"} 
          className={
            student.feeStatus === "Paid" 
              ? "border-apple-green text-apple-green animate-fade-in rounded-full" 
              : "animate-pulse rounded-full"
          }
        >
          {student.feeStatus}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Father's Name:</span>
            <span className="font-medium">{student.fatherName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mother's Name:</span>
            <span className="font-medium">{student.motherName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Contact:</span>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-apple-blue/10 hover:text-apple-blue transition-colors"
                onClick={handlePhoneCall}
              >
                <Phone className="h-4 w-4 text-apple-blue" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-apple-green/10 hover:text-apple-green transition-colors"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="h-4 w-4 text-apple-green" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Attendance:</span>
            <span className={
              student.attendancePercentage >= 80 ? "text-apple-green font-medium" : 
              student.attendancePercentage >= 60 ? "text-apple-orange font-medium" : 
              "text-apple-red font-medium"
            }>
              {student.attendancePercentage}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fees:</span>
            <span className="font-medium">₹{student.paidFees.toLocaleString()} / ₹{student.totalFees.toLocaleString()}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full mt-3 justify-between hover:bg-primary/5 group transition-all"
          onClick={() => onViewDetails(student.id)}
        >
          View Details 
          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}

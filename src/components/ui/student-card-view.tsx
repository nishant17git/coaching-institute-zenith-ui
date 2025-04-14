
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StudentRecord } from "@/types";
import { ChevronDown, ChevronUp, Phone, MessageCircle } from "lucide-react";

interface StudentCardViewProps {
  student: StudentRecord;
  onViewDetails: (studentId: string) => void;
}

export function StudentCardView({ student, onViewDetails }: StudentCardViewProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  // Calculate outstanding amount
  const outstandingAmount = student.total_fees - student.paid_fees;
  
  return (
    <Card className="glass-card overflow-hidden hover:shadow-md transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2 space-y-0">
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10 bg-gradient-to-br from-apple-blue to-apple-indigo text-white shadow-sm">
            <AvatarFallback>{student.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-medium leading-none">{student.full_name}</h3>
            <p className="text-sm text-muted-foreground">Class {student.class}</p>
          </div>
        </div>
        <Badge 
          variant={
            student.fee_status === "Paid" ? "outline" : 
            student.fee_status === "Partial" ? "secondary" : "destructive"
          } 
          className={
            student.fee_status === "Paid" 
              ? "border-apple-green text-apple-green" 
              : student.fee_status === "Partial"
                ? "animate-pulse"
                : "animate-pulse"
          }
        >
          {student.fee_status}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Roll Number:</span>
            <span className="text-right font-medium">{student.roll_number}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Guardian:</span>
            <span className="text-right font-medium">{student.guardian_name}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Contact:</span>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-apple-blue/10 hover:text-apple-blue"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`tel:${student.contact_number}`, "_blank");
                }}
              >
                <Phone className="h-4 w-4 text-apple-blue" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-apple-green/10 hover:text-apple-green"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://wa.me/${student.contact_number.replace(/\D/g, '')}`, "_blank");
                }}
              >
                <MessageCircle className="h-4 w-4 text-apple-green" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Attendance:</span>
            <span className={
              student.attendance_percentage >= 80 ? "text-apple-green font-medium text-right" : 
              student.attendance_percentage >= 60 ? "text-apple-orange font-medium text-right" : 
              "text-apple-red font-medium text-right"
            }>
              {student.attendance_percentage}%
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Fees Paid:</span>
            <span className="text-right font-medium">₹{student.paid_fees.toLocaleString()} / ₹{student.total_fees.toLocaleString()}</span>
          </div>
        </div>

        {/* Expandable section */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border animate-accordion-down">
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-1">
                <span className="text-muted-foreground">Date of Birth:</span>
                <span className="text-right">{new Date(student.date_of_birth).toLocaleDateString()}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <span className="text-muted-foreground">Join Date:</span>
                <span className="text-right">{new Date(student.join_date).toLocaleDateString()}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <span className="text-muted-foreground">Address:</span>
                <span className="text-right">{student.address || "Not available"}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <span className="text-muted-foreground">Outstanding:</span>
                <span className={`text-right font-medium ${outstandingAmount > 0 ? 'text-apple-red' : 'text-apple-green'}`}>
                  ₹{outstandingAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleExpand}
            className="text-muted-foreground"
          >
            {expanded ? (
              <><ChevronUp className="h-4 w-4 mr-1" /> Less Details</>
            ) : (
              <><ChevronDown className="h-4 w-4 mr-1" /> More Details</>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails(student.id)}
            className="text-apple-blue hover:bg-apple-blue/10"
          >
            View Full Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

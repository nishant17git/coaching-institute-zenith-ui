
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
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-0 space-y-0">
        <div className="flex space-x-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-lg">
            {student.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h3 className="font-medium leading-none">{student.name}</h3>
            <p className="text-sm text-muted-foreground">Class: {student.class}</p>
          </div>
        </div>
        <Badge variant={student.feeStatus === "Paid" ? "outline" : "destructive"} className={student.feeStatus === "Paid" ? "border-apple-green text-apple-green" : ""}>
          {student.feeStatus}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Father's Name:</span>
            <span>{student.fatherName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mother's Name:</span>
            <span>{student.motherName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Contact:</span>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Phone className="h-4 w-4 text-apple-blue" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MessageCircle className="h-4 w-4 text-apple-green" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Attendance:</span>
            <span>{student.attendancePercentage}%</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full mt-3 justify-between"
          onClick={() => onViewDetails(student.id)}
        >
          View Details <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}

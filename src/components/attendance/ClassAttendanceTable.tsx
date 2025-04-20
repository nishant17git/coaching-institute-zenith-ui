import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  status: "Present" | "Absent" | "Leave" | "Holiday";
}

interface ClassAttendanceTableProps {
  students: Student[];
  date: Date;
  onStatusChange: (studentId: string, status: "Present" | "Absent" | "Leave") => void;
  onSaveAttendance: () => void;
  isSaving: boolean;
}

export function ClassAttendanceTable({ 
  students, 
  date,
  onStatusChange,
  onSaveAttendance,
  isSaving
}: ClassAttendanceTableProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 px-2.5 py-1 text-xs">
            <Check className="h-3 w-3 mr-1" /> Present
          </Badge>
          <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 px-2.5 py-1 text-xs">
            <X className="h-3 w-3 mr-1" /> Absent
          </Badge>
          <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 px-2.5 py-1 text-xs">
            <Clock className="h-3 w-3 mr-1" /> Leave
          </Badge>
        </div>
        
        <Button 
          onClick={onSaveAttendance} 
          className="bg-apple-green hover:bg-green-600 text-white px-4 h-9"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Attendance"}
        </Button>
      </div>
      
      {students.length > 0 ? (
        <div className="relative rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="w-12 py-3 pl-4">#</TableHead>
                  <TableHead className="py-3">Student</TableHead>
                  <TableHead className="py-3 text-center">Status</TableHead>
                  <TableHead className="py-3 text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <motion.tbody
                variants={container}
                initial="hidden"
                animate="show"
                className="divide-y divide-gray-100"
              >
                {students.map((student, index) => (
                  <motion.tr key={student.id} variants={item} className="bg-white/40">
                    <TableCell className="py-2.5 pl-4 font-medium">{index + 1}</TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100/80 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="font-medium truncate">{student.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium",
                          student.status === "Present" ? "bg-green-50 text-green-700 border-green-200" :
                          student.status === "Absent" ? "bg-red-50 text-red-700 border-red-200" :
                          "bg-orange-50 text-orange-700 border-orange-200"
                        )}
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2.5 pr-4">
                      <div className="flex justify-end gap-1.5">
                        <Button 
                          variant={student.status === "Present" ? "default" : "outline"} 
                          size="sm"
                          className={cn(
                            "h-7 px-2.5 text-xs",
                            student.status === "Present" 
                              ? "bg-green-600 hover:bg-green-700" 
                              : "hover:bg-green-50 hover:text-green-700"
                          )}
                          onClick={() => onStatusChange(student.id, "Present")}
                        >
                          <Check className="h-3 w-3 mr-1" /> Present
                        </Button>
                        <Button 
                          variant={student.status === "Absent" ? "default" : "outline"} 
                          size="sm"
                          className={cn(
                            "h-7 px-2.5 text-xs",
                            student.status === "Absent" 
                              ? "bg-red-600 hover:bg-red-700" 
                              : "hover:bg-red-50 hover:text-red-700"
                          )}
                          onClick={() => onStatusChange(student.id, "Absent")}
                        >
                          <X className="h-3 w-3 mr-1" /> Absent
                        </Button>
                        <Button 
                          variant={student.status === "Leave" ? "default" : "outline"} 
                          size="sm"
                          className={cn(
                            "h-7 px-2.5 text-xs",
                            student.status === "Leave" 
                              ? "bg-orange-600 hover:bg-orange-700" 
                              : "hover:bg-orange-50 hover:text-orange-700"
                          )}
                          onClick={() => onStatusChange(student.id, "Leave")}
                        >
                          <Clock className="h-3 w-3 mr-1" /> Leave
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </motion.tbody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 border rounded-xl bg-white/50">
          <User className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No students found for this class</p>
        </div>
      )}
    </div>
  );
}

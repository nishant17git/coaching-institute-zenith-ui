import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700 px-3 py-1">
            <Check className="h-3.5 w-3.5 mr-1.5" /> Present
          </Badge>
          <Badge variant="outline" className="bg-red-50 border-red-300 text-red-700 px-3 py-1">
            <X className="h-3.5 w-3.5 mr-1.5" /> Absent
          </Badge>
          <Badge variant="outline" className="bg-orange-50 border-orange-300 text-orange-700 px-3 py-1">
            <Clock className="h-3.5 w-3.5 mr-1.5" /> Leave
          </Badge>
        </div>
        
        <Button 
          onClick={onSaveAttendance} 
          className="bg-apple-green hover:bg-green-600 text-white px-4"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Attendance"}
        </Button>
      </div>
      
      {students.length > 0 ? (
        <div className="border rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-12 py-3">#</TableHead>
                <TableHead className="py-3">Student</TableHead>
                <TableHead className="text-center py-3">Status</TableHead>
                <TableHead className="text-right py-3">Actions</TableHead>
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
                  <TableCell className="font-medium py-3">{index + 1}</TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-100/80 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="font-medium">{student.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <Badge
                      variant="outline"
                      className={
                        student.status === "Present" ? "bg-green-100 text-green-800 border-green-300" :
                        student.status === "Absent" ? "bg-red-100 text-red-800 border-red-300" :
                        student.status === "Leave" ? "bg-amber-100 text-amber-800 border-amber-300" :
                        "bg-gray-100 text-gray-800 border-gray-300"
                      }
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant={student.status === "Present" ? "default" : "outline"} 
                        size="sm"
                        className={`h-8 ${student.status === "Present" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-100 hover:text-green-700"}`}
                        onClick={() => onStatusChange(student.id, "Present")}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Present
                      </Button>
                      <Button 
                        variant={student.status === "Absent" ? "default" : "outline"} 
                        size="sm"
                        className={`h-8 ${student.status === "Absent" ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-100 hover:text-red-700"}`}
                        onClick={() => onStatusChange(student.id, "Absent")}
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Absent
                      </Button>
                      <Button 
                        variant={student.status === "Leave" ? "default" : "outline"} 
                        size="sm"
                        className={`h-8 ${student.status === "Leave" ? "bg-amber-600 hover:bg-amber-700" : "hover:bg-amber-100 hover:text-amber-700"}`}
                        onClick={() => onStatusChange(student.id, "Leave")}
                      >
                        <Clock className="h-3.5 w-3.5 mr-1" /> Leave
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </motion.tbody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border rounded-xl bg-white/50">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No students found for this class</p>
        </div>
      )}
    </div>
  );
}

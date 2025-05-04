
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, User, Save, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Student {
  id: string;
  name: string;
  status: "Present" | "Absent" | "Leave" | "Holiday";
}

interface ClassAttendanceTableProps {
  students: Student[];
  date: Date;
  onStatusChange: (studentId: string, status: "Present" | "Absent" | "Leave" | "Holiday") => void;
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
    <div className="space-y-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/80 p-4 rounded-xl border shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 px-2.5 py-0.5 text-xs whitespace-nowrap">
            <Check className="h-3 w-3 mr-1" /> Present
          </Badge>
          <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 px-2.5 py-0.5 text-xs whitespace-nowrap">
            <X className="h-3 w-3 mr-1" /> Absent
          </Badge>
          <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 px-2.5 py-0.5 text-xs whitespace-nowrap">
            <Clock className="h-3 w-3 mr-1" /> Leave
          </Badge>
          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 px-2.5 py-0.5 text-xs whitespace-nowrap">
            <Calendar className="h-3 w-3 mr-1" /> Holiday
          </Badge>
        </div>
        
        <Badge variant="outline" className="bg-white border-gray-200 text-gray-900 px-2.5 py-1">
          <time dateTime={format(date, 'yyyy-MM-dd')}>{format(date, 'MMM d, yyyy')}</time>
        </Badge>
      </motion.div>
      
      {students.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm border rounded-xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/70 hover:bg-gray-50/90">
                  <TableHead className="w-12 py-3 pl-4">#</TableHead>
                  <TableHead className="py-3">Student</TableHead>
                  <TableHead className="py-3 text-center w-24">Status</TableHead>
                  <TableHead className="py-3 text-right pr-4 w-auto md:w-[280px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <motion.tbody
                variants={container}
                initial="hidden"
                animate="show"
                className="divide-y divide-gray-100"
              >
                {students.map((student, index) => (
                  <motion.tr key={student.id} variants={item} className="bg-white/70 hover:bg-gray-50/70">
                    <TableCell className="py-2 pl-4 font-medium">{index + 1}</TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100/80 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="font-medium">{student.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium whitespace-nowrap",
                          student.status === "Present" ? "bg-green-50 text-green-700 border-green-200" :
                          student.status === "Absent" ? "bg-red-50 text-red-700 border-red-200" :
                          student.status === "Holiday" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          "bg-orange-50 text-orange-700 border-orange-200"
                        )}
                      >
                        {student.status === "Present" && <Check className="h-3 w-3 mr-1 inline" />}
                        {student.status === "Absent" && <X className="h-3 w-3 mr-1 inline" />}
                        {student.status === "Leave" && <Clock className="h-3 w-3 mr-1 inline" />}
                        {student.status === "Holiday" && <Calendar className="h-3 w-3 mr-1 inline" />}
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 pr-4">
                      <div className="flex justify-end gap-1.5">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant={student.status === "Present" ? "default" : "outline"} 
                            size="sm"
                            className={cn(
                              "h-7 px-2.5 text-xs whitespace-nowrap rounded-lg transition-all",
                              student.status === "Present" 
                                ? "bg-green-600 hover:bg-green-700 shadow-sm" 
                                : "hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                            )}
                            onClick={() => onStatusChange(student.id, "Present")}
                          >
                            <Check className="h-3 w-3 mr-1" /> Present
                          </Button>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant={student.status === "Absent" ? "default" : "outline"} 
                            size="sm"
                            className={cn(
                              "h-7 px-2.5 text-xs whitespace-nowrap rounded-lg transition-all",
                              student.status === "Absent" 
                                ? "bg-red-600 hover:bg-red-700 shadow-sm" 
                                : "hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                            )}
                            onClick={() => onStatusChange(student.id, "Absent")}
                          >
                            <X className="h-3 w-3 mr-1" /> Absent
                          </Button>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant={student.status === "Leave" ? "default" : "outline"} 
                            size="sm"
                            className={cn(
                              "h-7 px-2.5 text-xs whitespace-nowrap rounded-lg transition-all",
                              student.status === "Leave" 
                                ? "bg-orange-600 hover:bg-orange-700 shadow-sm" 
                                : "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
                            )}
                            onClick={() => onStatusChange(student.id, "Leave")}
                          >
                            <Clock className="h-3 w-3 mr-1" /> Leave
                          </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant={student.status === "Holiday" ? "default" : "outline"} 
                            size="sm"
                            className={cn(
                              "h-7 px-2.5 text-xs whitespace-nowrap rounded-lg transition-all",
                              student.status === "Holiday" 
                                ? "bg-blue-600 hover:bg-blue-700 shadow-sm" 
                                : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                            )}
                            onClick={() => onStatusChange(student.id, "Holiday")}
                          >
                            <Calendar className="h-3 w-3 mr-1" /> Holiday
                          </Button>
                        </motion.div>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </motion.tbody>
            </Table>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 border rounded-xl bg-white/80 text-center shadow-sm">
          <User className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground font-medium">No students found for this class</p>
          <p className="text-xs text-muted-foreground mt-1">Try selecting a different class or date</p>
        </div>
      )}
    </div>
  );
}


import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, User, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
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
        staggerChildren: 0.03
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present": return "bg-green-100 text-green-700 border-green-200";
      case "Absent": return "bg-red-100 text-red-700 border-red-200";
      case "Leave": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Holiday": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present": return <Check className="h-3.5 w-3.5" />;
      case "Absent": return <X className="h-3.5 w-3.5" />;
      case "Leave": return <Clock className="h-3.5 w-3.5" />;
      case "Holiday": return <Calendar className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-muted-foreground pb-3 border-b border-dashed mb-4">
        <span className="font-medium">Date: </span>
        {format(date, 'EEEE, MMMM d, yyyy')}
      </div>
      
      {students.length > 0 ? (
        <div className="overflow-hidden border rounded-lg bg-white shadow-sm">
          <div className="overflow-x-auto">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50/90">
                    <TableHead className="w-16 py-3 pl-4 text-xs font-medium text-gray-500">Roll #</TableHead>
                    <TableHead className="py-3 text-xs font-medium text-gray-500">Student</TableHead>
                    <TableHead className="py-3 text-center w-24 text-xs font-medium text-gray-500">Status</TableHead>
                    <TableHead className="py-3 text-right pr-4 w-auto md:w-[280px] text-xs font-medium text-gray-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <motion.tbody
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="divide-y divide-gray-100"
                >
                  {students.map((student) => (
                    <motion.tr key={student.id} variants={item} className="bg-white hover:bg-gray-50/70">
                      <TableCell className="py-2.5 pl-4 font-medium text-xs">{student.rollNumber}</TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium text-sm">{student.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "inline-flex items-center justify-center gap-1 px-2 py-0.5 text-xs font-medium shadow-sm",
                            getStatusColor(student.status)
                          )}
                        >
                          {getStatusIcon(student.status)}
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2.5 pr-4">
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant={student.status === "Present" ? "default" : "outline"} 
                                size="sm"
                                className={cn(
                                  "h-8 rounded-md transition-all",
                                  student.status === "Present" 
                                    ? "bg-green-600 hover:bg-green-700 text-white" 
                                    : "hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                                )}
                                onClick={() => onStatusChange(student.id, "Present")}
                              >
                                <Check className="h-3.5 w-3.5 mr-1.5" /> Present
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Mark student as present</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant={student.status === "Absent" ? "default" : "outline"} 
                                size="sm"
                                className={cn(
                                  "h-8 rounded-md transition-all",
                                  student.status === "Absent" 
                                    ? "bg-red-600 hover:bg-red-700 text-white" 
                                    : "hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                )}
                                onClick={() => onStatusChange(student.id, "Absent")}
                              >
                                <X className="h-3.5 w-3.5 mr-1.5" /> Absent
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Mark student as absent</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant={student.status === "Leave" ? "default" : "outline"} 
                                size="sm"
                                className={cn(
                                  "h-8 rounded-md transition-all",
                                  student.status === "Leave" 
                                    ? "bg-amber-600 hover:bg-amber-700 text-white" 
                                    : "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                                )}
                                onClick={() => onStatusChange(student.id, "Leave")}
                              >
                                <Clock className="h-3.5 w-3.5 mr-1.5" /> Leave
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Mark student on leave</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant={student.status === "Holiday" ? "default" : "outline"} 
                                size="sm"
                                className={cn(
                                  "h-8 rounded-md transition-all",
                                  student.status === "Holiday" 
                                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                    : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                                )}
                                onClick={() => onStatusChange(student.id, "Holiday")}
                              >
                                <Calendar className="h-3.5 w-3.5 mr-1.5" /> Holiday
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Mark as holiday</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </Table>
            </TooltipProvider>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 px-4 border rounded-xl bg-white text-center shadow-sm">
          <User className="h-12 w-12 text-muted-foreground/60 mb-3" />
          <p className="text-lg font-medium text-muted-foreground">No students found for this class</p>
          <p className="text-sm text-muted-foreground mt-1">Try selecting a different class or date</p>
        </div>
      )}
    </div>
  );
}


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Calendar, ChevronDown, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  status: "Present" | "Absent" | "Leave" | "Holiday";
}

interface MobileAttendanceListProps {
  students: Student[];
  onStatusChange: (studentId: string, status: "Present" | "Absent" | "Leave" | "Holiday") => void;
}

export function MobileAttendanceList({ 
  students, 
  onStatusChange
}: MobileAttendanceListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusIcon = (status: "Present" | "Absent" | "Leave" | "Holiday") => {
    switch (status) {
      case "Present": return <Check className="h-3.5 w-3.5" />;
      case "Absent": return <X className="h-3.5 w-3.5" />;
      case "Leave": return <Clock className="h-3.5 w-3.5" />;
      case "Holiday": return <Calendar className="h-3.5 w-3.5" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusClasses = (status: "Present" | "Absent" | "Leave" | "Holiday") => {
    switch (status) {
      case "Present": 
        return {
          bg: "bg-green-100 text-green-700 border-green-200",
          button: "bg-green-600 hover:bg-green-700 text-white",
          hover: "hover:bg-green-50 hover:text-green-700 hover:border-green-200",
          avatar: "bg-green-100 text-green-700"
        };
      case "Absent": 
        return {
          bg: "bg-red-100 text-red-700 border-red-200",
          button: "bg-red-600 hover:bg-red-700 text-white",
          hover: "hover:bg-red-50 hover:text-red-700 hover:border-red-200",
          avatar: "bg-red-100 text-red-700"
        };
      case "Leave": 
        return {
          bg: "bg-amber-100 text-amber-700 border-amber-200",
          button: "bg-amber-600 hover:bg-amber-700 text-white",
          hover: "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200",
          avatar: "bg-amber-100 text-amber-700"
        };
      case "Holiday": 
        return {
          bg: "bg-blue-100 text-blue-700 border-blue-200",
          button: "bg-blue-600 hover:bg-blue-700 text-white",
          hover: "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200",
          avatar: "bg-blue-100 text-blue-700"
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="mb-4 text-center text-sm text-muted-foreground pb-2 border-b border-dashed">
        <span className="font-medium">Today: </span>
        {format(new Date(), 'EEEE, MMMM d, yyyy')}
      </div>
      
      {students.length > 0 ? (
        <AnimatePresence>
          {students.map((student, index) => {
            const statusClasses = getStatusClasses(student.status);
            
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border rounded-xl overflow-hidden bg-white shadow-sm"
              >
                <div 
                  className="flex items-center justify-between p-3.5 cursor-pointer"
                  onClick={() => toggleExpand(student.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className={cn("h-10 w-10", statusClasses.avatar)}>
                      <AvatarFallback className="font-medium text-sm">{getInitials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-base">{student.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-300"></span>
                        Roll #{student.rollNumber}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-7 px-2 py-1 text-xs font-medium flex items-center gap-1 border shadow-sm",
                        statusClasses.bg
                      )}
                    >
                      {getStatusIcon(student.status)}
                      <span className="ml-1">{student.status}</span>
                    </Badge>
                    
                    <motion.div
                      animate={{ rotate: expandedId === student.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-gray-50 h-8 w-8 rounded-full flex items-center justify-center"
                    >
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    </motion.div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedId === student.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 pt-0 border-t bg-gray-50/80">
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <Button 
                            variant={student.status === "Present" ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "w-full justify-center transition-all font-medium",
                              student.status === "Present" 
                                ? statusClasses.button
                                : statusClasses.hover
                            )}
                            onClick={() => onStatusChange(student.id, "Present")}
                          >
                            <Check className="h-4 w-4 mr-1.5" /> Present
                          </Button>
                          
                          <Button 
                            variant={student.status === "Absent" ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "w-full justify-center transition-all font-medium",
                              student.status === "Absent" 
                                ? statusClasses.button 
                                : statusClasses.hover
                            )}
                            onClick={() => onStatusChange(student.id, "Absent")}
                          >
                            <X className="h-4 w-4 mr-1.5" /> Absent
                          </Button>
                          
                          <Button 
                            variant={student.status === "Leave" ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "w-full justify-center transition-all font-medium",
                              student.status === "Leave" 
                                ? statusClasses.button
                                : statusClasses.hover
                            )}
                            onClick={() => onStatusChange(student.id, "Leave")}
                          >
                            <Clock className="h-4 w-4 mr-1.5" /> Leave
                          </Button>
                          
                          <Button 
                            variant={student.status === "Holiday" ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "w-full justify-center transition-all font-medium",
                              student.status === "Holiday" 
                                ? statusClasses.button
                                : statusClasses.hover
                            )}
                            onClick={() => onStatusChange(student.id, "Holiday")}
                          >
                            <Calendar className="h-4 w-4 mr-1.5" /> Holiday
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-xl bg-white text-center shadow-sm">
          <User className="h-12 w-12 text-muted-foreground mb-3 opacity-60" />
          <p className="text-lg font-medium text-muted-foreground">No students found</p>
          <p className="text-sm text-muted-foreground mt-1">Try selecting a different class</p>
        </div>
      )}
    </div>
  );
}

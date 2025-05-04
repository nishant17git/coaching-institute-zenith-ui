
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Calendar, ChevronDown, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
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

  return (
    <div className="space-y-3">
      {students.length > 0 ? (
        <AnimatePresence>
          {students.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border rounded-xl overflow-hidden bg-white shadow-sm"
            >
              <div 
                className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() => toggleExpand(student.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-xs text-muted-foreground">#{index + 1}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div 
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                      student.status === "Present" ? "bg-green-100 text-green-700" :
                      student.status === "Absent" ? "bg-red-100 text-red-700" :
                      student.status === "Holiday" ? "bg-blue-100 text-blue-700" :
                      "bg-amber-100 text-amber-700"
                    )}
                  >
                    {student.status === "Present" && <Check className="h-3 w-3" />}
                    {student.status === "Absent" && <X className="h-3 w-3" />}
                    {student.status === "Leave" && <Clock className="h-3 w-3" />}
                    {student.status === "Holiday" && <Calendar className="h-3 w-3" />}
                    <span>{student.status}</span>
                  </div>
                  
                  <motion.div
                    animate={{ rotate: expandedId === student.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
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
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 pt-0 border-t">
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant={student.status === "Present" ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "w-full justify-center transition-all",
                            student.status === "Present" 
                              ? "bg-green-600 hover:bg-green-700" 
                              : "hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                          )}
                          onClick={() => onStatusChange(student.id, "Present")}
                        >
                          <Check className="h-4 w-4 mr-1.5" /> Present
                        </Button>
                        
                        <Button 
                          variant={student.status === "Absent" ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "w-full justify-center transition-all",
                            student.status === "Absent" 
                              ? "bg-red-600 hover:bg-red-700" 
                              : "hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                          )}
                          onClick={() => onStatusChange(student.id, "Absent")}
                        >
                          <X className="h-4 w-4 mr-1.5" /> Absent
                        </Button>
                        
                        <Button 
                          variant={student.status === "Leave" ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "w-full justify-center transition-all",
                            student.status === "Leave" 
                              ? "bg-amber-600 hover:bg-amber-700" 
                              : "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                          )}
                          onClick={() => onStatusChange(student.id, "Leave")}
                        >
                          <Clock className="h-4 w-4 mr-1.5" /> Leave
                        </Button>
                        
                        <Button 
                          variant={student.status === "Holiday" ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "w-full justify-center transition-all",
                            student.status === "Holiday" 
                              ? "bg-blue-600 hover:bg-blue-700" 
                              : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
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
          ))}
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 border rounded-xl bg-white text-center">
          <User className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground font-medium">No students found</p>
          <p className="text-xs text-muted-foreground mt-1">Try selecting a different class</p>
        </div>
      )}
    </div>
  );
}

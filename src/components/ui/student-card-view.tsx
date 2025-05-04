
import React from "react";
import { StudentRecord } from "@/types";
import { GlassCard, GlassCardContent, GlassCardFooter } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit2, Eye, Trash2, Phone, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StudentCardViewProps {
  student: StudentRecord;
  onViewDetails: (id: string) => void;
  onEdit?: (student: StudentRecord) => void;
  onDelete?: (student: StudentRecord) => void;
  onCall?: (phoneNumber: string) => void;
  onWhatsApp?: (phoneNumber: string) => void;
  index?: number;
}

export function StudentCardView({ 
  student, 
  onViewDetails, 
  onEdit, 
  onDelete, 
  onCall,
  onWhatsApp,
  index = 0 
}: StudentCardViewProps) {
  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500 hover:bg-green-600";
      case "Partial":
        return "bg-amber-500 hover:bg-amber-600";
      default:
        return "bg-red-500 hover:bg-red-600";
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCall && student.contact_number) {
      onCall(student.contact_number);
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWhatsApp && student.contact_number) {
      onWhatsApp(student.contact_number);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <GlassCard 
        className="h-full transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col" 
        animate={false}
        onClick={() => onViewDetails(student.id)}
      >
        <GlassCardContent className="p-5 flex-grow">
          <div className="flex items-center justify-between mb-4">
            <Badge className="px-2 py-0.5 text-xs">Class {student.class}</Badge>
            <Badge 
              className={cn(
                "px-2 py-0.5 text-xs text-white",
                getFeeStatusColor(student.fee_status || "Pending")
              )}
            >
              {student.fee_status || "Pending"}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-1">{student.full_name}</h3>
            <p className="text-muted-foreground text-sm flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              {new Date(student.date_of_birth).toLocaleDateString()}
            </p>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Roll Number</p>
              <p className="font-medium">{student.roll_number}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Guardian</p>
              <p className="font-medium line-clamp-1">{student.guardian_name}</p>
            </div>
          </div>
          
          <div className="mt-3 flex justify-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 flex items-center justify-center gap-1 h-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
              onClick={handleCall}
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="text-xs">Call</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 flex items-center justify-center gap-1 h-8 text-green-500 hover:text-green-600 hover:bg-green-50"
              onClick={handleWhatsApp}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-xs">WhatsApp</span>
            </Button>
          </div>
        </GlassCardContent>
        
        <GlassCardFooter className="border-t">
          <Button variant="ghost" size="sm" className="w-full" onClick={(e) => {
            e.stopPropagation();
            onViewDetails(student.id);
          }}>
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
          
          <div className="flex gap-1">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(student);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            
            {onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(student);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </GlassCardFooter>
      </GlassCard>
    </motion.div>
  );
}

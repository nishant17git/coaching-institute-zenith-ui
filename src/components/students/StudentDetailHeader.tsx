
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronLeft, Phone, MessageSquare, Edit3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { PhoneSelectionDialog } from "@/components/ui/phone-selection-dialog";

interface StudentDetailHeaderProps {
  student: any;
  onBack: () => void;
  onCall: () => void;
  onEdit: () => void;
}

export function StudentDetailHeader({
  student,
  onBack,
  onCall,
  onEdit
}: StudentDetailHeaderProps) {
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);

  // Parse multiple phone numbers
  const phoneNumbers = student.contact_number ? student.contact_number.split(',').map((num: string) => num.trim()).filter(Boolean) : [];
  const whatsappNumbers = student.whatsapp_number ? student.whatsapp_number.split(',').map((num: string) => num.trim()).filter(Boolean) : phoneNumbers;

  const handlePhoneCall = () => {
    if (phoneNumbers.length === 0) {
      toast.error("No phone number available");
      return;
    }
    if (phoneNumbers.length === 1) {
      window.open(`tel:${phoneNumbers[0]}`, "_blank");
      toast.success(`Calling ${student.full_name}`);
    } else {
      setShowPhoneDialog(true);
    }
  };

  const handleWhatsApp = () => {
    if (whatsappNumbers.length === 0) {
      toast.error("No WhatsApp number available");
      return;
    }
    if (whatsappNumbers.length === 1) {
      const number = whatsappNumbers[0].replace(/\D/g, '');
      window.open(`https://wa.me/${number}`, "_blank");
      toast.success(`Opening WhatsApp for ${student.full_name}`);
    } else {
      setShowWhatsAppDialog(true);
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, "_blank");
  };

  const handleWhatsAppOpen = (phoneNumber: string) => {
    const number = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${number}`, "_blank");
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase();
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button onClick={onBack} variant="ghost" size="icon" aria-label="Back" className="h-10 w-10 rounded-full shrink-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="md:text-2xl font-semibold tracking-tight text-3xl">Profile</h1>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex gap-1 items-center" onClick={onEdit}>
              <Edit3 className="h-4 w-4" /> Edit
            </Button>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-5 md:px-8 md:py-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 shadow-md border-4 border-white/90">
              <AvatarFallback className="bg-gradient-to-r from-[#FF4E8C] to-[#FF9ABC] text-white text-2xl font-bold">
                {getInitials(student.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">{student.full_name}</h2>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                <Badge variant="outline" className="bg-white/40">
                  Class {student.class}
                </Badge>
                {student.roll_number && (
                  <Badge variant="outline" className="bg-white/40">
                    Roll #{student.roll_number}
                  </Badge>
                )}
                <Badge variant="outline" className={cn("bg-white/40", 
                  student.fee_status === "Paid" ? "text-green-600 border-green-600/30" : 
                  student.fee_status === "Partial" ? "text-orange-600 border-orange-600/30" : 
                  "text-red-600 border-red-600/30"
                )}>
                  {student.fee_status}
                </Badge>
                <Badge variant="outline" className={cn("bg-white/40", 
                  student.attendance_percentage >= 80 ? "text-green-600 border-green-600/30" : 
                  student.attendance_percentage >= 60 ? "text-orange-600 border-orange-600/30" : 
                  "text-red-600 border-red-600/30"
                )}>
                  {student.attendance_percentage}% Attendance
                </Badge>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap sm:flex-nowrap justify-center">
              <Button variant="outline" size="sm" className="bg-white/80 flex items-center gap-1.5" onClick={handlePhoneCall}>
                <Phone className="h-3.5 w-3.5 text-blue-600" /> Call
              </Button>
              <Button variant="outline" size="sm" className="bg-white/80 flex items-center gap-1.5" onClick={handleWhatsApp}>
                <MessageSquare className="h-3.5 w-3.5 text-green-600" /> WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Selection Dialogs */}
      <PhoneSelectionDialog 
        open={showPhoneDialog} 
        onOpenChange={setShowPhoneDialog} 
        studentName={student.full_name} 
        phoneNumbers={phoneNumbers} 
        onCall={handleCall} 
      />

      <PhoneSelectionDialog 
        open={showWhatsAppDialog} 
        onOpenChange={setShowWhatsAppDialog} 
        studentName={student.full_name} 
        phoneNumbers={whatsappNumbers} 
        onCall={handleWhatsAppOpen} 
        onWhatsApp={handleWhatsAppOpen} 
      />
    </>
  );
}

import React, { useState } from "react";
import { Student } from "@/types";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Phone, MessageCircle, Eye, Share, Trash2, User, MapPin, Calendar, GraduationCap, TrendingUp, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { PhoneSelectionDialog } from "@/components/ui/phone-selection-dialog";

interface ModernStudentCardProps {
  student: Student;
  index: number;
  onCallClick: (name: string, phone: string) => void;
  onEdit?: (student: any) => void;
  onDelete?: (studentId: string) => Promise<void>;
  onViewDetails?: (studentId: string) => void;
  onDownloadVCF?: (student: any) => void;
}

export function ModernStudentCard({
  student,
  index,
  onCallClick,
  onEdit,
  onDelete,
  onViewDetails,
  onDownloadVCF
}: ModernStudentCardProps) {
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);

  // Parse multiple phone numbers
  const phoneNumbers = student.phoneNumber ? student.phoneNumber.split(',').map((num: string) => num.trim()).filter(Boolean) : [];
  const whatsappNumbers = student.whatsappNumber ? student.whatsappNumber.split(',').map((num: string) => num.trim()).filter(Boolean) : phoneNumbers;

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  };
  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Partial":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-rose-100 text-rose-700 border-rose-200";
    }
  };
  const handleWhatsApp = () => {
    if (whatsappNumbers.length === 0) {
      toast.error("No WhatsApp number available");
      return;
    }
    
    if (whatsappNumbers.length === 1) {
      const cleanNumber = whatsappNumbers[0].replace(/\D/g, "");
      window.open(`https://wa.me/${cleanNumber}`, "_blank");
    } else {
      setShowWhatsAppDialog(true);
    }
  };
  const handleCall = () => {
    if (phoneNumbers.length === 0) {
      toast.error("No phone number available");
      return;
    }
    
    if (phoneNumbers.length === 1) {
      onCallClick(student.name, phoneNumbers[0]);
    } else {
      setShowPhoneDialog(true);
    }
  };
  const handlePhoneCall = (phoneNumber: string) => {
    onCallClick(student.name, phoneNumber);
  };
  const handleWhatsAppOpen = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}`, "_blank");
  };
  const handleShare = () => {
    const shareData = {
      title: `${student.name} Contact`,
      text: `Contact details for ${student.name}\nPhone: ${phoneNumbers.join(', ')}\nClass: ${student.class}\nFather: ${student.fatherName}`,
      url: window.location.href
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).then(() => {
        toast.success("Contact shared successfully!");
      }).catch(err => {
        console.error("Error sharing:", err);
        handleFallbackShare();
      });
    } else {
      handleFallbackShare();
    }
  };
  const handleFallbackShare = () => {
    const contactText = `Contact details for ${student.name}\nPhone: ${phoneNumbers.join(', ')}\nClass: ${student.class}\nFather: ${student.fatherName}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(contactText).then(() => {
        toast.success("Contact details copied to clipboard!");
      }).catch(() => {
        toast.error("Failed to copy contact details");
      });
    } else {
      toast.error("Sharing not supported on this device");
    }
  };
  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(student.id);
    }
  };
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(student.id);
    }
  };
  const handleDownloadVCF = () => {
    if (onDownloadVCF) {
      onDownloadVCF(student);
    }
  };
  return (
    <>
      <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3,
        delay: index * 0.05
      }} whileHover={{
        y: -2,
        transition: {
          duration: 0.2
        }
      }} className="h-full">
        <Card className="bg-gradient-to-r from-white/20 to-[#FFFBFA] group h-full border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
          <CardHeader className="pb-4 relative">
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onDownloadVCF && <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm" onClick={handleDownloadVCF} title="Download Contact">
                  <Download className="h-3.5 w-3.5 text-blue-600" />
                </Button>}
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm" onClick={handleShare} title="Share Contact">
                <Share className="h-3.5 w-3.5 text-green-600" />
              </Button>
              {onDelete && <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm">
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete {student.name}'s
                        record and remove all associated data from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                        Delete Student
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>}
            </div>

            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white shadow-md">
                <AvatarFallback className="text-white font-semibold text-sm bg-gradient-to-r from-[#FF4E8C] to-[#FF9ABC]">
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-lg leading-tight mb-1 truncate">
                  {student.name}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {student.class}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs font-medium", getFeeStatusColor(student.feeStatus))}>
                    {student.feeStatus}
                  </Badge>
                </div>
                {student.rollNumber && <p className="text-xs text-slate-500">Roll: {student.rollNumber}</p>}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-4 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-3 w-3 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-slate-500 text-xs">Father:</span>
                  <p className="font-medium text-slate-800 truncate">{student.fatherName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-3 w-3 text-pink-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-slate-500 text-xs">Mother:</span>
                  <p className="font-medium text-slate-800 truncate">{student.motherName || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-xs text-slate-500">Attendance</p>
                <p className="font-semibold text-sm text-slate-800">
                  {student.attendancePercentage || 0}%
                </p>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-xs text-slate-500">Joined</p>
                <p className="font-semibold text-sm text-slate-800">
                  {student.joinDate ? new Date(student.joinDate).getFullYear() : '2024'}
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-3 pb-4 bg-slate-50/50 border-t border-slate-100">
            <div className="w-full space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" className="h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200" onClick={handleCall} disabled={phoneNumbers.length === 0}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button size="sm" variant="outline" className="h-9 bg-green-50 hover:bg-green-100 text-green-700 border-green-200" onClick={handleWhatsApp} disabled={whatsappNumbers.length === 0}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>

              <Button variant="default" size="sm" className="w-full h-9 bg-slate-900 hover:bg-slate-800" onClick={handleViewDetails}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Phone Selection Dialogs */}
      <PhoneSelectionDialog
        open={showPhoneDialog}
        onOpenChange={setShowPhoneDialog}
        studentName={student.name}
        phoneNumbers={phoneNumbers}
        onCall={handlePhoneCall}
      />

      <PhoneSelectionDialog
        open={showWhatsAppDialog}
        onOpenChange={setShowWhatsAppDialog}
        studentName={student.name}
        phoneNumbers={whatsappNumbers}
        onCall={handleWhatsAppOpen}
        onWhatsApp={handleWhatsAppOpen}
      />
    </>
  );
}


import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  MessageCircle, 
  Copy, 
  Download, 
  Check, 
  User, 
  GraduationCap,
  X
} from "lucide-react";
import { Student } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EnhancedCallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export function EnhancedCallModal({ open, onOpenChange, student }: EnhancedCallModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  
  if (!student) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const cleanPhone = (phone: string) => phone.replace(/\s+/g, '');

  const handleCopy = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopied(phone);
    toast.success("Copied to clipboard", {
      description: `${phone} has been copied.`
    });
    
    setTimeout(() => setCopied(null), 2000);
  };
  
  const handleCall = (phone: string) => {
    window.location.href = `tel:${cleanPhone(phone)}`;
    toast.success("Calling...", {
      description: `Calling ${student.name}`
    });
    onOpenChange(false);
  };
  
  const handleWhatsApp = (phone: string) => {
    const phoneNumber = cleanPhone(phone);
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
    toast.success("Opening WhatsApp", {
      description: `Starting chat with ${student.name}`
    });
    onOpenChange(false);
  };

  const handleDownloadVCard = () => {
    setDownloading(true);
    
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${student.name}
N:${student.name};;;
TEL;TYPE=CELL:${student.phoneNumber}
${student.whatsappNumber ? `TEL;TYPE=WHATSAPP:${student.whatsappNumber}` : ''}
ORG:Infinity Classes
NOTE:Student of ${student.class}
END:VCARD`;
    
    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.name}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Contact Downloaded", {
      description: `${student.name}'s contact saved successfully`
    });
    
    setTimeout(() => {
      setDownloading(false);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const phoneNumbers = [
    ...(student.phoneNumber ? [{ number: student.phoneNumber, type: "Phone", isWhatsApp: false }] : []),
    ...(student.whatsappNumber && student.whatsappNumber !== student.phoneNumber 
      ? [{ number: student.whatsappNumber, type: "WhatsApp", isWhatsApp: true }] : [])
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden bg-white border-slate-200">
        {/* Header */}
        <DialogHeader className="pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Contact Student
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Student Info */}
        <div className="py-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <Avatar className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
              <AvatarFallback className="text-white font-semibold bg-transparent">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-slate-900 mb-1">
                {student.name}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  {student.class}
                </Badge>
                {student.rollNumber && (
                  <Badge variant="outline" className="bg-slate-100 text-slate-700">
                    Roll: {student.rollNumber}
                  </Badge>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-slate-500" />
                  <span className="text-slate-600">Father: {student.fatherName}</span>
                </div>
                {student.motherName && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-600">Mother: {student.motherName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact Options */}
        <div className="py-4 space-y-4">
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Contact Numbers</h4>
            <div className="space-y-2">
              {phoneNumbers.length > 0 ? (
                phoneNumbers.map((contact, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        contact.isWhatsApp ? "bg-green-100" : "bg-blue-100"
                      )}>
                        {contact.isWhatsApp ? (
                          <MessageCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Phone className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{contact.number}</p>
                        <p className="text-xs text-slate-500">{contact.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopy(contact.number)}
                      >
                        {copied === contact.number ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => contact.isWhatsApp ? handleWhatsApp(contact.number) : handleCall(contact.number)}
                      >
                        {contact.isWhatsApp ? "Chat" : "Call"}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  No phone numbers available
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-11"
              onClick={() => student.phoneNumber && handleCall(student.phoneNumber)}
              disabled={!student.phoneNumber}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </Button>
            <Button
              variant="outline"
              className="h-11 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              onClick={() => student.whatsappNumber && handleWhatsApp(student.whatsappNumber)}
              disabled={!student.whatsappNumber}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
          <Button
            variant="secondary"
            className="w-full h-11"
            onClick={handleDownloadVCard}
            disabled={downloading || phoneNumbers.length === 0}
          >
            {downloading ? (
              <Check className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {downloading ? "Downloaded!" : "Save Contact"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

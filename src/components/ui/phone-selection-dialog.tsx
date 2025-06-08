
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";

interface PhoneSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  phoneNumbers: string[];
  whatsappNumbers?: string[];
  onCall: (phoneNumber: string) => void;
  onWhatsApp?: (phoneNumber: string) => void;
}

export function PhoneSelectionDialog({
  open,
  onOpenChange,
  studentName,
  phoneNumbers,
  whatsappNumbers = [],
  onCall,
  onWhatsApp
}: PhoneSelectionDialogProps) {
  
  const handleCall = (phoneNumber: string) => {
    onCall(phoneNumber);
    onOpenChange(false);
    toast.success(`Calling ${studentName}`, {
      description: `Calling ${phoneNumber}`
    });
  };

  const handleWhatsApp = (phoneNumber: string) => {
    if (onWhatsApp) {
      onWhatsApp(phoneNumber);
      onOpenChange(false);
      toast.success(`Opening WhatsApp for ${studentName}`, {
        description: `Starting chat with ${phoneNumber}`
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between pb-0">
          <DialogTitle className="text-lg font-semibold">
            Contact {studentName}
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Choose which number to contact:
          </p>
          
          <div className="space-y-3">
            {phoneNumbers.map((phoneNumber, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">{phoneNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      Phone {index + 1}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCall(phoneNumber)}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  {(whatsappNumbers.includes(phoneNumber) || whatsappNumbers.length === 0) && onWhatsApp && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      onClick={() => handleWhatsApp(phoneNumber)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

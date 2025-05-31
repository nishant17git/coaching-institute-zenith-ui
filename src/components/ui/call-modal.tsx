
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Copy, Share2, MessageSquare, PhoneCall, Download, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Student, StudentPhone } from "@/types";

// Set a custom style for the dialog overlay to make it less intense
import "@/styles/dialog-overlay.css";

interface CallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export default function CallModal({ open, onOpenChange, student }: CallModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  
  if (!student) {
    return null;
  }

  // Safely access phones array, treating it as empty if undefined
  const phones = student?.phones || [];
  
  // Get the first WhatsApp number if available, otherwise use the first phone number
  const whatsappPhone = phones.find(p => p.is_whatsapp)?.phone || 
                      (phones.length ? phones[0].phone : '');
  
  // Get the first phone for direct calling
  const primaryPhone = phones.length ? phones[0].phone : '';
  
  // Remove spaces and special characters for actual calling/linking
  const cleanPhone = (phone: string) => phone.replace(/\s+/g, '');

  const handleCopy = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopied(phone);
    toast.success("Copied!", {
      description: `${phone} has been copied to your clipboard.`
    });
    
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };
  
  const handleCall = (phone: string) => {
    window.location.href = `tel:${cleanPhone(phone)}`;
    toast.success("Calling...", {
      description: `Calling ${student.name} at ${phone}`
    });
    onOpenChange(false);
  };
  
  const handleEmail = () => {
    window.location.href = `mailto:?subject=Contact information for ${student.name}&body=Phone numbers: ${phones.map(p => p.phone).join(', ')}`;
    toast.success("Email client opened", {
      description: "Share these contact details via email."
    });
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Contact details for ${student.name}`,
          text: `Phone numbers: ${phones.map(p => p.phone).join(', ')}`
        });
        toast.success("Success", {
          description: "Contact details shared successfully."
        });
      } catch (error) {
        console.log('Error sharing:', error);
        toast.error("Sharing failed", {
          description: "Could not share the contact details."
        });
      }
    } else {
      toast.error("Not supported", {
        description: "Web Share API is not supported in this browser."
      });
    }
  };
  
  const handleWhatsApp = () => {
    if (!whatsappPhone) return;
    const phoneNumber = cleanPhone(whatsappPhone);
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
    toast.success("WhatsApp opening", {
      description: `Opening WhatsApp chat with ${student.name}.`
    });
  };

  const handleDownloadVCard = (phone: string) => {
    setDownloading(phone);
    
    // Create a vCard format with additional details
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${student.name}
N:${student.name};;;
TEL;TYPE=CELL:${phone}
ORG:Infinity Classes
NOTE:Student of Class ${student.class}
END:VCARD`;
    
    // Create a blob and download link
    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.name}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Contact Downloaded", {
      description: `${student.name}'s contact saved as ${student.name}.vcf`
    });
    
    setTimeout(() => {
      setDownloading(null);
      URL.revokeObjectURL(url);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md font-spotify rounded-xl bg-white backdrop-blur-lg border border-slate-200/70 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
          <div>
            <DialogTitle className="font-spotify text-xl font-medium text-slate-800">Contact {student.name}</DialogTitle>
            <DialogDescription className="font-spotify text-slate-500 mt-1">
              Choose how you want to contact this student
            </DialogDescription>
          </div>
        </DialogHeader>

        {phones.length > 0 && (
          <div className="bg-primary/5 p-4 rounded-lg mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <PhoneCall className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-slate-800 font-spotify">Call Directly</p>
                  <p className="text-sm text-slate-500 font-spotify">Call the primary phone number</p>
                </div>
              </div>
              <Button 
                variant="default" 
                className="bg-black hover:bg-black/80 text-white font-medium font-spotify"
                onClick={() => handleCall(primaryPhone)}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Now
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-4 py-2">
          <h4 className="text-sm font-medium text-slate-700 mb-1 font-spotify">Phone Numbers</h4>
          <div className="grid grid-cols-1 gap-3">
            {phones.length > 0 ? (
              phones.map((phoneObj, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 border rounded-lg p-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 font-spotify">{phoneObj.phone}</p>
                      <p className="text-xs text-slate-500 font-spotify">
                        {phoneObj.is_whatsapp ? "WhatsApp Available" : "Phone Only"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCall(phoneObj.phone)}
                      className="hover:bg-slate-100 hover:text-primary"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="sr-only">Call</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(phoneObj.phone)}
                      className="hover:bg-slate-100 hover:text-primary"
                    >
                      {copied === phoneObj.phone ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="sr-only">Copy</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownloadVCard(phoneObj.phone)}
                      className="hover:bg-slate-100 hover:text-primary"
                    >
                      {downloading === phoneObj.phone ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span className="sr-only">Save Contact</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 font-spotify">
                No phone numbers available
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 border-t pt-4 mt-2">
          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full font-spotify hover:text-primary"
              onClick={handleEmail}
              disabled={phones.length === 0}
            >
              <Mail className="mr-2 h-4 w-4" />
              <span>Email</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full font-spotify hover:text-primary"
              onClick={handleShare}
              disabled={phones.length === 0}
            >
              <Share2 className="mr-2 h-4 w-4" />
              <span>Share</span>
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              className="w-full font-spotify col-span-2 bg-green-600 hover:bg-green-700"
              onClick={handleWhatsApp}
              disabled={!whatsappPhone}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>WhatsApp</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


import { useState, useEffect, useRef } from "react";
import { Student, StudentPhone } from "@/types";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Phone, User, MessageCircle, Mail, ChevronDown, ChevronUp, Heart, Calendar, 
  Bookmark, Share2, Check, Copy } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import CallModal from "@/components/ui/call-modal";

interface StudentCardProps {
  student: Student;
  index: number;
  onCallClick: (name: string, phone: string) => void;
  isFavorite: boolean;
}

const StudentCard = ({ student, index, onCallClick, isFavorite: initialIsFavorite }: StudentCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [phonesCopied, setPhonesCopied] = useState<Record<string, boolean>>({});
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLDivElement>(null);
  
  // When component mounts, update the isFavorite state if prop changes
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const handleWhatsAppClick = (phone: StudentPhone) => {
    const cleanNumber = phone.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}`, "_blank");
  };

  const handleFavoriteClick = async () => {
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    
    toast.success(newValue ? "Added to favorites" : "Removed from favorites", {
      description: newValue 
        ? `${student.name} has been added to your favorites.` 
        : `${student.name} has been removed from your favorites.`
    });
  };

  const handleEmailStudent = () => {
    toast.success("Coming Soon", {
      description: "Email functionality will be available in the next update."
    });
  };

  // Remove the handleCardClick function that was navigating to the student detail page

  const handleContactDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsCallModalOpen(true);
  };

  const handleSaveContact = () => {
    if (!student.phones || student.phones.length === 0) {
      toast.error("No phone numbers", {
        description: "This student has no phone numbers to save."
      });
      return;
    }
    
    // Create a vCard format
    const phone = student.phones[0].phone;
    const vCardData = 
      `BEGIN:VCARD
VERSION:3.0
FN:${student.name}
TEL;TYPE=CELL:${phone}
NOTE:Student of Infinity Classes
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
    
    toast.success("Contact saved", {
      description: `Contact information for ${student.name} has been downloaded.`
    });
  };

  const copyToClipboard = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setPhonesCopied(prev => ({ ...prev, [id]: true }));
    
    setTimeout(() => {
      setPhonesCopied(prev => ({ ...prev, [id]: false }));
    }, 2000);
    
    toast.success("Phone number copied", {
      description: `Phone number ${phone} has been copied to clipboard.`
    });
  };

  const handleShareContact = async (phone: StudentPhone) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Contact: ${student.name}`,
          text: `Contact information for ${student.name}: ${phone.phone}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyToClipboard(phone.phone, phone.id);
      }
    } else {
      copyToClipboard(phone.phone, phone.id);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div ref={cardRef}>
      <Card 
        className="overflow-hidden border-slate-100 rounded-xl card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      >
        <CardHeader className="pb-3 relative">
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
              Class {student.class}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <Avatar className="h-10 w-10 bg-primary/10">
              <AvatarFallback className="text-primary font-medium">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>
            <div className="truncate-parent flex-1">
              <h3 className="text-lg font-semibold text-slate-800 font-spotify truncate-text">
                {student.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 font-spotify">
                <Calendar className="h-3 w-3" />
                <span>Joined 2025</span>
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full ml-auto flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleFavoriteClick();
              }}
            >
              <Heart 
                className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} 
              />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="px-5 pb-4 space-y-4 overflow-hidden">
          <div className="grid grid-cols-1 gap-4">
            {/* Father's details */}
            <div className="flex items-start gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="truncate-parent overflow-hidden flex-1">
                <p className="text-xs text-slate-500 mb-1 font-spotify">Father</p>
                <p className="text-sm font-medium text-slate-800 font-spotify truncate-text">{student.father}</p>
              </div>
            </div>
            
            {/* Mother's details */}
            <div className="flex items-start gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-pink-600" />
              </div>
              <div className="truncate-parent overflow-hidden flex-1">
                <p className="text-xs text-slate-500 mb-1 font-spotify">Mother</p>
                <p className="text-sm font-medium text-slate-800 font-spotify truncate-text">{student.mother}</p>
              </div>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {isMobile ? (
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full gap-2 rounded-lg font-spotify"
                  onClick={handleContactDetailsClick}
                >
                  <Phone className="h-4 w-4 text-primary" />
                  Contact Details
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[90vh] p-4 rounded-t-xl">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 mb-6" />
                <div className="mb-4">
                  <h4 className="text-lg font-medium mb-1 text-slate-800 font-spotify">Contact Details</h4>
                  <p className="text-sm text-slate-500 font-spotify">Contact information for {student.name}</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h5 className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2 font-spotify">
                      <Phone className="h-4 w-4 text-primary" />
                      Phone Numbers
                    </h5>
                    <div className="space-y-2">
                      {student.phones && student.phones.filter(p => !p.is_whatsapp).map((phone) => (
                        <div 
                          key={phone.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                          onClick={() => onCallClick(student.name, phone.phone)}
                        >
                          <Phone className="text-primary flex-shrink-0" size={16} />
                          <span className="text-sm text-slate-800 font-spotify truncate-text">{phone.phone}</span>
                          <div className="flex gap-1 ml-auto">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 rounded-full flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(phone.phone, phone.id);
                              }}
                            >
                              {phonesCopied[phone.id] ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-slate-500" />
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 rounded-full flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareContact(phone);
                              }}
                            >
                              <Share2 className="h-3.5 w-3.5 text-slate-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2 font-spotify">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      WhatsApp
                    </h5>
                    <div className="space-y-2">
                      {student.phones && student.phones.filter(p => p.is_whatsapp).map((phone) => (
                        <div 
                          key={`whatsapp-${phone.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
                          onClick={() => handleWhatsAppClick(phone)}
                        >
                          <MessageCircle className="text-green-600 flex-shrink-0" size={16} />
                          <span className="text-sm text-slate-800 font-spotify truncate-text">{phone.phone}</span>
                          <div className="flex gap-1 ml-auto">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 rounded-full flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(phone.phone, phone.id);
                              }}
                            >
                              {phonesCopied[phone.id] ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-slate-500" />
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 rounded-full flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareContact(phone);
                              }}
                            >
                              <Share2 className="h-3.5 w-3.5 text-slate-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Collapsible open={showDetails} onOpenChange={setShowDetails} className="w-full">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full gap-2 rounded-lg flex justify-between font-spotify"
                  onClick={handleContactDetailsClick}
                >
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>Contact Details</span>
                  </div>
                  {showDetails ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2 font-spotify">
                    <Phone className="h-4 w-4 text-primary" />
                    Phone Numbers
                  </h5>
                  <div className="space-y-2">
                    {student.phones && student.phones.filter(p => !p.is_whatsapp).map((phone) => (
                      <div 
                        key={phone.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden"
                        onClick={() => onCallClick(student.name, phone.phone)}
                      >
                        <Phone className="text-primary flex-shrink-0" size={16} />
                        <span className="text-sm text-slate-800 font-spotify truncate-text overflow-hidden">{phone.phone}</span>
                        <div className="flex gap-1 ml-auto">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0 rounded-full flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(phone.phone, phone.id);
                            }}
                          >
                            {phonesCopied[phone.id] ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-slate-500" />
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0 rounded-full flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareContact(phone);
                            }}
                          >
                            <Share2 className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2 font-spotify">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    WhatsApp
                  </h5>
                  <div className="space-y-2">
                    {student.phones && student.phones.filter(p => p.is_whatsapp).map((phone) => (
                      <div 
                        key={`whatsapp-${phone.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer overflow-hidden"
                        onClick={() => handleWhatsAppClick(phone)}
                      >
                        <MessageCircle className="text-green-600 flex-shrink-0" size={16} />
                        <span className="text-sm text-slate-800 font-spotify truncate-text overflow-hidden">{phone.phone}</span>
                        <div className="flex gap-1 ml-auto">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0 rounded-full flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(phone.phone, phone.id);
                            }}
                          >
                            {phonesCopied[phone.id] ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-slate-500" />
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0 rounded-full flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareContact(phone);
                            }}
                          >
                            <Share2 className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
        
        <CardFooter className="px-5 py-3 bg-slate-50 flex justify-between border-t border-slate-100">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-spotify"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEmailStudent();
                }}
              >
                <Mail className="h-4 w-4" />
                <span className="text-xs font-spotify">Email</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-slate-800 font-spotify">Coming Soon</h4>
                <p className="text-sm text-slate-500 font-spotify">
                  Email functionality will be available in the next update.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-1 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg font-spotify"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveContact();
            }}
          >
            <Bookmark className="h-4 w-4" />
            <span className="text-xs font-spotify">Save</span>
          </Button>
        </CardFooter>
      </Card>

      {/* CallModal for this student */}
      <CallModal
        open={isCallModalOpen}
        onOpenChange={setIsCallModalOpen}
        student={student}
      />
    </div>
  );
};

export default StudentCard;

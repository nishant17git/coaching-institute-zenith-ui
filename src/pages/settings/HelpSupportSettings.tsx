import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HelpCircle, MessageCircle, Book, Video, Mail, Phone, ExternalLink, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { toast } from "sonner";
export default function HelpSupportSettings() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const quickHelp = [{
    title: "Getting Started",
    description: "Learn the basics of using the app",
    icon: Book
  }, {
    title: "Managing Students",
    description: "Add, edit, and organize student information",
    icon: HelpCircle
  }, {
    title: "Attendance Tracking",
    description: "How to mark and track attendance",
    icon: HelpCircle
  }, {
    title: "Question Bank",
    description: "Using the comprehensive question database",
    icon: Book
  }, {
    title: "Reports & Analytics",
    description: "Generate and understand reports",
    icon: HelpCircle
  }, {
    title: "Account Settings",
    description: "Customize your account and preferences",
    icon: HelpCircle
  }];
  const contactOptions = [{
    title: "Email Support",
    description: "Get help via email within 24 hours",
    action: "support@molecules.app",
    icon: Mail
  }, {
    title: "Phone Support",
    description: "Call us during business hours",
    action: "+1 (555) 123-4567",
    icon: Phone
  }, {
    title: "Live Chat",
    description: "Chat with our support team",
    action: "Start Chat",
    icon: MessageCircle
  }];
  const handleSearchHelp = () => {
    if (searchQuery.trim()) {
      toast.info(`Searching for: ${searchQuery}`);
    }
  };
  const handleSendMessage = () => {
    if (supportMessage.trim()) {
      toast.success("Support message sent successfully! We'll get back to you soon.");
      setSupportMessage("");
    }
  };
  const handleContactAction = (option: any) => {
    if (option.icon === Mail) {
      window.location.href = `mailto:${option.action}`;
    } else if (option.icon === Phone) {
      window.location.href = `tel:${option.action}`;
    } else {
      toast.info("Opening live chat...");
    }
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto space-y-6 px-0 py-0 bg-white">
        <EnhancedPageHeader title="Help & Support" description="Get help and contact our support team" showBackButton onBack={() => navigate("/settings")} />

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="space-y-6">
          {/* Search Help */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Search className="h-4 w-4 text-white" />
                </div>
                Search Help Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input placeholder="What do you need help with?" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="rounded-xl" onKeyPress={e => e.key === 'Enter' && handleSearchHelp()} />
                <Button onClick={handleSearchHelp} className="rounded-xl">
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Help Topics */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-white" />
                </div>
                Quick Help Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {quickHelp.map((item, index) => <button key={index} className="p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => toast.info(`Opening help for: ${item.title}`)}>
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                    </div>
                  </button>)}
              </div>
            </CardContent>
          </Card>

          {/* Video Tutorials */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Video className="h-4 w-4 text-white" />
                </div>
                Video Tutorials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => toast.info("Opening video tutorials...")}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-red-500 rounded flex items-center justify-center">
                      <Video className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">Complete App Walkthrough</div>
                      <div className="text-sm text-muted-foreground">15 min tutorial</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                  </div>
                </button>
                <button className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => toast.info("Opening video tutorials...")}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-red-500 rounded flex items-center justify-center">
                      <Video className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">Advanced Features Guide</div>
                      <div className="text-sm text-muted-foreground">8 min tutorial</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {contactOptions.map((option, index) => <button key={index} onClick={() => handleContactAction(option)} className="p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center gap-3">
                      <option.icon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{option.title}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </button>)}
              </div>
            </CardContent>
          </Card>

          {/* Send Message */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Send us a Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Message</Label>
                <Textarea placeholder="Describe your issue or question..." value={supportMessage} onChange={e => setSupportMessage(e.target.value)} className="rounded-xl min-h-[100px]" />
              </div>
              <Button onClick={handleSendMessage} className="w-full rounded-xl">
                Send Message
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>;
}
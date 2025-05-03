
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  Trash2, 
  Upload, 
  Moon, 
  Sun, 
  Laptop,
  Globe,
  Mail,
  Phone,
  Building,
  Palette,
  FileText,
  CreditCard as PaymentIcon,
  Users as UsersIcon
} from "lucide-react";
import { getStoredData, storeData, STORAGE_KEYS } from "@/services/storageService";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { UserIcon } from "@/components/UserIcon";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface InstituteSettings {
  instituteName: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  feeReminders: boolean;
  attendanceAlerts: boolean;
  systemUpdates: boolean;
}

interface AppSettings {
  institute: InstituteSettings;
  notifications: NotificationSettings;
  theme: "light" | "dark" | "system";
  exportSettings: {
    includeInstituteLogo: boolean;
    includeContactInfo: boolean;
    defaultFooterText: string;
  };
  language: string;
  dateFormat: string;
  currencyFormat: string;
}

// Default settings
const defaultSettings: AppSettings = {
  institute: {
    instituteName: "Infinity Classes",
    email: "theinfinityclasses1208@gmail.com",
    phone: "+91 9905880697",
    address: "Kandri, Mandar, Ranchi",
    logo: "/icon.png"
  },
  notifications: {
    email: true,
    push: true,
    feeReminders: true,
    attendanceAlerts: true,
    systemUpdates: false,
  },
  theme: "system",
  exportSettings: {
    includeInstituteLogo: true,
    includeContactInfo: true,
    defaultFooterText: "Thank you for choosing Infinity Classes."
  },
  language: "en",
  dateFormat: "DD/MM/YYYY",
  currencyFormat: "₹",
}

// Available locales
const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
];

// Date format options
const dateFormats = [
  { code: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { code: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { code: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

export default function Settings() {
  const { user, logout } = useAuth();
  
  // Load settings from local storage or use defaults
  const [settings, setSettings] = useState<AppSettings>(
    getStoredData(STORAGE_KEYS.SETTINGS, defaultSettings)
  );
  
  const [activeTab, setActiveTab] = useState("general");
  const [logoPreview, setLogoPreview] = useState<string | undefined>(settings.institute.logo);
  const [saveIndicator, setSaveIndicator] = useState<string | null>(null);
  
  // Update localStorage when settings change
  useEffect(() => {
    storeData(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);
  
  const handleSaveInstitute = () => {
    storeData(STORAGE_KEYS.SETTINGS, settings);
    setSaveIndicator("institute");
    toast.success("Institute settings saved successfully!");
    
    // Reset save indicator after showing animation
    setTimeout(() => {
      setSaveIndicator(null);
    }, 2000);
  };
  
  const handleSaveNotifications = () => {
    storeData(STORAGE_KEYS.SETTINGS, settings);
    setSaveIndicator("notifications");
    toast.success("Notification preferences saved!");
    
    setTimeout(() => {
      setSaveIndicator(null);
    }, 2000);
  };
  
  const handleSaveExportSettings = () => {
    storeData(STORAGE_KEYS.SETTINGS, settings);
    setSaveIndicator("export");
    toast.success("Export settings saved successfully!");
    
    setTimeout(() => {
      setSaveIndicator(null);
    }, 2000);
  };

  const handleSaveAppearance = () => {
    storeData(STORAGE_KEYS.SETTINGS, settings);
    setSaveIndicator("appearance");
    toast.success("Appearance settings saved!");
    
    setTimeout(() => {
      setSaveIndicator(null);
    }, 2000);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const logoDataUrl = event.target.result as string;
          setLogoPreview(logoDataUrl);
          setSettings(prev => ({
            ...prev,
            institute: {
              ...prev.institute,
              logo: logoDataUrl
            }
          }));
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const saveButtonVariants = {
    idle: { scale: 1 },
    saving: { 
      scale: [1, 1.05, 1],
      backgroundColor: ["#0284c7", "#0ea5e9", "#0284c7"],
      transition: { 
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  // Get user profile image and name safely
  const userImage = user?.image || undefined;
  const userName = user?.name || "Admin User";
  const userEmail = user?.email || "admin@example.com";
  
  return (
    <div className="space-y-6">
      <EnhancedPageHeader 
        title="Settings" 
        description="Manage your account and application settings"
        showBackButton
      />

      <Tabs 
        defaultValue="general" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row gap-6">
          <Card className="sm:w-[260px]">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  {userImage ? (
                    <AvatarImage src={userImage} alt={userName} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                      {userName.charAt(0) || "A"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{userName}</p>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-1 p-1">
                <TabsTrigger 
                  value="general"
                  className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted w-full"
                >
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger 
                  value="profile"
                  className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted w-full"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications"
                  className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted w-full"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="appearance"
                  className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted w-full"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger 
                  value="export"
                  className="justify-start px-3 py-2 h-auto data-[state=active]:bg-muted w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Settings
                </TabsTrigger>
              </TabsList>
            </CardContent>
            <CardFooter className="border-t p-3 mt-4">
              <Button 
                variant="destructive" 
                className="w-full justify-start" 
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </CardFooter>
          </Card>
          
          <div className="flex-1 min-w-0">
            <TabsContent value="general">
              <motion.div
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Institute Profile</CardTitle>
                    <CardDescription>
                      Manage your institute's information and contact details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center mb-6">
                      <div className="w-32 h-32 rounded-lg overflow-hidden border mb-4">
                        <img 
                          src={logoPreview || "/icon.png"} 
                          alt="Institute Logo" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Label 
                        htmlFor="logo-upload" 
                        className="cursor-pointer bg-muted hover:bg-muted/80 py-2 px-4 rounded-md flex gap-2 items-center transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Logo
                      </Label>
                      <Input 
                        id="logo-upload" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden" 
                      />
                    </div>
                  
                    <div className="space-y-2">
                      <Label htmlFor="instituteName">Institute Name</Label>
                      <Input
                        id="instituteName"
                        value={settings.institute.instituteName}
                        onChange={(e) => setSettings(prev => ({
                          ...prev, 
                          institute: { ...prev.institute, instituteName: e.target.value }
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.institute.email}
                        onChange={(e) => setSettings(prev => ({
                          ...prev, 
                          institute: { ...prev.institute, email: e.target.value }
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={settings.institute.phone}
                        onChange={(e) => setSettings(prev => ({
                          ...prev, 
                          institute: { ...prev.institute, phone: e.target.value }
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={settings.institute.address}
                        onChange={(e) => setSettings(prev => ({
                          ...prev, 
                          institute: { ...prev.institute, address: e.target.value }
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Regional Settings</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div className="space-y-2">
                          <Label htmlFor="language" className="text-sm">Language</Label>
                          <Select
                            value={settings.language}
                            onValueChange={(value) => setSettings(prev => ({
                              ...prev, 
                              language: value
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              {languages.map(lang => (
                                <SelectItem key={lang.code} value={lang.code}>
                                  {lang.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="dateFormat" className="text-sm">Date Format</Label>
                          <Select
                            value={settings.dateFormat}
                            onValueChange={(value) => setSettings(prev => ({
                              ...prev, 
                              dateFormat: value
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              {dateFormats.map(format => (
                                <SelectItem key={format.code} value={format.code}>
                                  {format.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="currencyFormat" className="text-sm">Currency Format</Label>
                          <Select
                            value={settings.currencyFormat}
                            onValueChange={(value) => setSettings(prev => ({
                              ...prev, 
                              currencyFormat: value
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="₹">Indian Rupee (₹)</SelectItem>
                              <SelectItem value="$">US Dollar ($)</SelectItem>
                              <SelectItem value="€">Euro (€)</SelectItem>
                              <SelectItem value="£">British Pound (£)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <motion.div 
                      variants={saveButtonVariants}
                      animate={saveIndicator === 'institute' ? 'saving' : 'idle'}
                      className="w-full"
                    >
                      <Button 
                        onClick={handleSaveInstitute} 
                        className="w-full sm:w-auto"
                      >
                        Save Changes
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="profile">
              <motion.div
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>
                      Manage your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center mb-8">
                      <Avatar className="h-24 w-24 mb-4">
                        {userImage ? (
                          <AvatarImage src={userImage} alt={userName} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                            {userName.charAt(0) || "A"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <Label 
                        htmlFor="avatar-upload" 
                        className="cursor-pointer bg-muted hover:bg-muted/80 py-2 px-4 rounded-md flex gap-2 items-center transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Photo
                      </Label>
                      <Input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="userName">Name</Label>
                      <Input
                        id="userName"
                        value={userName}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={userEmail}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userPhone">Phone</Label>
                      <Input
                        id="userPhone"
                        type="tel"
                        placeholder="Your phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="flex gap-4">
                        <Input
                          id="password"
                          type="password"
                          value="********"
                          disabled
                          className="flex-1"
                        />
                        <Button variant="outline">
                          Change Password
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Protect your account with 2FA</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline">
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Setup 2FA
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">
                      Delete Account
                    </Button>
                    <Button>
                      Update Profile
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="notifications">
              <motion.div
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Configure how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Notification Channels</h3>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>Email Notifications</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </div>
                        </div>
                        <Switch 
                          checked={settings.notifications.email}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, email: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span>Push Notifications</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Receive push notifications on your device
                          </div>
                        </div>
                        <Switch 
                          checked={settings.notifications.push}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, push: checked }
                          }))}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Notification Types</h3>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                            <span>Fee Reminders</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Notifications about pending fees and payments
                          </div>
                        </div>
                        <Switch 
                          checked={settings.notifications.feeReminders}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, feeReminders: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4 text-muted-foreground" />
                            <span>Attendance Alerts</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Notifications about student attendance issues
                          </div>
                        </div>
                        <Switch 
                          checked={settings.notifications.attendanceAlerts}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, attendanceAlerts: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span>System Updates</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Notifications about new features and updates
                          </div>
                        </div>
                        <Switch 
                          checked={settings.notifications.systemUpdates}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, systemUpdates: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <motion.div 
                      variants={saveButtonVariants}
                      animate={saveIndicator === 'notifications' ? 'saving' : 'idle'}
                      className="w-full"
                    >
                      <Button 
                        onClick={handleSaveNotifications}
                        className="w-full sm:w-auto"
                      >
                        Save Preferences
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="appearance">
              <motion.div
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize how the application looks and feels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-base">Theme</Label>
                      <RadioGroup
                        defaultValue={settings.theme}
                        onValueChange={(value) => 
                          setSettings(prev => ({
                            ...prev,
                            theme: value as "light" | "dark" | "system"
                          }))
                        }
                        className="grid grid-cols-3 gap-4"
                      >
                        <Label
                          htmlFor="theme-light"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                        >
                          <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                          <Sun className="mb-3 h-6 w-6" />
                          <span className="text-sm font-medium">Light</span>
                        </Label>
                        <Label
                          htmlFor="theme-dark"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                        >
                          <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                          <Moon className="mb-3 h-6 w-6" />
                          <span className="text-sm font-medium">Dark</span>
                        </Label>
                        <Label
                          htmlFor="theme-system"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                        >
                          <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                          <Laptop className="mb-3 h-6 w-6" />
                          <span className="text-sm font-medium">System</span>
                        </Label>
                      </RadioGroup>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label className="text-base">Font Size</Label>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Aa</span>
                          <input
                            type="range"
                            min="80"
                            max="120"
                            defaultValue="100"
                            step="5"
                            className="w-full max-w-md mx-4"
                            aria-label="Font size"
                          />
                          <span className="text-lg">Aa</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Adjust the font size used throughout the application
                        </p>
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <Label className="text-base">Color Preferences</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <HoverCard>
                          <HoverCardTrigger>
                            <div className="flex flex-col space-y-1.5">
                              <Label htmlFor="primary-color">Primary Color</Label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  id="primary-color"
                                  defaultValue="#0284c7"
                                  className="w-10 h-10 rounded cursor-pointer"
                                />
                                <span className="text-sm text-muted-foreground">#0284c7</span>
                              </div>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent side="top">
                            <div className="text-sm">
                              <p>Primary color is used for buttons, links and active elements.</p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                        
                        <HoverCard>
                          <HoverCardTrigger>
                            <div className="flex flex-col space-y-1.5">
                              <Label htmlFor="accent-color">Accent Color</Label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  id="accent-color"
                                  defaultValue="#f97316"
                                  className="w-10 h-10 rounded cursor-pointer"
                                />
                                <span className="text-sm text-muted-foreground">#f97316</span>
                              </div>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent side="top">
                            <div className="text-sm">
                              <p>Accent color is used for highlights and secondary elements.</p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Advanced color customization will be available in a future update.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <motion.div 
                      variants={saveButtonVariants}
                      animate={saveIndicator === 'appearance' ? 'saving' : 'idle'}
                      className="w-full"
                    >
                      <Button onClick={handleSaveAppearance} className="w-full sm:w-auto">
                        Apply Changes
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="export">
              <motion.div
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Export Settings</CardTitle>
                    <CardDescription>
                      Configure defaults for PDF exports and reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>Include Institute Logo</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Add the institute logo to all exports
                        </div>
                      </div>
                      <Switch 
                        checked={settings.exportSettings.includeInstituteLogo}
                        onCheckedChange={(checked) => setSettings(prev => ({
                          ...prev,
                          exportSettings: { ...prev.exportSettings, includeInstituteLogo: checked }
                        }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>Include Contact Information</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Add institute contact details to exports
                        </div>
                      </div>
                      <Switch 
                        checked={settings.exportSettings.includeContactInfo}
                        onCheckedChange={(checked) => setSettings(prev => ({
                          ...prev,
                          exportSettings: { ...prev.exportSettings, includeContactInfo: checked }
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="footerText">Default Footer Text</Label>
                      <Input
                        id="footerText"
                        value={settings.exportSettings.defaultFooterText}
                        onChange={(e) => setSettings(prev => ({
                          ...prev, 
                          exportSettings: { ...prev.exportSettings, defaultFooterText: e.target.value }
                        }))}
                      />
                      <p className="text-sm text-muted-foreground">
                        This text will appear at the bottom of all exported documents
                      </p>
                    </div>
                    
                    <div className="space-y-2 mt-6">
                      <Label>Export File Formats</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="format-pdf" className="rounded" defaultChecked />
                          <label htmlFor="format-pdf" className="text-sm">PDF</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="format-xlsx" className="rounded" defaultChecked />
                          <label htmlFor="format-xlsx" className="text-sm">Excel</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="format-csv" className="rounded" defaultChecked />
                          <label htmlFor="format-csv" className="text-sm">CSV</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="format-docx" className="rounded" />
                          <label htmlFor="format-docx" className="text-sm">Word</label>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Select default export formats that will be available
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <motion.div 
                      variants={saveButtonVariants}
                      animate={saveIndicator === 'export' ? 'saving' : 'idle'}
                      className="w-full"
                    >
                      <Button onClick={handleSaveExportSettings} className="w-full sm:w-auto">
                        Save Export Settings
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

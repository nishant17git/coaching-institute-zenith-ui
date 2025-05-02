import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import { Settings as SettingsIcon, User, Bell, ShieldCheck, Trash2, Upload, Moon, Sun, Monitor } from "lucide-react";
import { getStoredData, storeData, STORAGE_KEYS } from "@/services/storageService";
import { ModeToggle } from "@/components/mode-toggle";

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
  }
};

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Load settings from local storage or use defaults
  const [settings, setSettings] = useState<AppSettings>(
    getStoredData(STORAGE_KEYS.SETTINGS, defaultSettings)
  );
  
  const [activeSection, setActiveSection] = useState("general");
  const [logoPreview, setLogoPreview] = useState<string | undefined>(settings.institute.logo);
  
  // Update localStorage when settings change
  useEffect(() => {
    storeData(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  // Update theme when settings theme changes
  useEffect(() => {
    setTheme(settings.theme);
  }, [settings.theme, setTheme]);
  
  const handleSaveInstitute = () => {
    storeData(STORAGE_KEYS.SETTINGS, settings);
    toast.success("Institute settings saved successfully!");
  };
  
  const handleSaveNotifications = () => {
    storeData(STORAGE_KEYS.SETTINGS, settings);
    toast.success("Notification preferences saved!");
  };
  
  const handleSaveExportSettings = () => {
    storeData(STORAGE_KEYS.SETTINGS, settings);
    toast.success("Export settings saved successfully!");
  };

  const handleSaveTheme = () => {
    storeData(STORAGE_KEYS.SETTINGS, settings);
    setTheme(settings.theme);
    toast.success("Theme settings saved successfully!");
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
  
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <ModeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-apple-blue to-apple-indigo flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{user?.name?.charAt(0) || "A"}</span>
                </div>
                <div>
                  <h3 className="font-medium">{user?.name || "Admin User"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email || "admin@example.com"}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="text-sm">
                <div 
                  className={`${activeSection === "general" ? "bg-primary/10 text-primary" : "hover:bg-secondary"} p-3 font-medium flex items-center gap-3 cursor-pointer transition-colors`}
                  onClick={() => setActiveSection("general")}
                >
                  <SettingsIcon className="h-4 w-4" />
                  Institute Settings
                </div>
                <div 
                  className={`${activeSection === "profile" ? "bg-primary/10 text-primary" : "hover:bg-secondary"} p-3 flex items-center gap-3 cursor-pointer transition-colors`}
                  onClick={() => setActiveSection("profile")}
                >
                  <User className="h-4 w-4" />
                  Profile
                </div>
                <div 
                  className={`${activeSection === "notifications" ? "bg-primary/10 text-primary" : "hover:bg-secondary"} p-3 flex items-center gap-3 cursor-pointer transition-colors`}
                  onClick={() => setActiveSection("notifications")}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </div>
                <div 
                  className={`${activeSection === "export" ? "bg-primary/10 text-primary" : "hover:bg-secondary"} p-3 flex items-center gap-3 cursor-pointer transition-colors`}
                  onClick={() => setActiveSection("export")}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Export Settings
                </div>
                <div 
                  className={`${activeSection === "appearance" ? "bg-primary/10 text-primary" : "hover:bg-secondary"} p-3 flex items-center gap-3 cursor-pointer transition-colors`}
                  onClick={() => setActiveSection("appearance")}
                >
                  <Moon className="h-4 w-4" />
                  Appearance
                </div>
              </nav>
            </CardContent>
            <CardFooter className="border-t p-3">
              <Button 
                variant="destructive" 
                className="w-full justify-start" 
                onClick={logout}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Logout
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          {activeSection === "general" && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Institute Profile</CardTitle>
                <CardDescription>
                  Manage your institute's information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveInstitute} className="animate-pulse">Save Changes</Button>
              </CardFooter>
            </Card>
          )}
          
          {activeSection === "profile" && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Name</Label>
                  <Input
                    id="userName"
                    value={user?.name || "Admin User"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={user?.email || "admin@example.com"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value="********"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => toast.success("Profile information updated!")}>
                  Update Profile
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {activeSection === "notifications" && (
            <Card className="animate-fade-in">
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
                      <div>Email Notifications</div>
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
                      <div>Push Notifications</div>
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
                      <div>Fee Reminders</div>
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
                      <div>Attendance Alerts</div>
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
                      <div>System Updates</div>
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
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </CardFooter>
            </Card>
          )}
          
          {activeSection === "export" && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Export Settings</CardTitle>
                <CardDescription>
                  Configure defaults for PDF exports and reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div>Include Institute Logo</div>
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
                    <div>Include Contact Information</div>
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
                
                <div className="space-y-2">
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
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveExportSettings}>Save Settings</Button>
              </CardFooter>
            </Card>
          )}

          {activeSection === "appearance" && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Configure your theme preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={`border p-4 rounded-lg flex flex-col items-center gap-2 cursor-pointer hover:bg-secondary transition-colors ${settings.theme === 'light' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
                    >
                      <div className="h-20 w-20 rounded-full bg-white border flex items-center justify-center">
                        <Sun className="h-8 w-8 text-amber-500" />
                      </div>
                      <p className="font-medium">Light</p>
                    </div>
                    <div 
                      className={`border p-4 rounded-lg flex flex-col items-center gap-2 cursor-pointer hover:bg-secondary transition-colors ${settings.theme === 'dark' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
                    >
                      <div className="h-20 w-20 rounded-full bg-gray-800 border flex items-center justify-center">
                        <Moon className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="font-medium">Dark</p>
                    </div>
                    <div 
                      className={`border p-4 rounded-lg flex flex-col items-center gap-2 cursor-pointer hover:bg-secondary transition-colors ${settings.theme === 'system' ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSettings(prev => ({ ...prev, theme: 'system' }))}
                    >
                      <div className="h-20 w-20 rounded-full bg-gradient-to-r from-white to-gray-800 border flex items-center justify-center">
                        <Monitor className="h-8 w-8 text-blue-500" />
                      </div>
                      <p className="font-medium">System</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {settings.theme === 'system' ? 
                      'System theme will follow your device settings.' : 
                      `${settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)} theme will be used regardless of your system settings.`}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveTheme}>Save Theme</Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
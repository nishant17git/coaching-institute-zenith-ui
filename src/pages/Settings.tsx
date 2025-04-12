
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Settings as SettingsIcon, User, Bell, ShieldCheck, Trash2 } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  
  const [instituteName, setInstituteName] = useState("Zenith Coaching Institute");
  const [email, setEmail] = useState(user?.email || "admin@example.com");
  const [phone, setPhone] = useState("+91 9876543210");
  const [address, setAddress] = useState("123, Education Lane, Knowledge City");
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    feeReminders: true,
    attendanceAlerts: true,
    systemUpdates: false,
  });
  
  const handleSaveProfile = () => {
    toast.success("Profile settings saved successfully!");
  };
  
  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved!");
  };
  
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-apple-blue to-apple-indigo flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h3 className="font-medium">{user?.name || "Admin User"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email || "admin@example.com"}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="text-sm">
                <div className="bg-primary/10 p-3 text-primary font-medium flex items-center gap-3">
                  <SettingsIcon className="h-4 w-4" />
                  General Settings
                </div>
                <div className="hover:bg-secondary p-3 flex items-center gap-3">
                  <User className="h-4 w-4" />
                  Profile
                </div>
                <div className="hover:bg-secondary p-3 flex items-center gap-3">
                  <Bell className="h-4 w-4" />
                  Notifications
                </div>
                <div className="hover:bg-secondary p-3 flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4" />
                  Security
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
          <Card>
            <CardHeader>
              <CardTitle>Institute Profile</CardTitle>
              <CardDescription>
                Manage your institute's information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instituteName">Institute Name</Label>
                <Input
                  id="instituteName"
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardFooter>
          </Card>
          
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
                    <div>Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
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
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
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
                    checked={notifications.feeReminders}
                    onCheckedChange={(checked) => setNotifications({...notifications, feeReminders: checked})}
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
                    checked={notifications.attendanceAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, attendanceAlerts: checked})}
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
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) => setNotifications({...notifications, systemUpdates: checked})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

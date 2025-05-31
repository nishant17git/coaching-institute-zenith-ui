import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { User, Bell, Palette, Building, Shield, Database, HelpCircle, FileText, ChevronRight, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
const settingsGroups = [{
  title: "Personal",
  items: [{
    id: "profile",
    title: "Profile & Account",
    description: "Personal information and account settings",
    icon: User,
    color: "bg-blue-500",
    route: "/settings/profile"
  }, {
    id: "notifications",
    title: "Notifications",
    description: "Manage alerts and notifications",
    icon: Bell,
    color: "bg-red-500",
    route: "/settings/notifications"
  }]
}, {
  title: "Preferences",
  items: [{
    id: "appearance",
    title: "Appearance",
    description: "Customize app appearance and theme",
    icon: Palette,
    color: "bg-purple-500",
    route: "/settings/appearance"
  }, {
    id: "institute",
    title: "Institute Settings",
    description: "Configure institute information",
    icon: Building,
    color: "bg-green-500",
    route: "/settings/institute"
  }]
}, {
  title: "Privacy & Security",
  items: [{
    id: "security",
    title: "Privacy & Security",
    description: "Security and privacy controls",
    icon: Shield,
    color: "bg-orange-500",
    route: "/settings/security"
  }, {
    id: "data",
    title: "Data & Storage",
    description: "Manage app data and storage",
    icon: Database,
    color: "bg-indigo-500",
    route: "/settings/data"
  }]
}, {
  title: "Support",
  items: [{
    id: "help",
    title: "Help & Support",
    description: "Get help and contact support",
    icon: HelpCircle,
    color: "bg-cyan-500",
    route: "/settings/help"
  }, {
    id: "about",
    title: "About",
    description: "App information and version",
    icon: FileText,
    color: "bg-gray-500",
    route: "/settings/about"
  }]
}];
export default function Settings() {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const userName = user?.name || "Admin User";
  const userEmail = user?.email || "admin@example.com";
  const handleItemClick = (route: string) => {
    navigate(route);
  };
  const handleLogout = () => {
    toast.success("Signed out successfully");
    logout();
  };
  const handleToggle = (setting: string, value: boolean) => {
    if (setting === "notifications") {
      setPushNotifications(value);
      toast.success(value ? "Notifications enabled" : "Notifications disabled");
    } else if (setting === "darkMode") {
      setDarkMode(value);
      toast.success(value ? "Dark mode enabled" : "Light mode enabled");
    }
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-8 px-0 bg-white">
        <EnhancedPageHeader title="Settings" description="Manage your account and app preferences" showBackButton />

        {/* User Profile Section */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-[#F25239] via-[#FCAF40] to-[#4FD1C5] p-8 py-[16px]">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-4 border-white/30 shadow-lg">
                    <AvatarFallback className="bg-white text-2xl font-bold font-geist text-red-500">
                      {userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-white">
                    <h2 className="font-semibold mb-1 text-sm font-geist">{userName}</h2>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30 font-geist">
                      Administrator
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 font-geist">Account Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-geist">Active</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/settings/profile")} className="rounded-full px-6 font-geist">
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Settings */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.1
      }}>
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 font-geist">
                Quick Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                      <Bell className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 font-geist">Push Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-geist">Receive important updates</p>
                    </div>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={value => handleToggle("notifications", value)} />
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      <Palette className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 font-geist">Dark Mode</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-geist">Switch to dark theme</p>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={value => handleToggle("darkMode", value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => <motion.div key={group.title} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.2 + groupIndex * 0.1
      }} className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 font-geist">
              {group.title}
            </h3>
            
            <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                {group.items.map((item, index) => <div key={item.id}>
                    <button onClick={() => handleItemClick(item.route)} className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.color)}>
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900 dark:text-gray-100 font-geist">{item.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-geist">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                    {index < group.items.length - 1 && <Separator />}
                  </div>)}
              </CardContent>
            </Card>
          </motion.div>)}

        {/* Sign Out */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.6
      }}>
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl">
            <CardContent className="p-0">
              <button onClick={handleLogout} className="w-full p-6 flex items-center justify-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 text-red-600 dark:text-red-400">
                <LogOut className="h-5 w-5" />
                <span className="font-medium font-geist">Sign Out</span>
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* App Info */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.5,
        delay: 0.7
      }} className="text-center py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-geist">Molecules v2.1.0</p>
        </motion.div>
      </div>
    </div>;
}
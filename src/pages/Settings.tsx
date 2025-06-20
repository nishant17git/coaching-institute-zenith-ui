import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EnhancedPageHeader } from "@/components/enhanced-page-header";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { User, Bell, Palette, Building, Shield, Database, HelpCircle, FileText, ChevronRight, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
const settingsGroups = [{
  title: "ACCOUNT",
  items: [{
    id: "profile",
    title: "Profile & Account",
    description: "Edit personal details and login",
    icon: User,
    color: "bg-blue-500",
    type: "link",
    route: "/settings/profile"
  }]
}, {
  title: "PREFERENCES",
  items: [{
    id: "notifications",
    title: "Notifications",
    description: "Manage alerts and notifications",
    icon: Bell,
    color: "bg-red-500",
    type: "toggle",
    stateKey: "pushNotifications"
  }, {
    id: "appearance",
    title: "Dark Mode",
    description: "Toggle light/dark theme",
    icon: Palette,
    color: "bg-gray-600",
    type: "toggle",
    stateKey: "darkMode"
  }]
}, {
  title: "ORGANIZATION",
  items: [{
    id: "institute",
    title: "Institute Settings",
    description: "Configure institute details",
    icon: Building,
    color: "bg-green-500",
    type: "link",
    route: "/settings/institute"
  }]
}, {
  title: "SECURITY",
  items: [{
    id: "privacy",
    title: "Privacy & Security",
    description: "Security controls and privacy",
    icon: Shield,
    color: "bg-orange-500",
    type: "link",
    route: "/settings/security"
  }, {
    id: "data",
    title: "Data & Storage",
    description: "Manage app data and storage",
    icon: Database,
    color: "bg-indigo-500",
    type: "link",
    route: "/settings/data"
  }]
}, {
  title: "SUPPORT",
  items: [{
    id: "help",
    title: "Help & Support",
    description: "Help articles and contact",
    icon: HelpCircle,
    color: "bg-cyan-500",
    type: "link",
    route: "/settings/help"
  }, {
    id: "about",
    title: "About",
    description: "App version and legal info",
    icon: FileText,
    color: "bg-gray-500",
    type: "link",
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
  const handleItemClick = (route: string) => {
    navigate(route);
  };
  const handleToggle = (key: string, value: boolean) => {
    if (key === "pushNotifications") {
      setPushNotifications(value);
      toast.success(value ? "Notifications enabled" : "Notifications disabled");
    } else if (key === "darkMode") {
      setDarkMode(value);
      toast.success(value ? "Dark mode enabled" : "Light mode enabled");
    }
  };
  const handleLogout = () => {
    toast.success("Signed out successfully");
    logout();
  };
  const rowHover = darkMode ? {
    backgroundColor: "#1F2937"
  } : {
    backgroundColor: "#F3F4F6"
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* HEADER - Always visible */}
      <EnhancedPageHeader title="Settings" description="Manage your account and app preferences" showBackButton className="bg-white" />

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-md sm:max-w-lg lg:max-w-xl sm:px-6 lg:px-8 py-6 space-y-8 px-0 bg-white">
        {/* 1. PROFILE ROW */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <motion.div initial={{
          opacity: 0,
          y: 8
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.2
        }} whileHover={!isMobile ? rowHover : {}} whileTap={{
          scale: 0.98
        }} className="flex items-center px-4 py-4 cursor-pointer" onClick={() => handleItemClick("/settings/profile")}>
            <div className="h-12 w-12 rounded-full bg-[#FFC0CB] dark:-[#FFC0CB] flex items-center justify-center text-[#FF007F]">
              <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {userName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Administrator
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </motion.div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Account Status
            </span>
            <div className="flex items-center space-x-2">
              <span className="block h-2 w-2 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* 2. SETTINGS GROUPS */}
        {settingsGroups.map((group, gi) => <div key={group.title} className="space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              {group.title}
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
              {group.items.map((item, idx) => {
            const isToggle = item.type === "toggle";
            const checked = isToggle ? item.stateKey === "pushNotifications" ? pushNotifications : darkMode : false;
            return <motion.div key={item.id} initial={{
              opacity: 0,
              y: 8
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.2,
              delay: 0.1 * (gi + idx)
            }} whileHover={!isMobile ? rowHover : {}} whileTap={{
              scale: 0.98
            }} className="flex items-center px-4 py-4 cursor-pointer" onClick={() => isToggle ? handleToggle(item.stateKey!, !checked) : item.route && handleItemClick(item.route)}>
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", item.color)}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    {isToggle ? <Switch checked={checked} onCheckedChange={v => handleToggle(item.stateKey!, v)} /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                  </motion.div>;
          })}
            </div>
          </div>)}

        {/* 3. SIGN OUT ROW */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <motion.button initial={{
          opacity: 0,
          y: 8
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.2,
          delay: 0.5
        }} whileHover={!isMobile ? rowHover : {}} whileTap={{
          scale: 0.98
        }} className="w-full flex items-center justify-center px-4 py-4 text-red-600 dark:text-red-400 cursor-pointer" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="ml-2 font-medium">Sign Out</span>
          </motion.button>
        </div>

        {/* 4. FOOTER */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.2,
        delay: 0.6
      }} className="text-center py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Molecules v2.1.0
          </p>
        </motion.div>
      </div>
    </div>;
}

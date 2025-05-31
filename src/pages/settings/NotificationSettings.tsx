
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Calendar, Award, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { toast } from "sonner";

export default function NotificationSettings() {
  const navigate = useNavigate();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [feeReminders, setFeeReminders] = useState(true);
  const [testNotifications, setTestNotifications] = useState(true);
  const [achievementUpdates, setAchievementUpdates] = useState(true);
  const [parentUpdates, setParentUpdates] = useState(false);

  const handleSaveSettings = () => {
    toast.success("Notification settings saved successfully!");
  };

  const notificationGroups = [{
    title: "General Notifications",
    icon: Bell,
    color: "bg-blue-500",
    items: [{
      title: "Push Notifications",
      description: "Receive notifications on your device",
      checked: pushNotifications,
      onChange: setPushNotifications
    }, {
      title: "Email Notifications",
      description: "Get updates via email",
      checked: emailNotifications,
      onChange: setEmailNotifications
    }, {
      title: "SMS Notifications",
      description: "Receive important updates via SMS",
      checked: smsNotifications,
      onChange: setSmsNotifications
    }]
  }, {
    title: "Academic Notifications",
    icon: Calendar,
    color: "bg-green-500",
    items: [{
      title: "Attendance Alerts",
      description: "Daily attendance notifications",
      checked: attendanceAlerts,
      onChange: setAttendanceAlerts
    }, {
      title: "Fee Reminders",
      description: "Payment due date reminders",
      checked: feeReminders,
      onChange: setFeeReminders
    }, {
      title: "Test Notifications",
      description: "Upcoming tests and results",
      checked: testNotifications,
      onChange: setTestNotifications
    }]
  }, {
    title: "Social & Updates",
    icon: Users,
    color: "bg-purple-500",
    items: [{
      title: "Achievement Updates",
      description: "Student achievements and milestones",
      checked: achievementUpdates,
      onChange: setAchievementUpdates
    }, {
      title: "Parent Updates",
      description: "Communication from parents",
      checked: parentUpdates,
      onChange: setParentUpdates
    }]
  }];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-8 px-0 py-0 bg-white">
        <EnhancedPageHeader 
          title="Notifications" 
          description="Manage your notification preferences" 
          showBackButton 
          onBack={() => navigate("/settings")} 
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {notificationGroups.map((group, groupIndex) => (
            <Card key={group.title} className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-10 h-10 ${group.color} rounded-xl flex items-center justify-center`}>
                    <group.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 font-geist">{group.title}</h3>
                  </div>
                </div>

                <div className="space-y-6">
                  {group.items.map((item, index) => (
                    <div key={item.title}>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                        <div>
                          <Label className="font-medium text-gray-900 dark:text-gray-100 text-base font-geist">{item.title}</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-geist">{item.description}</p>
                        </div>
                        <Switch checked={item.checked} onCheckedChange={item.onChange} />
                      </div>
                      {index < group.items.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Save Button */}
          <Button onClick={handleSaveSettings} className="w-full rounded-2xl h-12 text-base font-geist">
            Save Notification Settings
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

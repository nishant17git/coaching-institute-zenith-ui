import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Camera, ChevronRight, Save, Mail, Phone, Key, Smartphone, Bell, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional()
});
export default function ProfileSettings() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || ""
    }
  });
  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) toast.success("Profile photo updated!");
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-full mx-auto px-0 py-0 bg-white">
        {/* Header */}
        <EnhancedPageHeader title="Profile & Account" description="Manage your personal information" showBackButton onBack={() => navigate("/settings")} />

        <div className="space-y-4 mt-6">
          {/* Profile Card */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl font-bold bg-blue-500 text-white">
                  {user?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 hover:bg-blue-500 transition">
                <Camera className="h-4 w-4 text-white" />
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                {user?.name || "User Name"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-green-500 mt-1">Online</p>
            </div>
            <Button variant="outline" className="w-full py-2" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </motion.div>

          {/* Account Info */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1
        }} className="bg-white dark:bg-gray-800 rounded-2xl shadow">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-0">
                Account Information
              </h3>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                {[{
                name: "name",
                label: "Name",
                icon: User,
                type: "text"
              }, {
                name: "email",
                label: "Email",
                icon: Mail,
                type: "email"
              }, {
                name: "phone",
                label: "Phone",
                icon: Phone,
                type: "tel"
              }].map(({
                name,
                label,
                icon: Icon,
                type
              }) => <FormField key={name} control={form.control} name={name as any} render={({
                field
              }) => <FormItem>
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div className="flex-1">
                              <FormLabel className="text-sm text-gray-900 dark:text-white">
                                {label}
                              </FormLabel>
                              {isEditing ? <FormControl>
                                  <Input {...field} type={type} className="mt-1 w-full p-3 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-0" placeholder={label} />
                                </FormControl> : <p className="text-sm text-gray-600 dark:text-gray-300">{field.value || "Not set"}</p>}
                            </div>
                          </div>
                          {!isEditing && <ChevronRight className="h-5 w-5 text-gray-400" />}
                        </div>
                        <FormMessage className="px-4 text-xs text-red-500" />
                      </FormItem>} />)}
                {isEditing && <div className="px-4 py-3">
                    <Button type="submit" className="w-full py-3 flex items-center justify-center space-x-2">
                      <Save className="h-5 w-5" />
                      <span>Save Changes</span>
                    </Button>
                  </div>}
              </form>
            </Form>
          </motion.div>

          {/* Security & Privacy */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }} className="bg-white dark:bg-gray-800 rounded-2xl shadow">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-0">
                Security & Privacy
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* Change Password */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Key className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">Password</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Last changed 3 months ago</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{twoFactorEnabled ? "Enabled" : "Disabled"}</p>
                  </div>
                </div>
                <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
              </div>
              {/* Security Notifications */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">Security Notifications</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get alerts for suspicious activity</p>
                  </div>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
            </div>
          </motion.div>

          {/* Dangerous Zone */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }} className="bg-white dark:bg-gray-800 rounded-2xl shadow">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-red-500 dark:text-red-500 uppercase px-0">Account Actions</h3>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-600">Delete Account</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Permanently remove your account</p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="p-2">
                    <ChevronRight className="h-5 w-5 text-red-600" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl max-w-xs mx-auto">
                  <AlertDialogHeader>
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <AlertDialogTitle className="text-center text-base font-semibold">Delete Account?</AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-sm text-gray-600">
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex flex-col space-y-2">
                    <AlertDialogAction className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">
                      Yes, Delete
                    </AlertDialogAction>
                    <AlertDialogCancel className="w-full py-2 rounded-md">Cancel</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        </div>
      </div>
    </div>;
}
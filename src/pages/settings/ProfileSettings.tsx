import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Camera, Save, Eye, EyeOff, Shield, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: ""
    }
  });
  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    toast.success("Profile updated successfully!");
    console.log(values);
  };
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      toast.success("Profile photo updated!");
    }
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-8 px-0 bg-white py-0">
        <EnhancedPageHeader title="Profile & Account" description="Manage your personal information" showBackButton onBack={() => navigate("/settings")} />

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="space-y-8">
          {/* Profile Photo Section */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile Photo</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Update your profile picture</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative group">
                  <Avatar className="h-28 w-28 shadow-lg">
                    <AvatarFallback className="text-3xl font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {user?.name || "User Name"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{user?.email}</p>
                  <Button variant="outline" className="rounded-full px-6">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Personal Information</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Update your personal details</p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({
                    field
                  }) => <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" className="rounded-2xl border-gray-200 dark:border-gray-700 h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="email" render={({
                    field
                  }) => <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" className="rounded-2xl border-gray-200 dark:border-gray-700 h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <FormField control={form.control} name="phone" render={({
                    field
                  }) => <FormItem className="md:col-span-2">
                          <FormLabel className="text-gray-700 dark:text-gray-300">Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="Enter your phone number" className="rounded-2xl border-gray-200 dark:border-gray-700 h-12" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>

                  <Button type="submit" className="w-full rounded-2xl h-12 text-base">
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Security & Privacy</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your security settings</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Password Change */}
                <div className="space-y-4">
                  <Label className="text-gray-700 dark:text-gray-300 text-base font-medium">Change Password</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Current password" className="rounded-2xl border-gray-200 dark:border-gray-700 h-12 pr-12" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Input type={showPassword ? "text" : "password"} placeholder="New password" className="rounded-2xl border-gray-200 dark:border-gray-700 h-12" />
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl h-12">
                    Update Password
                  </Button>
                </div>

                <Separator />

                {/* Security Options */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Add extra security to your account</p>
                    </div>
                    <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Security Alerts</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of security events</p>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl border-l-4 border-l-red-500">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Irreversible actions</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full rounded-2xl h-12">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl">
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>;
}
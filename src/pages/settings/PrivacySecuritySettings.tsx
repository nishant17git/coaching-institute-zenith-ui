import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, EyeOff, Fingerprint, Key, AlertTriangle, Download, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { toast } from "sonner";
export default function PrivacySecuritySettings() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  const handleChangePassword = () => {
    toast.success("Password changed successfully!");
  };

  const handleEnable2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(twoFactorEnabled ? "Two-factor authentication disabled" : "Two-factor authentication enabled");
  };

  const handleDataExport = () => {
    toast.success("Data export started. You'll receive an email when ready.");
  };

  const handleDataDeletion = () => {
    toast.error("Data deletion request submitted. This action cannot be undone.");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-8 px-0 py-0 bg-white">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white backdrop-blur-sm">
          <div className="flex items-center max-w-4xl mx-auto px-0 py-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/settings")} 
              className="h-12 w-12 p-0 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-semibold text-gray-900 text-2xl">Privacy & Security</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account security and privacy settings</p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Password & Authentication */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Password & Authentication</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your login credentials</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Change Password</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Current password"
                        className="rounded-2xl h-12 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="New password"
                      className="rounded-2xl h-12"
                    />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      className="rounded-2xl h-12 md:col-span-2"
                    />
                  </div>
                  <Button onClick={handleChangePassword} variant="outline" className="w-full rounded-2xl h-12">
                    Update Password
                  </Button>
                </div>

                <Separator />

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <Fingerprint className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <Label className="font-medium text-gray-900 dark:text-gray-100 text-base">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Add extra security to your account</p>
                      </div>
                    </div>
                    <Switch checked={twoFactorEnabled} onCheckedChange={handleEnable2FA} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                    <div>
                      <Label className="font-medium text-gray-900 dark:text-gray-100 text-base">Biometric Authentication</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Use fingerprint or face unlock</p>
                    </div>
                    <Switch checked={biometricEnabled} onCheckedChange={setBiometricEnabled} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Controls */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Privacy Controls</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Control your data and privacy</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <div>
                    <Label className="font-medium text-gray-900 dark:text-gray-100 text-base">Data Sharing</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Share anonymous usage data to improve the app</p>
                  </div>
                  <Switch checked={dataSharing} onCheckedChange={setDataSharing} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <div>
                    <Label className="font-medium text-gray-900 dark:text-gray-100 text-base">Analytics</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Help improve the app with usage analytics</p>
                  </div>
                  <Switch checked={analyticsEnabled} onCheckedChange={setAnalyticsEnabled} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <div>
                    <Label className="font-medium text-gray-900 dark:text-gray-100 text-base">Auto Session Timeout</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Automatically log out after inactivity</p>
                  </div>
                  <Switch checked={sessionTimeout} onCheckedChange={setSessionTimeout} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <Key className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Data Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Export or delete your data</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <Label className="font-medium text-blue-900 dark:text-blue-100 text-base">Export Your Data</Label>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">Download a complete copy of all your data</p>
                  <Button onClick={handleDataExport} variant="outline" className="w-full rounded-2xl h-12 border-blue-200 text-blue-700 hover:bg-blue-100">
                    Request Data Export
                  </Button>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <Label className="font-medium text-red-900 dark:text-red-100 text-base">Delete Account</Label>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">Permanently delete your account and all data</p>
                  <Button onClick={handleDataDeletion} variant="destructive" className="w-full rounded-2xl h-12">
                    Delete My Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

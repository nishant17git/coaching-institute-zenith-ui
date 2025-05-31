import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Database, Download, Trash2, HardDrive, Cloud, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { toast } from "sonner";
export default function DataStorageSettings() {
  const navigate = useNavigate();
  const [autoBackup, setAutoBackup] = useState(true);
  const [cloudSync, setCloudSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const storageData = [{
    name: "Student Records",
    size: "45.2 MB",
    percentage: 65
  }, {
    name: "Attendance Data",
    size: "12.8 MB",
    percentage: 18
  }, {
    name: "Question Bank",
    size: "8.5 MB",
    percentage: 12
  }, {
    name: "Settings & Cache",
    size: "3.1 MB",
    percentage: 5
  }];
  const totalUsed = "69.6 MB";
  const totalAvailable = "500 MB";
  const handleClearCache = () => {
    toast.success("Cache cleared successfully!");
  };
  const handleExportData = () => {
    toast.success("Data export started. Download will begin shortly.");
  };
  const handleBackupNow = () => {
    toast.success("Backup completed successfully!");
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto space-y-6 px-0 py-0 bg-white">
        <EnhancedPageHeader title="Data & Storage" description="Manage your data and storage preferences" showBackButton onBack={() => navigate("/settings")} />

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="space-y-6">
          {/* Storage Usage */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <HardDrive className="h-4 w-4 text-white" />
                </div>
                Storage Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="text-2xl font-bold">{totalUsed}</div>
                <div className="text-sm text-muted-foreground">of {totalAvailable} used</div>
                <Progress value={14} className="mt-3" />
              </div>

              <div className="space-y-3">
                {storageData.map((item, index) => <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" style={{
                    backgroundColor: `hsl(${220 + index * 30}, 70%, 50%)`
                  }} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.size}</span>
                  </div>)}
              </div>
            </CardContent>
          </Card>

          {/* Backup & Sync */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Cloud className="h-4 w-4 text-white" />
                </div>
                Backup & Sync
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
                </div>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Cloud Sync</Label>
                  <p className="text-sm text-muted-foreground">Keep data synchronized across devices</p>
                </div>
                <Switch checked={cloudSync} onCheckedChange={setCloudSync} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Offline Mode</Label>
                  <p className="text-sm text-muted-foreground">Download data for offline access</p>
                </div>
                <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="font-medium">Manual Backup</Label>
                <p className="text-sm text-muted-foreground">Last backup: Today at 3:45 PM</p>
                <Button onClick={handleBackupNow} variant="outline" className="w-full rounded-xl">
                  <Cloud className="h-4 w-4 mr-2" />
                  Backup Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Database className="h-4 w-4 text-white" />
                </div>
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-medium">Export All Data</Label>
                <p className="text-sm text-muted-foreground">Download a complete backup of your data</p>
                <Button onClick={handleExportData} variant="outline" className="w-full rounded-xl">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="font-medium">Clear Cache</Label>
                <p className="text-sm text-muted-foreground">Free up space by clearing temporary files</p>
                <Button onClick={handleClearCache} variant="outline" className="w-full rounded-xl">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cache (3.1 MB)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Analytics */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-bold">1,247</div>
                  <div className="text-sm text-muted-foreground">Records Created</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-bold">89</div>
                  <div className="text-sm text-muted-foreground">Days Active</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-bold">452</div>
                  <div className="text-sm text-muted-foreground">Questions Generated</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-bold">23</div>
                  <div className="text-sm text-muted-foreground">Reports Created</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>;
}
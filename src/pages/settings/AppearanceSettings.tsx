import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Palette, Monitor, Moon, Sun, Type } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { toast } from "sonner";
export default function AppearanceSettings() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("system");
  const [accentColor, setAccentColor] = useState("blue");
  const [fontSize, setFontSize] = useState([16]);
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);
  const themes = [{
    id: "light",
    name: "Light",
    icon: Sun,
    description: "Light theme for better visibility"
  }, {
    id: "dark",
    name: "Dark",
    icon: Moon,
    description: "Dark theme for reduced eye strain"
  }, {
    id: "system",
    name: "System",
    icon: Monitor,
    description: "Follow your device settings"
  }];
  const colors = [{
    id: "blue",
    name: "Blue",
    color: "bg-blue-500"
  }, {
    id: "green",
    name: "Green",
    color: "bg-green-500"
  }, {
    id: "purple",
    name: "Purple",
    color: "bg-purple-500"
  }, {
    id: "red",
    name: "Red",
    color: "bg-red-500"
  }, {
    id: "orange",
    name: "Orange",
    color: "bg-orange-500"
  }, {
    id: "pink",
    name: "Pink",
    color: "bg-pink-500"
  }];
  const handleSaveSettings = () => {
    toast.success("Appearance settings saved successfully!");
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-8 px-0 py-0 bg-white">
        <EnhancedPageHeader title="Appearance" description="Customize the look and feel of your app" showBackButton onBack={() => navigate("/settings")} />

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="space-y-8">
          {/* Theme Selection */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Theme</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
                </div>
              </div>

              <RadioGroup value={theme} onValueChange={setTheme} className="space-y-4">
                {themes.map(themeOption => <div key={themeOption.id} className="flex items-center space-x-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <RadioGroupItem value={themeOption.id} id={themeOption.id} />
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                        <themeOption.icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <Label htmlFor={themeOption.id} className="font-medium cursor-pointer text-base">
                          {themeOption.name}
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{themeOption.description}</p>
                      </div>
                    </div>
                  </div>)}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Accent Color */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Accent Color</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred accent color</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {colors.map(color => <button key={color.id} onClick={() => setAccentColor(color.id)} className={`p-4 rounded-2xl border-2 transition-all ${accentColor === color.id ? "border-primary bg-primary/5 shadow-lg" : "border-gray-200 dark:border-gray-700 hover:border-primary/50"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full ${color.color} shadow-sm`} />
                      <span className="font-medium text-gray-900 dark:text-gray-100">{color.name}</span>
                    </div>
                  </button>)}
              </div>
            </CardContent>
          </Card>

          {/* Text Size */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Type className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Text Size</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Adjust the text size for better readability</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium">Font Size</Label>
                    <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      {fontSize[0]}px
                    </span>
                  </div>
                  <Slider value={fontSize} onValueChange={setFontSize} max={24} min={12} step={1} className="w-full" />
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <p style={{
                  fontSize: `${fontSize[0]}px`
                }} className="text-gray-900 dark:text-gray-100">
                    Sample text to preview font size changes. This helps you see how the text will appear throughout the app.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interface Options */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <Monitor className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Interface Options</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customize your interface preferences</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <div>
                    <Label className="font-medium text-gray-900 dark:text-gray-100 text-base">Compact Mode</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Reduce spacing and padding for more content</p>
                  </div>
                  <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <div>
                    <Label className="font-medium text-gray-900 dark:text-gray-100 text-base">Animations</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enable smooth transitions and effects</p>
                  </div>
                  <Switch checked={animations} onCheckedChange={setAnimations} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSaveSettings} className="w-full rounded-2xl h-12 text-base">
            Save Appearance Settings
          </Button>
        </motion.div>
      </div>
    </div>;
}
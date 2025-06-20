import { motion } from "framer-motion";
import { ChevronLeft, Smartphone, Building2, Heart, Users, Code, Monitor, Shield, Zap, Globe, Layers, Cpu, Info, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
export default function AboutSettings() {
  const currentYear = new Date().getFullYear();
  
  const features = [
    { name: "Student Management", icon: Users, color: "from-blue-500 to-cyan-500" },
    { name: "Attendance Tracking", icon: Monitor, color: "from-green-500 to-emerald-500" },
    { name: "Fee Management", icon: Shield, color: "from-purple-500 to-violet-500" },
    { name: "Question Bank", icon: Code, color: "from-orange-500 to-red-500" },
    { name: "Reports & Analytics", icon: Zap, color: "from-yellow-500 to-orange-500" },
    { name: "Mobile-First Design", icon: Smartphone, color: "from-pink-500 to-rose-500" }
  ];

  const systemInfo = [
    { label: "Platform", value: "Web Application", icon: Globe },
    { label: "Framework", value: "React 18.3.1", icon: Code },
    { label: "UI Library", value: "Shadcn/UI + Tailwind", icon: Layers },
    { label: "Database", value: "Supabase", icon: Shield },
    { label: "Build Date", value: new Date().toLocaleDateString(), icon: Info },
    { label: "Last Update", value: "December 8, 2025", icon: Sparkles }
  ];

  const teamMembers = [
    { name: "Aman Gupta", role: "Developer - Molecules Team" },
    { name: "Chandan Kumar Tiwary", role: "Developer - Molecules Team" },
    { name: "Amar Raj", role: "Developer - Molecules Team" }
  ];

  const namingArch = [
    {
      title: "Product Suite — Infinity",
      description: "The overarching ecosystem representing the strategic partnership between Molecules and Infinity Classes.",
      color: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
    },
    {
      title: "Subsystem — ATOM", 
      description: "Administrative Telemetry & Operations Management. The core engine for data-driven automation.",
      color: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20"
    },
    {
      title: "Series — U-235",
      description: "The model name representing a unified, stable release series with structured iteration tracking.",
      color: "from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20"
    },
    {
      title: "Version — Mark I",
      description: "The inaugural release version of this comprehensive management system.",
      color: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
    }
  ];

  const legalLinks = [
    { title: "Privacy Policy", url: "#" },
    { title: "Terms of Service", url: "#" },
    { title: "Cookie Policy", url: "#" },
    { title: "Data Protection", url: "#" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white backdrop-blur-sm">
        <div className="flex items-center max-w-4xl mx-auto px-0 py-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => history.back()} 
            className="h-12 w-12 p-0 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-gray-900 text-2xl">About Us</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 px-0 bg-white py-[32px]">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-0"
        >
          <h2 className="text-2xl md:text-3xl bg-gradient-to-r from-[#FF00AA] via-[#FF7722] to-[#FF007F] bg-clip-text text-transparent mb-2 font-bold infinity-title">
            Infinity ATOM U-235 I
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto text-sm">Administrative Telemetry & Operations Management</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
              Version Mark I
            </span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
              Build 2025.12.08
            </span>
          </div>
          <Button onClick={() => toast.success("You're using the latest version!")} className="bg-[#F1F4F9] hover:bg-[#A7393A] hover:text-[#F1F4F9] font-medium rounded-full text-[#A7393A]">
            Check Updates
          </Button>
        </motion.div>

        {/* Institute Info */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Infinity Classes</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Our Institution</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-xl p-4 mb-4">
              <blockquote className="text-center">
                <p className="italic font-medium text-emerald-700 dark:text-emerald-300">
                  "Learn till eternity, with dignity in Infinity."
                </p>
              </blockquote>
            </div>

            <div className="text-center">
              <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">
                Mr. Nishant Kumar Tiwary
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Director & Owner, Infinity Classes
              </p>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Mission Statement</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Providing quality education with innovative teaching methods, comprehensive student management solutions, and fostering academic excellence in every student.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Development Team</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Built with passion</p>
              </div>
            </div>

            <div className="text-center mb-4">
              <span className="inline-block px-3 py-1 bg-[#FF007F]/10 rounded-full text-xs font-semibold text-[#FF007F] mb-2">
                Powered by
              </span>
              <div className="text-xl font-bold text-[#FF007F] mb-1">Molecules</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">for Infinity Classes</div>
            </div>

            <div className="space-y-3">
              {teamMembers.map(member => (
                <div key={member.name} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="w-10 h-10 bg-[#FFC0CB] flex items-center justify-center text-[#B73E40] font-bold text-sm rounded-full">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-base">
                      {member.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Key Features</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comprehensive student management with modern technology
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {features.map(feature => (
                <div key={feature.name} className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r ${feature.color} rounded-xl mb-3`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">{feature.name}</h4>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-gray-600 to-slate-700 rounded-xl">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Information</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Technical specifications</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {systemInfo.map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {item.label}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Naming Architecture */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nomenclature</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Modular, scalable design</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {namingArch.map(item => (
                <div key={item.title} className={`p-4 rounded-xl bg-gradient-to-br ${item.color} border border-gray-200 dark:border-gray-700`}>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legal Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Legal & Privacy</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your privacy is our priority</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {legalLinks.map(link => (
                <button key={link.title} onClick={() => toast.info(`Opening ${link.title}...`)} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{link.title}</span>
                  <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6">
          <Separator className="max-w-xs mx-auto mb-4 opacity-30" />
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              © {currentYear} Molecules & Infinity Classes. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Infinity ATOM U-235 I — Where education meets innovation.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            <span>for the future of education</span>
          </div>
        </div>
      </div>
    </div>
  );
}

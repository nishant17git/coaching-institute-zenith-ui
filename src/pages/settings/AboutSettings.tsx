import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Info, Smartphone, Shield, Award, Heart, ExternalLink, Building2, Code, Monitor, Globe, Zap, Users, Github } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { toast } from "sonner";
export default function AboutSettings() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const appInfo = {
    name: "Infinity ATOM U-235 I",
    fullName: "Infinity ATOM U-235 Mark I",
    version: "Mark I",
    buildNumber: "2025.12.08",
    lastUpdate: "December 8, 2025"
  };
  const teamMembers = [{
    name: "Aman Gupta",
    role: "Developer - Molecules Team"
  }, {
    name: "Chandan Kumar Tiwari",
    role: "Developer - Molecules Team"
  }, {
    name: "Amar Raj",
    role: "Developer - Molecules Team"
  }];
  const legalLinks = [{
    title: "Privacy Policy",
    url: "#"
  }, {
    title: "Terms of Service",
    url: "#"
  }, {
    title: "Cookie Policy",
    url: "#"
  }, {
    title: "Data Protection",
    url: "#"
  }];
  const handleLinkClick = (title: string) => {
    toast.info(`Opening ${title}...`);
  };
  const handleCheckUpdates = () => {
    toast.success("You're using the latest version!");
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto space-y-6 px-0 py-0 bg-white">
        <EnhancedPageHeader title="About" description="App information and version details" showBackButton onBack={() => navigate("/settings")} />

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="space-y-6 font-ntype82">
          {/* App Information */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-geist">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-white" />
                </div>
                App Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-r from-[#F25239] via-[#FCAF40] to-[#4FD1C5] rounded-2xl text-white">
                <div className="text-2xl font-bold mb-2 font-geist">{appInfo.name}</div>
                <div className="text-sm opacity-90 font-geist-mono">Administrative Telemetry & Operations Management</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-center">
                  <div className="font-semibold font-geist-mono">{appInfo.version}</div>
                  <div className="text-sm text-muted-foreground font-ntype82">Version</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-center">
                  <div className="font-semibold font-geist-mono">{appInfo.buildNumber}</div>
                  <div className="text-sm text-muted-foreground font-ntype82">Build</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium font-geist">Last Update</div>
                    <div className="text-sm text-muted-foreground font-geist-mono">{appInfo.lastUpdate}</div>
                  </div>
                  <Button onClick={handleCheckUpdates} variant="outline" size="sm" className="rounded-lg font-geist">
                    Check for Updates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Institute Information */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-geist">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                Infinity Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-200/50">
                <div className="text-center">
                  <div className="font-semibold text-lg font-geist">About Our Institution</div>
                  <div className="text-sm text-muted-foreground mt-1 font-geist">Learn till eternity, with dignity in Infinity.</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-200/50">
                  <div className="font-medium font-geist mb-2">Leadership</div>
                  <p className="text-sm text-muted-foreground font-geist mb-3">
                    The Director and Owner of Infinity Classes is:
                  </p>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 font-geist">
                      Mr. Nishant Kumar Tiwary
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 font-geist">
                      Director & Owner, Infinity Classes
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="font-medium font-geist">Mission Statement</div>
                  <p className="text-sm text-muted-foreground mt-1 font-geist">
                    Providing quality education with innovative teaching methods, comprehensive student management solutions, and fostering academic excellence in every student.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developer Information */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-geist">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                Development Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-200/50">
                <div className="text-center">
                  <div className="font-semibold text-lg font-geist">Developed by Molecules</div>
                  <div className="text-sm text-muted-foreground mt-1 font-geist">for Infinity Classes</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {teamMembers.map((member, index) => <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div>
                      <div className="text-xl font-medium font-geist">{member.name}</div>
                      <div className="text-sm text-muted-foreground font-geist">{member.role}</div>
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>

          {/* Naming Scheme */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-geist">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Info className="h-4 w-4 text-white" />
                </div>
                Naming Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4 font-geist">
                Infinity ATOM U-235 I adopts a modular, scalable, and version-controlled naming architecture, reflecting the system's institutional-grade design and collaborative development origins.
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50">
                  <div className="font-semibold text-blue-900 font-ntype82">Product Suite Identifier – Infinity</div>
                  <div className="text-sm text-blue-700 mt-1 font-geist">
                    Represents the overarching ecosystem under which the application is developed. Infinity signifies the strategic partnership between Molecules and Infinity Classes.
                  </div>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200/50">
                  <div className="font-semibold text-purple-900 font-ntype82">Subsystem Codename – ATOM</div>
                  <div className="text-sm text-purple-700 mt-1 font-geist">
                    Administrative Telemetry & Operations Management. The core operational engine responsible for data-driven automation of key administrative functions.
                  </div>
                </div>

                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200/50">
                  <div className="font-semibold text-orange-900 font-ntype82">Series/Model Name – U-235</div>
                  <div className="text-sm text-orange-700mt-1 font-geist">
                    U-235 is the series or model name, representing a unified, stable release series with structured iteration tracking.
                  </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200/50">
                  <div className="font-semibold text-green-900 font-ntype82">Version – Mark I</div>
                  <div className="text-sm text-green-700 mt-1 font-geist">
                    Mark I is the version of this web application, denoting the inaugural release of this engine.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-geist">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Award className="h-4 w-4 text-white" />
                </div>
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {[{
                name: "Student Management System",
                icon: Users
              }, {
                name: "Attendance Tracking",
                icon: Monitor
              }, {
                name: "Fee Management",
                icon: Shield
              }, {
                name: "Question Bank & Testing",
                icon: Code
              }, {
                name: "Reports & Analytics",
                icon: Zap
              }, {
                name: "Mobile-First Design",
                icon: Smartphone
              }].map((feature, index) => <div key={index} className="flex items-center gap-3 p-2 font-giest">
                    <feature.icon className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-geist">{feature.name}</span>
                  </div>)}
              </div>
            </CardContent>
          </Card>

          {/* Legal & Privacy */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-geist">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                Legal & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {legalLinks.map((link, index) => <button key={index} onClick={() => handleLinkClick(link.title)} className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-medium font-geist">{link.title}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>)}
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-geist">
                <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                  <Info className="h-4 w-4 text-white" />
                </div>
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-geist">Platform</span>
                  <span className="font-geist-mono">Web Application</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground  font-geist">Framework</span>
                  <span className="font-geist-mono">React 18.3.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground  font-geist">UI Library</span>
                  <span className="font-geist-mono">Shadcn/UI + Tailwind CSS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-geist">Database</span>
                  <span className="font-geist-mono">Supabase</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-geist">Build Date</span>
                  <span className="font-geist-mono">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" size="sm" className=" font-geist">
                  <Monitor className="h-4 w-4 mr-2" />
                  System Status
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Copyright */}
          <div className="text-center py-4">
            <p className="text-muted-foreground text-xs font-geist">
              © {currentYear} Molecules & Infinity Classes. All rights reserved.
            </p>
            <p className="text-muted-foreground text-xs mt-1  font-geist">
              Infinity ATOM U-235 I — Developed by Molecules for Infinity Classes.
            </p>
            <p className="text-xs mt-2 flex items-center justify-center gap-1  font-geist">
              Built with <Heart className="h-3 w-3 text-red-500" /> for educational excellence
            </p>
          </div>
        </motion.div>
      </div>
    </div>;
}
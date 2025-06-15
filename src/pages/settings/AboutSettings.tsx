import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Info, Smartphone, Shield, Award, Heart, ExternalLink, Building2, Code, Monitor, Globe, Zap, Users, Github, Sparkles, Layers, Cpu, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import AboutHero from "./about/AboutHero";
import AboutInstituteCard from "./about/AboutInstituteCard";
import AboutTeamCard from "./about/AboutTeamCard";
import AboutFeaturesGrid from "./about/AboutFeaturesGrid";
import AboutSystemInfo from "./about/AboutSystemInfo";
import AboutNamingArchitecture from "./about/AboutNamingArchitecture";
import AboutLegal from "./about/AboutLegal";
import AboutFooter from "./about/AboutFooter";

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

  const teamMembers = [
    {
      name: "Aman Gupta",
      role: "Developer - Molecules Team"
    },
    {
      name: "Chandan Kumar Tiwary",
      role: "Developer - Molecules Team"
    },
    {
      name: "Amar Raj",
      role: "Developer - Molecules Team"
    }
  ];

  const legalLinks = [
    {
      title: "Privacy Policy",
      url: "#"
    },
    {
      title: "Terms of Service",
      url: "#"
    },
    {
      title: "Cookie Policy",
      url: "#"
    },
    {
      title: "Data Protection",
      url: "#"
    }
  ];

  const handleLinkClick = (title: string) => {
    toast.info(`Opening ${title}...`);
  };

  const handleCheckUpdates = () => {
    toast.success("You're using the latest version!");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 via-white to-gray-50/60 dark:from-gray-950 dark:via-gray-900/95 dark:to-gray-950">
      <div className="max-w-2xl md:max-w-5xl mx-auto px-3 sm:px-5 py-3 pb-8 md:pb-14">
        {/* Header/Title */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border-b border-gray-200/40 dark:border-gray-800/40 mb-2">
          <div className="flex items-center gap-3 py-3 sm:py-4">
            <button
              aria-label="Back"
              className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 transition"
              onClick={() => history.back()}
              type="button"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-600 dark:text-gray-200">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white leading-tight">About</h1>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">System information and credits</div>
            </div>
          </div>
        </header>
        
        {/* Main Content — Apple-Style Cards/Sectioning */}
        <AboutHero />
        <AboutInstituteCard />
        <AboutTeamCard />
        <AboutFeaturesGrid />
        <AboutSystemInfo />
        <AboutNamingArchitecture />
        <AboutLegal />
        <AboutFooter />
      </div>
    </div>
  );
}

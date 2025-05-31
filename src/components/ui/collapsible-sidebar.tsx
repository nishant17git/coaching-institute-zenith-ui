
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Home, 
  Users, 
  CreditCard, 
  CalendarDays, 
  BarChart2, 
  Settings, 
  LogOut, 
  FileText,
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  className?: string;
}

export function CollapsibleSidebar({ className }: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Main navigation items
  const mainNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Students", path: "/students", icon: Users },
    { name: "Fees", path: "/fees", icon: CreditCard },
  ];

  // More section items
  const moreNavItems = [
    { name: "Attendance", path: "/attendance", icon: CalendarDays },
    { name: "Tests", path: "/tests", icon: FileText },
    { name: "Questions", path: "/questions", icon: HelpCircle },
    { name: "Reports", path: "/reports", icon: BarChart2 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const renderNavItem = (item) => {
    const isActive = currentPath === item.path;
    
    return (
      <li key={item.name} className={cn(
        "w-full",
        isActive && "relative"
      )}>
        {isActive && (
          <motion.div 
            layoutId="active-nav-item"
            className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-md"
          />
        )}
        
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isCollapsed ? "justify-center" : "",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
              >
                <item.icon className={cn("w-5 h-5", isCollapsed ? "mx-auto" : "")} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                {item.name}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </li>
    );
  };

  return (
    <motion.aside 
      layout
      className={cn(
        "fixed left-0 top-0 bottom-0 bg-white/80 backdrop-blur-md border-r border-gray-200 flex flex-col p-3 z-50 shadow-sm",
        isCollapsed ? "w-[70px]" : "w-[250px]",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6 px-2 py-3">
        {!isCollapsed && (
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-lg font-semibold tracking-tight"
          >
            Infinity Classes
          </motion.h2>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn("ml-auto", isCollapsed && "mx-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <nav className="flex-1">
        <div className="mb-6">
          {!isCollapsed && (
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2"
            >
              Main
            </motion.h2>
          )}
          <ul className="space-y-1">
            {mainNavItems.map(renderNavItem)}
          </ul>
        </div>
        
        <Collapsible 
          defaultOpen 
          className={cn(
            isCollapsed ? "flex flex-col items-center" : ""
          )}
        >
          <CollapsibleTrigger asChild>
            {!isCollapsed ? (
              <Button variant="ghost" className="w-full justify-start px-4 mb-2">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">More</h2>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="mx-auto my-2">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">More</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            <ul className="space-y-1">
              {moreNavItems.map(renderNavItem)}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </nav>
      
      <div className="mt-auto pt-4 border-t border-gray-200">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "text-red-500 hover:text-red-600 hover:bg-red-50",
                  isCollapsed ? "w-auto px-2" : "w-full justify-start"
                )}
                onClick={logout}
              >
                <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                {!isCollapsed && <span>Logout</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                Logout
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.aside>
  );
}

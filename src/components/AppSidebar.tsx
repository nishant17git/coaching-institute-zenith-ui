
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Users, BadgeIndianRupee, CalendarDays, BarChart2, Settings, LogOut, FileText, BookOpenText, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainNavItems = [
  {
    name: "Home",
    path: "/dashboard",
    icon: Home
  },
  {
    name: "Students",
    path: "/students",
    icon: Users
  },
  {
    name: "Fees",
    path: "/fees",
    icon: BadgeIndianRupee
  },
  {
    name: "Attendance",
    path: "/attendance",
    icon: CalendarDays
  }
];

const moreNavItems = [
  {
    name: "Tests",
    path: "/tests",
    icon: FileText
  },
  {
    name: "Questions",
    path: "/questions",
    icon: BookOpenText
  },
  {
    name: "Reports",
    path: "/reports",
    icon: BarChart2
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings
  }
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout, user } = useAuth();
  const { state } = useSidebar();
  const [isMoreOpen, setIsMoreOpen] = useState(true);

  const renderNavItem = (item: typeof mainNavItems[0]) => {
    const isActive = currentPath === item.path || 
      (item.path === "/students" && currentPath.startsWith("/students")) ||
      (item.path === "/questions" && currentPath.startsWith("/questions")) ||
      (item.path === "/tests" && currentPath.startsWith("/tests")) ||
      (item.path === "/settings" && currentPath.startsWith("/settings")) ||
      (item.path === "/attendance" && currentPath.startsWith("/attendance"));

    return (
      <SidebarMenuItem key={item.name}>
        <SidebarMenuButton asChild isActive={isActive}>
          <Link 
            to={item.path} 
            className={cn(
              "flex items-center gap-3 font-medium transition-all duration-200 ease-in-out font-geist text-base relative",
              isActive && "bg-primary/10 text-primary font-semibold"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                initial={false}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30,
                  duration: 0.3
                }}
              />
            )}
            <item.icon className="h-5 w-5" />
            <span className="text-left font-geist text-base">{item.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className={cn(
          "flex items-center gap-2 px-2 py-2 transition-all duration-300 ease-in-out",
          state === "collapsed" ? "justify-center" : "justify-between"
        )}>
          <div className={cn(
            "flex items-center gap-2 min-w-0 flex-1 transition-all duration-300 ease-in-out",
            state === "collapsed" && "opacity-0 w-0"
          )}>
            {state === "expanded" && (
              <motion.div 
                className="flex flex-col min-w-0 text-base"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <span className="font-semibold truncate text-lg font-geist">Infinity Classes</span>
                <Badge variant="outline" className="text-xs w-fit font-geist">
                  ATOM U-235 I
                </Badge>
              </motion.div>
            )}
          </div>
          <motion.div
            className={cn(
              "transition-all duration-300 ease-in-out",
              state === "collapsed" ? "mx-auto" : "ml-auto"
            )}
            layout
          >
            <SidebarTrigger className={cn(
              "transition-all duration-300 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              state === "collapsed" && "mx-auto"
            )} />
          </motion.div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-geist">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-geist">Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={currentPath === "/more"}>
                  <Link 
                    to="/more" 
                    className="flex items-center gap-3 font-medium transition-all duration-300 ease-in-out font-geist text-base"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="text-left font-geist text-base">More</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md font-geist transition-all duration-200 ease-in-out">
                Advanced
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent className="transition-all duration-300 ease-in-out">
              <SidebarGroupContent>
                <SidebarMenu>
                  {moreNavItems.map(renderNavItem)}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout} 
              className="text-red-500 hover:text-red-600 hover:bg-red-50 font-geist transition-all duration-200 ease-in-out"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

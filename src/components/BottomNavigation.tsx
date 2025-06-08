import { Link, useLocation } from "react-router-dom";
import { Home, Users, BadgeIndianRupee, CalendarDays, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const navItems = [{
    name: "Home",
    path: "/dashboard",
    icon: Home
  }, {
    name: "Students",
    path: "/students",
    icon: Users
  }, {
    name: "Fees",
    path: "/fees",
    icon: BadgeIndianRupee
  }, {
    name: "Attendance",
    path: "/attendance",
    icon: CalendarDays
  }, {
    name: "More",
    path: "/more",
    icon: Menu
  }];
  return <div className="fixed bottom-0 left-0 right-0 flex justify-center px-4 pb-3 z-50 pointer-events-none">
      <motion.nav initial={{
      y: 20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      type: "spring",
      stiffness: 400,
      damping: 40
    }} className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-xl py-3 px-6 rounded-full w-full max-w-md pointer-events-auto">
        <div className="flex justify-between items-center">
          {navItems.map(item => {
          const isActive = item.path === "/more" ? ["/more", "/tests", "/reports", "/settings"].includes(currentPath) : currentPath.startsWith(item.path);
          return <Link key={item.name} to={item.path} className="relative flex flex-col items-center justify-center rounded-xl min-w-0 flex-1 h-14 py-0 px-[32px]">  
                {isActive && <motion.div layoutId="navIndicator" className="absolute inset-0 bg-[#FF00AA]/10 rounded-2xl border border-[#FF00AA]/20" transition={{
              type: "spring",
              stiffness: 600,
              damping: 35,
              mass: 0.6,
              duration: 0.5
            }} />}  
                <motion.div whileTap={{
              scale: 0.85,
              transition: {
                duration: 0.15,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }} className="flex flex-col items-center justify-center relative z-10 w-full h-full">  
                  <motion.div animate={{
                scale: isActive ? 1.15 : 1,
                y: isActive ? -3 : 0
              }} transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.5,
                duration: 0.4
              }} className={cn("transition-colors duration-400 ease-out mb-1", isActive ? "text-[#FF00AA]" : "text-gray-500")}>  
                    <item.icon className="w-5 h-5" />  
                  </motion.div>  
    
                  <motion.span animate={{
                opacity: isActive ? 1 : 0.8,
                scale: isActive ? 0.92 : 0.86,
                y: isActive ? 0 : 3
              }} transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.4,
                duration: 0.4
              }} className={cn("text-xs font-medium transition-colors duration-400 ease-out text-center leading-none", isActive ? "text-[#FF00AA] font-semibold" : "text-gray-500")}>  
                    {item.name}  
                  </motion.span>  
                </motion.div>  
              </Link>;
        })}  
        </div>  
      </motion.nav>  
    </div>;
}
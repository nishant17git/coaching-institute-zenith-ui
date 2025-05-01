import { Link, useLocation } from "react-router-dom";
import { Home, Users, CreditCard, MoreHorizontal, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: "Home", path: "/dashboard", icon: Home },
    { name: "Students", path: "/students", icon: Users },
    { name: "Fees", path: "/fees", icon: CreditCard },
    { name: "Attendance", path: "/attendance", icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ) },
    { name: "More", path: "/more", icon: MoreHorizontal },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center px-8 pb-8 z-50 pointer-events-none">
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-black/10 dark:bg-white/10 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-xl py-4 px-8 rounded-full w-full max-w-md pointer-events-auto"
      >
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive =
              item.path === "/more"
                ? ["/more", "/tests", "/reports", "/settings"].includes(currentPath)
                : currentPath.startsWith(item.path);

            return (  
              <Link   
                key={item.name}   
                to={item.path}   
                className="relative flex flex-col items-center justify-center px-3"  
              >  
                {isActive && (  
                  <motion.div  
                    layoutId="navIndicator"  
                    className="absolute top-0 left-0 right-0 mx-auto h-1 w-8 bg-blue-500 rounded-full"  
                    transition={{   
                      type: "spring",   
                      bounce: 0.2,   
                      duration: 0.6   
                    }}  
                  />  
                )}  
                <motion.div  
                  whileTap={{ scale: 0.9 }}  
                  className="flex flex-col items-center py-2"  
                >  
                  <motion.div  
                    animate={{   
                      scale: isActive ? 1 : 1,  
                      y: isActive ? 0 : 0  
                    }}  
                    transition={{ duration: 0.2 }}  
                    className={cn(  
                      "transition-all",  
                      isActive   
                        ? "text-blue-500"   
                        : "text-gray-500 dark:text-gray-400"  
                    )}  
                  >  
                    {typeof item.icon === 'function' ? <item.icon /> : <item.icon className="w-6 h-6" />}  
                  </motion.div>  
    
                  <motion.span   
                    className={cn(  
                      "text-xs font-medium mt-1 transition-all",  
                      isActive   
                        ? "text-blue-500"   
                        : "text-gray-500 dark:text-gray-400"  
                    )}  
                  >  
                    {item.name}  
                  </motion.span>  
                </motion.div>  
              </Link>  
            );  
          })}  
        </div>  
      </motion.nav>  
    </div>
  );
}
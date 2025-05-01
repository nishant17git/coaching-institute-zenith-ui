
import { Link, useLocation } from "react-router-dom";
import { Home, Users, CreditCard, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: "Home", path: "/dashboard", icon: Home },
    { name: "Students", path: "/students", icon: Users },
    { name: "Fees", path: "/fees", icon: CreditCard },
    { name: "More", path: "/more", icon: MoreHorizontal },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center px-4 pb-6 z-50 pointer-events-none">
      <motion.nav 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white/80 backdrop-blur-xl border border-gray-100 shadow-lg py-2 px-4 rounded-2xl w-full max-w-md pointer-events-auto"
      >
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = 
              item.path === "/more" 
                ? ["/more", "/tests", "/reports", "/settings", "/attendance"].includes(currentPath)
                : currentPath.startsWith(item.path);
            
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                className="relative flex flex-col items-center justify-center rounded-xl px-5 py-2"
              >
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute inset-0 bg-apple-blue/10 rounded-xl"
                    transition={{ 
                      type: "spring", 
                      bounce: 0.2, 
                      duration: 0.6 
                    }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{ 
                      scale: isActive ? 1.2 : 1,
                      y: isActive ? -2 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "transition-all",
                      isActive 
                        ? "text-apple-blue" 
                        : "text-gray-500"
                    )}
                  >
                    <item.icon className="w-6 h-6" />
                  </motion.div>
                  
                  <motion.span 
                    animate={{ 
                      opacity: isActive ? 0 : 1,
                      height: isActive ? 0 : 'auto',
                      marginTop: isActive ? 0 : 4
                    }}
                    className={cn(
                      "text-xs font-medium overflow-hidden transition-all",
                      isActive 
                        ? "text-apple-blue" 
                        : "text-gray-500"
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

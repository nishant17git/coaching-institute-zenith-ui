
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
    <motion.nav 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-lg py-2 px-4 z-50"
    >
      <div className="flex justify-between items-center mx-auto max-w-screen-lg">
        {navItems.map((item) => {
          const isActive = 
            item.path === "/more" 
              ? ["/more", "/tests", "/reports", "/settings", "/attendance"].includes(currentPath)
              : currentPath.startsWith(item.path);
          
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl px-5 py-2 transition-all duration-300",
                isActive ? "text-apple-blue" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute inset-0 bg-apple-blue/10 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn(
                "w-6 h-6 transition-all",
                isActive ? "text-apple-blue" : "text-gray-500"
              )} />
              <span className={cn(
                "text-xs mt-1 font-medium transition-all",
                isActive ? "text-apple-blue" : "text-gray-500"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}

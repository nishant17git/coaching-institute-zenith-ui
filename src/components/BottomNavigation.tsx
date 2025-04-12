
import { Link, useLocation } from "react-router-dom";
import { Home, Users, CreditCard, CalendarDays, BarChart2, Settings } from "lucide-react";

export function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: "Home", path: "/dashboard", icon: Home },
    { name: "Students", path: "/students", icon: Users },
    { name: "Fees", path: "/fees", icon: CreditCard },
    { name: "Attendance", path: "/attendance", icon: CalendarDays },
    { name: "Reports", path: "/reports", icon: BarChart2 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg py-2 px-4 z-50">
      <div className="flex justify-between items-center mx-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link key={item.name} to={item.path} className={`bottom-nav-item ${isActive ? "active" : ""}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

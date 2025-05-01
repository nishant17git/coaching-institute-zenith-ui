
import { Link, useLocation } from "react-router-dom";
import { Home, Users, CreditCard, CalendarDays, BarChart2, Settings, LogOut, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout } = useAuth();

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
    { name: "Reports", path: "/reports", icon: BarChart2 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const renderNavItem = (item) => {
    const isActive = currentPath === item.path;
    return (
      <li key={item.name}>
        <Link
          to={item.path}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-gray-100"
          }`}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.name}</span>
        </Link>
      </li>
    );
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-white/80 backdrop-blur-md border-r border-gray-200 flex flex-col p-6 z-50">
      <nav className="flex-1">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
            Main
          </h2>
          <ul className="space-y-1">
            {mainNavItems.map(renderNavItem)}
          </ul>
        </div>
        
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
            More
          </h2>
          <ul className="space-y-1">
            {moreNavItems.map(renderNavItem)}
          </ul>
        </div>
      </nav>
      
      <div className="mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

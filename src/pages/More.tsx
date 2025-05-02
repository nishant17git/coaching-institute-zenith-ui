import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, BarChart2, Settings, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function More() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const menuItems = [
    {
      title: "Attendance",
      description: "Track student attendance records",
      icon: <CalendarDays className="h-8 w-8 text-indigo-500" />,
      path: "/attendance",
      color: "bg-gradient-to-br from-indigo-50 to-violet-50"
    },
    {
      title: "Tests",
      description: "Manage test scores and exams",
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      path: "/tests",
      color: "bg-gradient-to-br from-blue-50 to-cyan-50"
    },
    {
      title: "Reports",
      description: "View performance analytics",
      icon: <BarChart2 className="h-8 w-8 text-green-500" />,
      path: "/reports",
      color: "bg-gradient-to-br from-green-50 to-emerald-50"
    },
    {
      title: "Settings",
      description: "Configure application settings",
      icon: <Settings className="h-8 w-8 text-gray-500" />,
      path: "/settings",
      color: "bg-gradient-to-br from-gray-50 to-slate-50"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <div className="flex flex-col text-center mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">More</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Access additional features and settings
          </p>
        </div>

        <motion.div 
          variants={container}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {menuItems.map((menuItem) => (
            <motion.div key={menuItem.title} variants={item}>
              <Link to={menuItem.path} className="block">
                <Card className={`hover:shadow-md transition-all duration-300 overflow-hidden ${menuItem.color} border border-gray-100 rounded-xl`}>
                  <div className="p-4 flex items-center gap-4">
                    <div className="rounded-xl bg-white p-2 shadow-sm">
                      {menuItem.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-base text-gray-900">{menuItem.title}</h3>
                      <p className="text-gray-500 text-xs">{menuItem.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center text-xs text-gray-400 pt-2">
          <p>Version 2.0</p>
        </div>
      </motion.div>
    </div>
  );
}
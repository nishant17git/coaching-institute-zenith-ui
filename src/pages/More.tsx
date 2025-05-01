
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
    show: { opacity: 1, y: 0 }
  };

  const menuItems = [
    {
      title: "Attendance",
      description: "Track student attendance records",
      icon: <CalendarDays className="h-8 w-8 text-apple-purple" />,
      path: "/attendance",
      color: "bg-gradient-to-br from-apple-purple/10 to-apple-indigo/5"
    },
    {
      title: "Tests",
      description: "Manage test scores and exams",
      icon: <FileText className="h-8 w-8 text-apple-blue" />,
      path: "/tests",
      color: "bg-gradient-to-br from-apple-blue/10 to-apple-teal/5"
    },
    {
      title: "Reports",
      description: "View performance analytics",
      icon: <BarChart2 className="h-8 w-8 text-apple-green" />,
      path: "/reports",
      color: "bg-gradient-to-br from-apple-green/10 to-apple-teal/5"
    },
    {
      title: "Settings",
      description: "Configure application settings",
      icon: <Settings className="h-8 w-8 text-apple-gray" />,
      path: "/settings",
      color: "bg-gradient-to-br from-apple-gray/10 to-apple-gray2/5"
    }
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold tracking-tight">More</h1>
        <p className="text-muted-foreground">
          Access additional features and settings
        </p>
      </div>

      <motion.div 
        variants={container}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {menuItems.map((item) => (
          <motion.div key={item.title} variants={item}>
            <Link to={item.path} className="block">
              <Card className={`hover-lift overflow-hidden ${item.color} border-none shadow-sm`}>
                <div className="p-6 flex items-center gap-4">
                  <div className="rounded-xl bg-white/80 p-3 shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="text-center text-xs text-muted-foreground pt-4">
        <p>Version 2.0</p>
      </div>
    </motion.div>
  );
}

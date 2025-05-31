import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FlaskConical, ChartSpline, Cog, CalendarDays, BookOpen, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
export default function More() {
  const menuItems = [{
    title: "Attendance",
    description: "Track and manage student attendance records",
    icon: <CalendarDays className="h-6 w-6" />,
    path: "/attendance",
    color: "bg-indigo-500"
  }, {
    title: "Tests",
    description: "View and manage test scores and examinations",
    icon: <FlaskConical className="h-6 w-6" />,
    path: "/tests",
    color: "bg-blue-500"
  }, {
    title: "Questions",
    description: "Access NCERT questions for Class 9-10 students",
    icon: <BookOpen className="h-6 w-6" />,
    path: "/questions",
    color: "bg-green-500"
  }, {
    title: "Reports",
    description: "Analyze student performance and generate insights",
    icon: <ChartSpline className="h-6 w-6" />,
    path: "/reports",
    color: "bg-orange-500"
  }, {
    title: "Settings",
    description: "Configure application preferences and account settings",
    icon: <Cog className="h-6 w-6" />,
    path: "/settings",
    color: "bg-gray-600"
  }];
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-8 py-0 px-0 bg-white">
        <EnhancedPageHeader title="More Features" />
        
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item, index) => <motion.div key={item.title} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: index * 0.1,
          ease: [0.22, 1, 0.36, 1]
        }}>
              <Link to={item.path} className="block group">
                <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                  <CardContent className="p-0">
                    <div className="p-8 py-[16px]">
                      <div className="flex items-center gap-6">
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg", item.color)}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs">
                            {item.description}
                          </p>
                        </div>
                        <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>)}
        </motion.div>

        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        duration: 0.5,
        delay: 0.5
      }} className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">Infinity ATOM U-235 I</p>
        </motion.div>
      </div>
    </div>;
}
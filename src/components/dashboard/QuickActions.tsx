
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  CreditCard, 
  ClipboardList, 
  BookOpen,
  Calendar,
  FileText
} from "lucide-react";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Add Student",
      description: "Register new student",
      icon: <UserPlus className="h-4 w-4" />,
      action: () => navigate('/students'),
      color: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b-4 border-green-500"
    },
    {
      title: "Record Payment",
      description: "Add fee payment",
      icon: <CreditCard className="h-4 w-4" />,
      action: () => navigate('/fees'),
      color: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-b-4 border-blue-500"
    },
    {
      title: "Mark Attendance",
      description: "Update attendance",
      icon: <ClipboardList className="h-4 w-4" />,
      action: () => navigate('/attendance'),
      color: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-b-4 border-purple-500"
    },
    {
      title: "Test Records",
      description: "Manage test scores",
      icon: <BookOpen className="h-4 w-4" />,
      action: () => navigate('/tests'),
      color: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-b-4 border-orange-500"
    },
    {
      title: "View Calendar",
      description: "Check schedule",
      icon: <Calendar className="h-4 w-4" />,
      action: () => navigate('/attendance'),
      color: "from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border-b-4 border-pink-500"
    },
    {
      title: "Generate Report",
      description: "Create reports",
      icon: <FileText className="h-4 w-4" />,
      action: () => navigate('/reports'),
      color: "from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border-b-4 border-indigo-500"
    }
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="font-geist">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Button
                variant="ghost"
                onClick={action.action}
                className={`h-auto p-4 flex flex-col items-center gap-2 w-full bg-gradient-to-br ${action.color} hover:shadow-md transition-all font-geist`}
              >
                {action.icon}
                <div className="text-center">
                  <div className="text-xs font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

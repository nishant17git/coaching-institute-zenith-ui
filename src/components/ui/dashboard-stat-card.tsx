
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface DashboardStatCardProps {
  type: "students" | "classes" | "fees" | "pending";
  count: number | string;
  percentage?: number;
  label: string;
  icon: ReactNode;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function DashboardStatCard({ type, count, percentage, label, icon, className, trend }: DashboardStatCardProps) {
  const getStyles = () => {
    switch (type) {
      case "students":
        return {
          gradient: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
          border: "border-blue-500",
          text: "text-blue-600 dark:text-blue-400"
        };
      case "classes":
        return {
          gradient: "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30",
          border: "border-purple-500",
          text: "text-purple-600 dark:text-purple-400"
        };
      case "fees":
        return {
          gradient: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
          border: "border-green-500",
          text: "text-green-600 dark:text-green-400"
        };
      case "pending":
        return {
          gradient: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
          border: "border-orange-500",
          text: "text-orange-600 dark:text-orange-400"
        };
    }
  };

  const styles = getStyles();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className={cn(
        styles.gradient, 
        "border-b-4",
        styles.border,
        "shadow-sm hover:shadow-md transition-all",
        className
      )}>
        <CardHeader className="pb-2">
          <CardTitle className={cn("flex items-center gap-2 text-sm font-medium font-geist", styles.text)}>
            {icon} {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-geist">{count}</div>
          <div className="flex items-center justify-between mt-2">
            {percentage !== undefined && (
              <div className="text-xs sm:text-sm text-muted-foreground font-geist">
                {percentage}% of total
              </div>
            )}
            {trend && (
              <div className={cn("flex items-center text-xs font-geist", trend.isPositive ? "text-green-600" : "text-red-600")}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

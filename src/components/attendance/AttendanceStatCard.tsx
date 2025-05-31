
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, X, Clock, Calendar } from "lucide-react";

interface AttendanceStatCardProps {
  type: "present" | "absent" | "leave" | "total";
  count: number;
  percentage?: number;
  label: string;
  className?: string;
}

export function AttendanceStatCard({ type, count, percentage, label, className }: AttendanceStatCardProps) {
  const getIcon = (): ReactNode => {
    switch (type) {
      case "present":
        return <Check className="h-4 w-4" />;
      case "absent":
        return <X className="h-4 w-4" />;
      case "leave":
        return <Clock className="h-4 w-4" />;
      case "total":
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "present":
        return {
          gradient: "bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30",
          border: "border-green-500",
          text: "text-green-600 dark:text-green-400"
        };
      case "absent":
        return {
          gradient: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30",
          border: "border-red-500",
          text: "text-red-600 dark:text-red-400"
        };
      case "leave":
        return {
          gradient: "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30",
          border: "border-amber-500",
          text: "text-amber-600 dark:text-amber-400"
        };
      case "total":
        return {
          gradient: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
          border: "border-blue-500",
          text: "text-blue-600 dark:text-blue-400"
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
        className
      )}>
        <CardHeader className="pb-2">
          <CardTitle className={cn("flex items-center gap-2 text-sm font-medium", styles.text)}>
            {getIcon()} {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{count}</div>
          {percentage !== undefined && (
            <div className="text-xs sm:text-sm text-muted-foreground">
              {percentage}% of total
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

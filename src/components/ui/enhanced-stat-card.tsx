import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradientClass?: string;
  iconColorClass?: string;
}
export function EnhancedStatCard({
  title,
  value,
  icon,
  description,
  className,
  trend,
  gradientClass = "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-4 border-blue-500",
  iconColorClass = "text-blue-600 dark:text-blue-400"
}: EnhancedStatCardProps) {
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }}>
      <Card className={cn("overflow-hidden shadow-sm hover:shadow-md transition-all bg-gradient-to-br", gradientClass, className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className={cn("h-8 w-8 rounded-full bg-secondary/80 flex items-center justify-center", iconColorClass)}>
                {icon}
              </div>
              <span className="text-base font-geist">{title}</span>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-[20px]">
          <div className="flex justify-between items-center mb-4 px-[10px]">
            <div className="text-2xl font-bold font-geist">
              {value}
            </div>
            {trend && <div className={cn("flex items-center text-xs", trend.isPositive ? "text-green-600" : "text-red-600")}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </div>}
          </div>
          
          {description && <div className="space-y-1 rounded-lg p-2.5 bg-secondary/20">
              <p className="text-xs text-muted-foreground font-medium font-geist px-0">{description}</p>
            </div>}
        </CardContent>
      </Card>
    </motion.div>;
}
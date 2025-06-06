import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}
export function StatCard({
  title,
  value,
  icon,
  description,
  className,
  trend
}: StatCardProps) {
  return <motion.div initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }}>
      <Card className={cn("overflow-hidden shadow-sm hover:shadow-md transition-all", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-muted-foreground text-base font-medium">
            {title}
          </CardTitle>
          <div className="p-2 text-primary rounded-full bg-transparent">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>}
          {trend && <div className={cn("flex items-center mt-2 text-xs", trend.isPositive ? "text-green-600" : "text-red-600")}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              <span className="ml-1 text-muted-foreground">from last month</span>
            </div>}
        </CardContent>
      </Card>
    </motion.div>;
}
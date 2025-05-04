
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function StatCard({ title, value, icon, description, className, trend }: StatCardProps) {
  return (
    <Card className={cn("glass-card overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 bg-primary/10 text-primary rounded-full">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className={cn(
            "flex items-center mt-2 text-xs",
            trend.isPositive ? "text-apple-green" : "text-apple-red"
          )}>
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            <span className="ml-1 text-muted-foreground">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

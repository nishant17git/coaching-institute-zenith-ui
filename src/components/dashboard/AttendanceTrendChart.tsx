import React from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
const chartData = [{
  month: "January",
  attendance: 86,
  target: 85
}, {
  month: "February",
  attendance: 88,
  target: 85
}, {
  month: "March",
  attendance: 82,
  target: 85
}, {
  month: "April",
  attendance: 91,
  target: 85
}, {
  month: "May",
  attendance: 87,
  target: 85
}, {
  month: "June",
  attendance: 93,
  target: 85
}];
const chartConfig = {
  attendance: {
    label: "Attendance",
    color: "#FF6B35" // Bright orange
  },
  target: {
    label: "Target",
    color: "#00D4AA" // Vibrant teal
  }
} satisfies ChartConfig;
export function AttendanceTrendChart() {
  return <Card>
      <CardHeader>
        <CardTitle className="font-geist text-xl">Attendance Trend</CardTitle>
        <CardDescription className="text-sm">
          Monthly attendance percentage over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={chartData} margin={{
          left: 12,
          right: 12
        }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={value => value.slice(0, 3)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#00D4AA" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area dataKey="target" type="natural" fill="url(#fillTarget)" fillOpacity={0.4} stroke="#00D4AA" stackId="a" />
            <Area dataKey="attendance" type="natural" fill="url(#fillAttendance)" fillOpacity={0.4} stroke="#FF6B35" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium font-geist">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none font-geist">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>;
}
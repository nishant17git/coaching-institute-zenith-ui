
"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface SubjectPerformanceData {
  name: string;
  score: number;
  fill: string;
}

interface SubjectPerformanceChartProps {
  data: SubjectPerformanceData[];
}

const chartConfig = {
  score: {
    label: "Average Score",
  },
} satisfies ChartConfig;

export function SubjectPerformanceChart({ data }: SubjectPerformanceChartProps) {
  const averageScore = data.length > 0 ? Math.round(data.reduce((acc, item) => acc + item.score, 0) / data.length) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Subject Performance</CardTitle>
        <CardDescription className="text-sm">Average scores by subject</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              tickMargin={10} 
              axisLine={false}
              fontSize={12}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false}
              fontSize={12}
              domain={[0, 100]}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Average performance: {averageScore}% <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing average scores across all subjects
        </div>
      </CardFooter>
    </Card>
  );
}

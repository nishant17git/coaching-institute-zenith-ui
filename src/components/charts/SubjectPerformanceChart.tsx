"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts";
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
    label: "Average Score"
  },
  Mathematics: {
    label: "Mathematics",
    color: "#0EA5E9"
  },
  Science: {
    label: "Science",
    color: "#8B5CF6"
  },
  English: {
    label: "English",
    color: "#F97316"
  },
  Hindi: {
    label: "Hindi",
    color: "#22C55E"
  },
  "Social Science": {
    label: "Social Science",
    color: "#F43F5E"
  }
} satisfies ChartConfig;
export function SubjectPerformanceChart({
  data
}: SubjectPerformanceChartProps) {
  const averageScore = data.length > 0 ? Math.round(data.reduce((acc, item) => acc + item.score, 0) / data.length) : 0;
  return <Card>
      <CardHeader>
        <CardTitle className="text-xl">Subject Performance</CardTitle>
        <CardDescription className="text-sm">Average scores by subject</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={value => chartConfig[value as keyof typeof chartConfig]?.label || value} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="score" strokeWidth={2} radius={8} activeIndex={0} activeBar={({
            ...props
          }) => {
            return <Rectangle {...props} fillOpacity={0.8} stroke={props.payload.fill} strokeDasharray={4} strokeDashoffset={4} />;
          }} />
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
    </Card>;
}
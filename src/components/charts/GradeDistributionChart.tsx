
"use client";

import { Pie, PieChart, Cell, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface GradeDistributionData {
  name: string;
  value: number;
  color: string;
}

interface GradeDistributionChartProps {
  data: GradeDistributionData[];
}

const chartConfig = {
  value: {
    label: "Students",
  },
} satisfies ChartConfig;

export function GradeDistributionChart({ data }: GradeDistributionChartProps) {
  const chartData = data.filter(item => item.value > 0);

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-xl">Grade Distribution</CardTitle>
        <CardDescription className="text-sm">Distribution of grades across all tests</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

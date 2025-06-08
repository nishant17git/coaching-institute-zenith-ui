"use client";

import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
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
    label: "Students"
  },
  A: {
    label: "A (90-100%)",
    color: "#22c55e"
  },
  B: {
    label: "B (75-89%)",
    color: "#0EA5E9"
  },
  C: {
    label: "C (60-74%)",
    color: "#EAB308"
  },
  D: {
    label: "D (40-59%)",
    color: "#F97316"
  },
  F: {
    label: "F (0-39%)",
    color: "#EF4444"
  }
} satisfies ChartConfig;
export function GradeDistributionChart({
  data
}: GradeDistributionChartProps) {
  const chartData = data.map((item, index) => ({
    grade: item.name.split(' ')[0],
    // Extract grade letter
    value: item.value,
    fill: item.color,
    name: item.name
  }));
  return <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-xl">Grade Distribution</CardTitle>
        <CardDescription className="text-sm">Distribution of grades across all tests</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <Pie data={chartData} dataKey="value" />
            <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>;
}
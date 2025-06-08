import React from "react";
import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
interface FeeStatusChartProps {
  data?: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
}
const defaultChartData = [{
  status: "paid",
  students: 275,
  fill: "#00D4AA"
},
// Vibrant teal
{
  status: "partial",
  students: 200,
  fill: "#FF6B35"
},
// Bright orange
{
  status: "pending",
  students: 187,
  fill: "#FF1744"
} // Bright red
];
const chartConfig = {
  students: {
    label: "Students"
  },
  paid: {
    label: "Paid",
    color: "#00D4AA"
  },
  partial: {
    label: "Partial",
    color: "#FF6B35"
  },
  pending: {
    label: "Pending",
    color: "#FF1744"
  }
} satisfies ChartConfig;
export function FeeStatusChart({
  data
}: FeeStatusChartProps) {
  const chartData = data || defaultChartData;
  return <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-geist text-xl">Fee Status Distribution</CardTitle>
        <CardDescription className="text-sm">Current academic year</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="students" nameKey="status" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium font-geist">
          Collection rate up by 8.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none font-geist">
          Showing fee status for all students
        </div>
      </CardFooter>
    </Card>;
}
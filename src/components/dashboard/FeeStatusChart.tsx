
import React from "react";
import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FeeStatusData {
  status: string;
  students: number;
  fill: string;
}

interface FeeStatusChartProps {
  data?: FeeStatusData[];
}

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

export function FeeStatusChart({ data }: FeeStatusChartProps) {
  const { data: feeStatusData = [], isLoading } = useQuery({
    queryKey: ['feeStatusDistribution'],
    queryFn: async () => {
      try {
        const { data: students, error } = await supabase
          .from('students')
          .select('fee_status, total_fees, paid_fees');
          
        if (error) {
          console.error('Error fetching students for fee status:', error);
          return [];
        }
        
        if (!students || students.length === 0) {
          return [];
        }
        
        // Calculate fee status distribution
        const statusCounts = {
          paid: 0,
          partial: 0,
          pending: 0
        };
        
        students.forEach(student => {
          const totalFees = student.total_fees || 0;
          const paidFees = student.paid_fees || 0;
          
          if (paidFees >= totalFees && totalFees > 0) {
            statusCounts.paid++;
          } else if (paidFees > 0) {
            statusCounts.partial++;
          } else {
            statusCounts.pending++;
          }
        });
        
        return [
          {
            status: "paid",
            students: statusCounts.paid,
            fill: "#00D4AA"
          },
          {
            status: "partial", 
            students: statusCounts.partial,
            fill: "#FF6B35"
          },
          {
            status: "pending",
            students: statusCounts.pending,
            fill: "#FF1744"
          }
        ].filter(item => item.students > 0); // Only show categories with data
      } catch (error) {
        console.error('Error in fee status query:', error);
        return [];
      }
    }
  });

  const chartData = data || feeStatusData;
  const totalStudents = chartData.reduce((sum, item) => sum + item.students, 0);
  const paidPercentage = totalStudents > 0 
    ? Math.round((chartData.find(item => item.status === 'paid')?.students || 0) / totalStudents * 100)
    : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="font-sf-pro text-xl">Fee Status Distribution</CardTitle>
        <CardDescription className="text-sm">Current academic year</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="font-sf-pro text-muted-foreground">Loading fee data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="font-sf-pro text-muted-foreground">No data available</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie data={chartData} dataKey="students" nameKey="status" />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium font-sf-pro">
          {chartData.length > 0 ? (
            <>
              Collection rate: {paidPercentage}% <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            'No collection data available'
          )}
        </div>
        <div className="text-muted-foreground leading-none font-sf-pro">
          {chartData.length > 0 ? 'Showing fee status for all students' : 'Add student fee data to see distribution'}
        </div>
      </CardFooter>
    </Card>
  );
}

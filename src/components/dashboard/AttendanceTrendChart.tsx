
import React from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

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
  const { data: attendanceData = [], isLoading } = useQuery({
    queryKey: ['attendanceTrend'],
    queryFn: async () => {
      try {
        // Get last 6 months
        const endDate = new Date();
        const startDate = subMonths(endDate, 5);
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        
        const monthlyData = await Promise.all(
          months.map(async (month) => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);
            
            // Get attendance records for this month
            const { data: attendanceRecords, error: attendanceError } = await supabase
              .from('attendance_records')
              .select('*')
              .gte('date', monthStart.toISOString().split('T')[0])
              .lte('date', monthEnd.toISOString().split('T')[0]);
              
            if (attendanceError) {
              console.error('Error fetching attendance:', attendanceError);
              return {
                month: format(month, 'MMMM'),
                attendance: 0,
                target: 85
              };
            }

            // Get total students count
            const { data: students, error: studentsError } = await supabase
              .from('students')
              .select('id');
              
            if (studentsError) {
              console.error('Error fetching students:', studentsError);
              return {
                month: format(month, 'MMMM'),
                attendance: 0,
                target: 85
              };
            }

            const totalStudents = students?.length || 0;
            const presentRecords = attendanceRecords?.filter(record => record.status === 'Present').length || 0;
            const totalRecords = attendanceRecords?.length || 0;
            
            // Calculate attendance percentage
            const attendancePercentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
            
            return {
              month: format(month, 'MMMM'),
              attendance: attendancePercentage,
              target: 85
            };
          })
        );
        
        return monthlyData;
      } catch (error) {
        console.error('Error in attendance trend query:', error);
        return [];
      }
    }
  });

  const chartData = attendanceData.length > 0 ? attendanceData : [];
  const latestTrend = chartData.length >= 2 
    ? chartData[chartData.length - 1].attendance - chartData[chartData.length - 2].attendance 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sf-pro text-xl">Attendance Trend</CardTitle>
        <CardDescription className="text-sm">
          Monthly attendance percentage over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[280px]">
            <p className="font-sf-pro text-muted-foreground">Loading attendance data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[280px]">
            <p className="font-sf-pro text-muted-foreground">No data available</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig}>
            <AreaChart accessibilityLayer data={chartData} margin={{
              left: 12,
              right: 12
            }}>
              <CartesianGrid vertical={false} />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8} 
                tickFormatter={value => value.slice(0, 3)} 
              />
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
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium font-sf-pro">
              {chartData.length > 0 ? (
                <>
                  {latestTrend >= 0 ? 'Trending up' : 'Trending down'} by {Math.abs(latestTrend)}% this month 
                  <TrendingUp className="h-4 w-4" />
                </>
              ) : (
                'No trend data available'
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none font-sf-pro">
              {chartData.length > 0 ? 'Last 6 months' : 'Insufficient data'}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

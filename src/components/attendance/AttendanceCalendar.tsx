
"use client"

import * as React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";

interface CalendarDataItem {
  date: Date;
  dayOfMonth: number;
  isToday: boolean;
  stats: {
    present: number;
    absent: number;
    leave: number;
  };
}

interface AttendanceCalendarProps {
  calendarData: CalendarDataItem[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function AttendanceCalendar({
  calendarData,
  selectedDate,
  onSelectDate,
  selectedMonth,
  onMonthChange,
}: AttendanceCalendarProps) {
  // Create a map for easy lookup of attendance data
  const attendanceMap = React.useMemo(() => {
    const map = new Map();
    calendarData.forEach((day) => {
      const dateKey = format(day.date, 'yyyy-MM-dd');
      const totalStudents = day.stats.present + day.stats.absent + day.stats.leave;
      const attendancePercentage = totalStudents > 0 
        ? Math.round((day.stats.present / totalStudents) * 100) 
        : 0;
      
      map.set(dateKey, {
        ...day.stats,
        percentage: attendancePercentage,
        hasData: totalStudents > 0
      });
    });
    return map;
  }, [calendarData]);

  // Function to get attendance status color
  const getAttendanceStatus = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const data = attendanceMap.get(dateKey);
    
    if (!data || !data.hasData) return null;
    
    if (data.percentage >= 90) return 'excellent';
    if (data.percentage >= 75) return 'good'; 
    if (data.percentage >= 50) return 'average';
    return 'poor';
  };

  return (
    <div className="space-y-4 p-1">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => onMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <motion.h3 
          className="text-base font-semibold"
          key={format(selectedMonth, 'MMMM yyyy')}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {format(selectedMonth, 'MMMM yyyy')}
        </motion.h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => onMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Enhanced Calendar with Variable Size */}
      <div className="w-full">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onSelectDate(date)}
          month={selectedMonth}
          onMonthChange={onMonthChange}
          className={cn(
            "rounded-lg border w-full",
            "[--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
          )}
          modifiers={{
            excellent: (date) => getAttendanceStatus(date) === 'excellent',
            good: (date) => getAttendanceStatus(date) === 'good',
            average: (date) => getAttendanceStatus(date) === 'average',
            poor: (date) => getAttendanceStatus(date) === 'poor',
            hasAttendance: (date) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const data = attendanceMap.get(dateKey);
              return data?.hasData || false;
            }
          }}
          modifiersClassNames={{
            excellent: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-semibold relative",
            good: "bg-blue-100 text-blue-800 hover:bg-blue-200 font-semibold relative", 
            average: "bg-amber-100 text-amber-800 hover:bg-amber-200 font-semibold relative",
            poor: "bg-red-100 text-red-800 hover:bg-red-200 font-semibold relative",
            hasAttendance: "relative"
          }}
          components={{
            Day: ({ date, ...props }) => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const data = attendanceMap.get(dateKey);
              const status = getAttendanceStatus(date);
              
              return (
                <div className="relative w-full h-full">
                  <button
                    {...props}
                    className={cn(
                      "w-full h-full relative flex flex-col items-center justify-center p-1 text-sm transition-all",
                      "hover:scale-105 focus:scale-105"
                    )}
                  >
                    <span className="relative z-10">{format(date, 'd')}</span>
                    
                    {/* Attendance Indicator */}
                    {data?.hasData && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          status === 'excellent' && "bg-emerald-600",
                          status === 'good' && "bg-blue-600", 
                          status === 'average' && "bg-amber-600",
                          status === 'poor' && "bg-red-600"
                        )} />
                      </div>
                    )}
                    
                    {/* Percentage Badge for Selected Date */}
                    {format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && data?.hasData && (
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {data.percentage}
                      </div>
                    )}
                  </button>
                </div>
              );
            }
          }}
        />
      </div>

      {/* Enhanced Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Attendance Levels</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded-full bg-emerald-600" />
              <span>Excellent (90%+)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded-full bg-blue-600" />
              <span>Good (75-89%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded-full bg-amber-600" />
              <span>Average (50-74%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded-full bg-red-600" />
              <span>Poor (&lt;50%)</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Selected Date</h4>
          <div className="text-sm">
            {(() => {
              const dateKey = format(selectedDate, 'yyyy-MM-dd');
              const data = attendanceMap.get(dateKey);
              if (data?.hasData) {
                return (
                  <div className="space-y-1">
                    <div className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</div>
                    <div className="text-xs text-muted-foreground">
                      Present: {data.present} | Absent: {data.absent} | Leave: {data.leave}
                    </div>
                    <div className="text-xs font-medium">
                      Attendance: {data.percentage}%
                    </div>
                  </div>
                );
              }
              return (
                <div>
                  <div className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</div>
                  <div className="text-xs text-muted-foreground">No attendance data</div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

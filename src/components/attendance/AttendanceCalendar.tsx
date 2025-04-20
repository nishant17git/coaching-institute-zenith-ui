
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isSelectedDay = (date: Date) => {
    return format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
  };

  return (
    <div className="space-y-4 p-1">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-base font-semibold">
          {format(selectedMonth, 'MMMM yyyy')}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-xs font-medium text-muted-foreground text-center py-2"
          >
            {day}
          </div>
        ))}

        {/* Empty cells for days before the first of the month */}
        {Array.from({ length: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() }).map(
          (_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          )
        )}

        {/* Calendar days */}
        {calendarData.map((day) => {
          const isSelected = isSelectedDay(day.date);
          const totalStudents = day.stats.present + day.stats.absent + day.stats.leave;
          const attendancePercentage =
            totalStudents > 0
              ? Math.round((day.stats.present / totalStudents) * 100)
              : 0;

          return (
            <Button
              key={day.dayOfMonth}
              variant="ghost"
              className={cn(
                "aspect-square p-0 relative",
                day.isToday && "ring-2 ring-apple-blue ring-offset-1",
                isSelected && "bg-apple-blue/10"
              )}
              onClick={() => onSelectDate(day.date)}
            >
              <div className="flex flex-col items-center w-full h-full">
                <span
                  className={cn(
                    "text-sm font-medium mt-1",
                    isSelected && "text-apple-blue",
                    day.isToday && !isSelected && "text-apple-blue font-semibold"
                  )}
                >
                  {day.dayOfMonth}
                </span>
                
                {/* Attendance indicator dot */}
                {totalStudents > 0 && (
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1",
                      attendancePercentage >= 90 ? "bg-green-500" :
                      attendancePercentage >= 75 ? "bg-apple-blue" :
                      attendancePercentage >= 50 ? "bg-amber-500" :
                      "bg-red-500"
                    )}
                  />
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 pt-4 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500 mt-1" />
            <span>&gt;90%</span>
          </div>
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-apple-blue mt-1" />
            <span>&gt;75%</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500 mt-1" />
            <span>&gt;50%</span>
          </div>
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500 mt-1" />
            <span>&lt;50%</span>
          </div>
        </div>
      </div>
    </div>
  );
}


import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
    <div className="space-y-4">
      {/* Calendar header - days of week */}
      <div className="grid grid-cols-7 text-center">
        {weekDays.map((day) => (
          <div key={day} className="text-sm text-muted-foreground py-2 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Offset for first day of month */}
        {Array.from({ length: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() }).map(
          (_, index) => (
            <div key={`empty-${index}`} className="aspect-square p-1" />
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
            <button
              key={day.dayOfMonth}
              className={cn(
                "aspect-square flex flex-col items-center p-1 rounded-lg transition-all",
                day.isToday && "border-2 border-apple-blue",
                isSelected
                  ? "bg-apple-blue bg-opacity-10"
                  : "hover:bg-apple-blue hover:bg-opacity-5"
              )}
              onClick={() => onSelectDate(day.date)}
            >
              <span
                className={cn(
                  "h-7 w-7 flex items-center justify-center rounded-full text-sm",
                  isSelected
                    ? "bg-apple-blue text-white"
                    : day.isToday
                    ? "font-bold"
                    : "text-foreground"
                )}
              >
                {day.dayOfMonth}
              </span>
              
              {/* Attendance indicators */}
              <div className="mt-1 w-full">
                <div className="flex justify-center mt-1 space-x-0.5">
                  <div 
                    className={cn(
                      "h-1 rounded-sm",
                      attendancePercentage >= 90 ? "bg-green-500" :
                      attendancePercentage >= 75 ? "bg-apple-blue" :
                      attendancePercentage >= 50 ? "bg-amber-500" :
                      "bg-red-500"
                    )}
                    style={{ width: `${Math.min(100, attendancePercentage)}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-4 text-xs text-muted-foreground pt-4">
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
          <span>&gt;90%</span>
        </div>
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-apple-blue mr-1"></div>
          <span>&gt;75%</span>
        </div>
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
          <span>&gt;50%</span>
        </div>
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
          <span>&lt;50%</span>
        </div>
      </div>
    </div>
  );
}

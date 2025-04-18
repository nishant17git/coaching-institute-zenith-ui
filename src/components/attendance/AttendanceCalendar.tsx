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
    <div className="space-y-6">
      {/* Calendar header - days of week */}
      <div className="grid grid-cols-7 text-center">
        {weekDays.map((day) => (
          <div key={day} className="text-[13px] text-muted-foreground font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {/* Offset for first day of month */}
        {Array.from({ length: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() }).map(
          (_, index) => (
            <div key={`empty-${index}`} className="aspect-square p-0.5 sm:p-1" />
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
                "aspect-square flex flex-col items-center p-0.5 sm:p-1 rounded-lg transition-all hover:bg-apple-blue/5",
                day.isToday && "ring-2 ring-apple-blue ring-offset-2",
                isSelected && "bg-apple-blue/10"
              )}
              onClick={() => onSelectDate(day.date)}
            >
              <span
                className={cn(
                  "h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center rounded-full text-sm transition-colors",
                  isSelected
                    ? "bg-apple-blue text-white shadow-sm"
                    : day.isToday
                    ? "font-semibold text-apple-blue"
                    : "text-foreground hover:text-apple-blue"
                )}
              >
                {day.dayOfMonth}
              </span>
              
              {/* Attendance indicator bar */}
              <div className="mt-auto w-full px-0.5">
                <div className="flex justify-center mt-1">
                  <div 
                    className={cn(
                      "h-0.5 rounded-full transition-all",
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

      {/* Legend with improved spacing */}
      <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
          <span>&gt;90%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-apple-blue"></div>
          <span>&gt;75%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
          <span>&gt;50%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
          <span>&lt;50%</span>
        </div>
      </div>
    </div>
  );
}

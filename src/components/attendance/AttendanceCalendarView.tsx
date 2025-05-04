
import { format, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check, X, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CalendarDataItem {
  date: Date;
  dayOfMonth: number;
  isToday: boolean;
  isSelected: boolean;
  stats: {
    present: number;
    absent: number;
    leave: number;
    percentage: number;
  };
}

interface AttendanceCalendarViewProps {
  calendarData: CalendarDataItem[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  isLoading: boolean;
}

export function AttendanceCalendarView({
  calendarData,
  selectedDate,
  onSelectDate,
  selectedMonth,
  onMonthChange,
  isLoading
}: AttendanceCalendarViewProps) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get first day of month to calculate empty cells
  const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Helper function to determine color based on attendance percentage
  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 75) return "bg-apple-blue";
    if (percentage >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => onMonthChange(subMonths(selectedMonth, 1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <AnimatePresence mode="wait">
          <motion.h3 
            key={format(selectedMonth, 'MMMM yyyy')}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-lg font-semibold"
          >
            {format(selectedMonth, 'MMMM yyyy')}
          </motion.h3>
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => onMonthChange(addMonths(selectedMonth, 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading attendance data...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Calendar Grid */}
          <div className="rounded-xl border overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 bg-gray-50">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-xs font-medium text-muted-foreground text-center py-3"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {/* Empty cells for days before the first of the month */}
              {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                <div key={`empty-start-${index}`} className="aspect-square border-t border-r" />
              ))}

              {/* Calendar days */}
              {calendarData.map((day) => {
                const hasSomeAttendance = day.stats.present + day.stats.absent + day.stats.leave > 0;
                
                return (
                  <TooltipProvider key={day.dayOfMonth}>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "aspect-square p-0 relative rounded-none border-t border-r hover:bg-gray-50",
                            day.isSelected && "bg-blue-50 hover:bg-blue-50",
                            day.isToday && "border-blue-400"
                          )}
                          onClick={() => onSelectDate(day.date)}
                        >
                          <div className="flex flex-col items-center w-full h-full px-1 py-2">
                            <span
                              className={cn(
                                "text-sm font-medium",
                                day.isSelected && "text-blue-600",
                                day.isToday && !day.isSelected && "text-blue-500"
                              )}
                            >
                              {day.dayOfMonth}
                            </span>
                            
                            {/* Attendance indicator */}
                            {hasSomeAttendance && (
                              <div className="mt-1 w-full px-2">
                                <div className="flex justify-center space-x-1">
                                  <div className={`h-1 rounded-full flex-1 ${getAttendanceColor(day.stats.percentage)}`}></div>
                                </div>
                                <div className="text-[10px] text-center mt-1 text-gray-500">
                                  {day.stats.percentage}%
                                </div>
                              </div>
                            )}
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="p-0 overflow-hidden">
                        <div className="p-2">
                          <p className="font-medium pb-1 border-b mb-2">
                            {format(day.date, 'MMMM d, yyyy')}
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs">Present:</span>
                              </div>
                              <span className="text-xs font-medium">{day.stats.present}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                                <span className="text-xs">Absent:</span>
                              </div>
                              <span className="text-xs font-medium">{day.stats.absent}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                                <span className="text-xs">Leave:</span>
                              </div>
                              <span className="text-xs font-medium">{day.stats.leave}</span>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
              
              {/* Empty cells after the end of the month if needed */}
              {(() => {
                const lastRow = Math.ceil((firstDayOfWeek + calendarData.length) / 7);
                const cellsInLastRow = (firstDayOfWeek + calendarData.length) % 7;
                const emptyCellsToAdd = cellsInLastRow === 0 ? 0 : 7 - cellsInLastRow;
                
                return Array.from({ length: emptyCellsToAdd }).map((_, index) => (
                  <div key={`empty-end-${index}`} className="aspect-square border-t border-r" />
                ));
              })()}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border p-4">
            <h4 className="text-sm font-medium mb-3">Attendance Legend</h4>
            <div className="grid grid-cols-2 gap-y-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-muted-foreground">Excellent (&gt;90%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-apple-blue"></div>
                <span className="text-xs text-muted-foreground">Good (&gt;75%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <span className="text-xs text-muted-foreground">Average (&gt;50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-muted-foreground">Poor (&lt;50%)</span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-1.5 ml-4">
                  <X className="h-4 w-4 text-red-500" />
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-1.5 ml-4">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>Leave</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import { format, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check, X, Clock, Loader2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  
  // Get first day of month to calculate empty cells
  const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Helper function to determine color based on attendance percentage
  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "bg-emerald-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  // Helper for attendance badge style
  const getAttendanceBadgeStyle = (percentage: number) => {
    if (percentage >= 90) return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
    if (percentage >= 75) return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    if (percentage >= 50) return "bg-amber-100 text-amber-700 hover:bg-amber-100";
    return "bg-red-100 text-red-700 hover:bg-red-100";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Month Navigation - Optimized for mobile */}
      <div className="flex items-center justify-between bg-white p-2 sm:p-3 rounded-lg shadow-sm border">
        <Button
          variant="outline"
          size={isMobile ? "sm" : "icon"}
          className={cn(
            "rounded-md border-gray-200",
            isMobile ? "h-8 w-8 p-0" : "h-9 w-9"
          )}
          onClick={() => onMonthChange(subMonths(selectedMonth, 1))}
        >
          <ChevronLeft className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
        </Button>
        <AnimatePresence mode="wait">
          <motion.div 
            key={format(selectedMonth, 'MMMM yyyy')}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-1 sm:gap-2"
          >
            <CalendarIcon className={cn("text-primary/70", isMobile ? "h-4 w-4" : "h-5 w-5")} />
            <h3 className={cn("font-semibold", isMobile ? "text-base" : "text-lg")}>
              {format(selectedMonth, isMobile ? 'MMM yyyy' : 'MMMM yyyy')}
            </h3>
          </motion.div>
        </AnimatePresence>
        <Button
          variant="outline"
          size={isMobile ? "sm" : "icon"}
          className={cn(
            "rounded-md border-gray-200",
            isMobile ? "h-8 w-8 p-0" : "h-9 w-9"
          )}
          onClick={() => onMonthChange(addMonths(selectedMonth, 1))}
        >
          <ChevronRight className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12 sm:py-16">
          <div className="flex flex-col items-center">
            <Loader2 className={cn("animate-spin text-primary mb-2", isMobile ? "h-6 w-6" : "h-8 w-8")} />
            <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
              Loading attendance data...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Calendar Grid - Responsive design */}
          <div className="rounded-lg sm:rounded-xl border overflow-hidden bg-white shadow-sm">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 bg-gray-50/80">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className={cn(
                    "text-center text-gray-600 font-medium",
                    isMobile ? "text-xs py-2" : "text-xs py-3"
                  )}
                >
                  {isMobile ? day.charAt(0) : day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {/* Empty cells for days before the first of the month */}
              {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                <div key={`empty-start-${index}`} className="border-t border-r border-gray-100" style={{ aspectRatio: '1' }} />
              ))}

              {/* Calendar days */}
              {calendarData.map((day) => {
                const hasSomeAttendance = day.stats.present + day.stats.absent + day.stats.leave > 0;
                
                return (
                  <TooltipProvider key={day.dayOfMonth} delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "relative rounded-none border-t border-r border-gray-100 hover:bg-gray-50 p-1",
                            day.isSelected && "bg-blue-50/70 hover:bg-blue-50/90",
                            day.isToday && "border-blue-300"
                          )}
                          style={{ aspectRatio: '1' }}
                          onClick={() => onSelectDate(day.date)}
                        >
                          <div className={cn(
                            "flex flex-col items-center w-full h-full justify-between",
                            day.isToday && "ring-1 ring-inset ring-blue-300",
                            isMobile ? "px-0.5 py-1" : "px-1 py-2"
                          )}>
                            <span
                              className={cn(
                                "font-medium rounded-full flex items-center justify-center",
                                isMobile ? "text-xs w-5 h-5" : "text-sm w-7 h-7",
                                day.isSelected && "bg-blue-500 text-white",
                                day.isToday && !day.isSelected && "text-blue-600 font-semibold"
                              )}
                            >
                              {day.dayOfMonth}
                            </span>
                            
                            {/* Attendance indicator - Simplified for mobile */}
                            {hasSomeAttendance && (
                              <div className={cn("w-full", isMobile ? "px-0.5" : "px-1.5")}>
                                <div className="flex justify-center">
                                  {/* Attendance bar with gradient background */}
                                  <div className={cn(
                                    "relative bg-gray-100 rounded-full overflow-hidden w-full",
                                    isMobile ? "h-1" : "h-1.5"
                                  )}>
                                    <div 
                                      className={`absolute left-0 top-0 h-full ${getAttendanceColor(day.stats.percentage)}`} 
                                      style={{ width: `${day.stats.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className={cn(
                                  "text-center text-gray-500 font-medium mt-0.5",
                                  isMobile ? "text-[8px]" : "text-[9px]"
                                )}>
                                  {day.stats.percentage}%
                                </div>
                              </div>
                            )}
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="bottom" 
                        align="center" 
                        className="p-0 overflow-hidden rounded-lg border border-gray-200 shadow-md z-50"
                      >
                        <div className={cn("bg-white p-3", isMobile ? "min-w-[160px]" : "min-w-[180px]")}>
                          <p className={cn("font-medium pb-2 border-b mb-2", isMobile ? "text-xs" : "text-sm")}>
                            {format(day.date, isMobile ? 'MMM d, yyyy' : 'MMMM d, yyyy')}
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-1.5">
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-xs">Present:</span>
                              </div>
                              <span className="text-xs font-medium">{day.stats.present}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-1.5">
                                <X className="h-3 w-3 text-red-500" />
                                <span className="text-xs">Absent:</span>
                              </div>
                              <span className="text-xs font-medium">{day.stats.absent}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3 text-amber-500" />
                                <span className="text-xs">Leave:</span>
                              </div>
                              <span className="text-xs font-medium">{day.stats.leave}</span>
                            </div>
                            <div className="mt-2 pt-2 border-t">
                              <div className="flex items-center justify-between">
                                <span className="text-xs">Attendance:</span>
                                <Badge className={cn(
                                  "px-1.5 py-0.5 text-[10px]",
                                  getAttendanceBadgeStyle(day.stats.percentage)
                                )}>
                                  {day.stats.percentage}%
                                </Badge>
                              </div>
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
                  <div key={`empty-end-${index}`} className="border-t border-r border-gray-100" style={{ aspectRatio: '1' }} />
                ));
              })()}
            </div>
          </div>

          {/* Attendance Status Guide - Responsive layout */}
          <Card className="bg-white p-3 sm:p-4 border border-gray-200 shadow-sm rounded-lg sm:rounded-xl">
            <h4 className={cn("font-semibold mb-3 flex items-center gap-1.5", isMobile ? "text-sm" : "text-sm")}>
              <CalendarIcon className="h-4 w-4 text-primary/70" />
              Attendance Status Guide
            </h4>
            <div className={cn("grid gap-2 sm:gap-3", isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
              <div className="flex items-center gap-2 sm:gap-3 p-2 border border-gray-100 rounded-lg bg-gray-50/50">
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-sm bg-emerald-500"></div>
                <span className={cn(isMobile ? "text-xs" : "text-sm")}>Excellent (90%+)</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 border border-gray-100 rounded-lg bg-gray-50/50">
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-sm bg-blue-500"></div>
                <span className={cn(isMobile ? "text-xs" : "text-sm")}>Good (75-89%)</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 border border-gray-100 rounded-lg bg-gray-50/50">
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-sm bg-amber-500"></div>
                <span className={cn(isMobile ? "text-xs" : "text-sm")}>Average (50-74%)</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 border border-gray-100 rounded-lg bg-gray-50/50">
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-sm bg-red-500"></div>
                <span className={cn(isMobile ? "text-xs" : "text-sm")}>Poor (Below 50%)</span>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4 pt-3 border-t flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1.5">
                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                <span className={cn(isMobile ? "text-xs" : "text-sm")}>Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <X className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                <span className={cn(isMobile ? "text-xs" : "text-sm")}>Absent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
                <span className={cn(isMobile ? "text-xs" : "text-sm")}>Leave</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

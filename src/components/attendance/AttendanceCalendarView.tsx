import { format, addMonths, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check, X, Clock, Loader2, CalendarIcon, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  onExportPDF?: (date: Date, stats: {
    present: number;
    absent: number;
    leave: number;
    total: number;
  }) => void;
}

export function AttendanceCalendarView({
  calendarData,
  selectedDate,
  onSelectDate,
  selectedMonth,
  onMonthChange,
  isLoading,
  onExportPDF
}: AttendanceCalendarViewProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Helper function to determine background color based on attendance percentage
  const getAttendanceBackgroundColor = (percentage: number) => {
    if (percentage >= 90) return "bg-emerald-100 border-emerald-200";
    if (percentage >= 75) return "bg-blue-100 border-blue-200";
    if (percentage >= 50) return "bg-amber-100 border-amber-200";
    return "bg-red-100 border-red-200";
  };

  // Helper function to determine text color based on attendance percentage
  const getAttendanceTextColor = (percentage: number) => {
    if (percentage >= 90) return "text-emerald-700";
    if (percentage >= 75) return "text-blue-700";
    if (percentage >= 50) return "text-amber-700";
    return "text-red-700";
  };

  // Helper for attendance badge style
  const getAttendanceBadgeStyle = (percentage: number) => {
    if (percentage >= 90) return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200";
    if (percentage >= 75) return "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200";
    if (percentage >= 50) return "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200";
    return "bg-red-100 text-red-700 hover:bg-red-100 border-red-200";
  };

  // Get selected date data
  const selectedDateData = calendarData.find(item => item.date.getDate() === selectedDate.getDate() && item.date.getMonth() === selectedDate.getMonth() && item.date.getFullYear() === selectedDate.getFullYear());

  // Custom day renderer for attendance data
  const renderDay = (day: Date) => {
    const dayData = calendarData.find(item => item.date.getDate() === day.getDate() && item.date.getMonth() === day.getMonth() && item.date.getFullYear() === day.getFullYear());
    if (!dayData) return null;
    const hasSomeAttendance = dayData.stats.present + dayData.stats.absent + dayData.stats.leave > 0;
    const isSelected = dayData.isSelected;
    const isToday = dayData.isToday;
    return <TooltipProvider key={`${day.getTime()}`} delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("relative w-full h-full flex flex-col items-center justify-center group rounded-lg border-2 transition-all duration-200",
          // Base styling
          "hover:shadow-sm",
          // Selected state
          isSelected && "border-primary bg-primary text-primary-foreground shadow-md",
          // Today state (when not selected)
          isToday && !isSelected && "border-primary/40 bg-primary/5 font-bold",
          // Attendance-based coloring (when not selected and not today)
          !isSelected && !isToday && hasSomeAttendance && getAttendanceBackgroundColor(dayData.stats.percentage), !isSelected && !isToday && hasSomeAttendance && "border-2",
          // Default state
          !isSelected && !isToday && !hasSomeAttendance && "border-gray-100 hover:border-gray-200 hover:bg-gray-50")}>
              <span className={cn("text-sm font-medium transition-colors duration-200",
            // Selected text color
            isSelected && "text-primary-foreground",
            // Today text color (when not selected)
            isToday && !isSelected && "text-primary font-bold",
            // Attendance-based text color
            !isSelected && !isToday && hasSomeAttendance && getAttendanceTextColor(dayData.stats.percentage),
            // Default text color
            !isSelected && !isToday && !hasSomeAttendance && "text-gray-700")}>
                {day.getDate()}
              </span>
              
              {/* Small percentage indicator */}
              {hasSomeAttendance && !isSelected}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center" className="p-0 overflow-hidden rounded-xl border border-gray-200 shadow-lg z-50 bg-white">
            <div className={cn("p-4", isMobile ? "min-w-[180px]" : "min-w-[220px]")}>
              <div className="flex items-center gap-2 pb-3 border-b mb-3">
                <CalendarIcon className="h-4 w-4 text-primary/70" />
                <p className={cn("font-semibold text-gray-900", isMobile ? "text-sm" : "text-base")}>
                  {format(day, isMobile ? 'MMM d, yyyy' : 'MMMM d, yyyy')}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-gray-700">Present:</span>
                  </div>
                  <span className="text-sm font-semibold">{dayData.stats.present}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <X className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-sm text-gray-700">Absent:</span>
                  </div>
                  <span className="text-sm font-semibold">{dayData.stats.absent}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-sm text-gray-700">Leave:</span>
                  </div>
                  <span className="text-sm font-semibold">{dayData.stats.leave}</span>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Attendance Rate:</span>
                    <Badge className={cn("px-2 py-1 text-xs font-medium", getAttendanceBadgeStyle(dayData.stats.percentage))}>
                      {dayData.stats.percentage}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>;
  };

  // Handle PDF export
  const handleExportPDF = () => {
    if (selectedDateData && onExportPDF) {
      const totalStudents = selectedDateData.stats.present + selectedDateData.stats.absent + selectedDateData.stats.leave;
      onExportPDF(selectedDate, {
        present: selectedDateData.stats.present,
        absent: selectedDateData.stats.absent,
        leave: selectedDateData.stats.leave,
        total: totalStudents
      });
    }
  };

  // Check if date is holiday (no attendance data at all)
  const isHoliday = selectedDateData ? (selectedDateData.stats.present + selectedDateData.stats.absent + selectedDateData.stats.leave === 0) : false;
  const hasAttendanceData = selectedDateData && (selectedDateData.stats.present + selectedDateData.stats.absent + selectedDateData.stats.leave > 0);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center">
            <Loader2 className={cn("animate-spin text-primary mb-3", isMobile ? "h-8 w-8" : "h-10 w-10")} />
            <p className={cn("text-muted-foreground font-medium", isMobile ? "text-sm" : "text-base")}>
              Loading attendance data...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Modern Calendar Component */}
          <Card className="overflow-hidden rounded-2xl border shadow-sm bg-white">
            <div className="p-4 sm:p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={date => date && onSelectDate(date)}
                month={selectedMonth}
                onMonthChange={onMonthChange}
                className={cn(
                  "rounded-xl border-0 w-full pointer-events-auto",
                  "[--cell-size:--spacing(12)] md:[--cell-size:--spacing(14)]"
                )}
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                  month: "space-y-4 w-full",
                  caption: "flex justify-center pt-1 relative items-center mb-4",
                  caption_label: "text-lg font-bold text-gray-900",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex w-full",
                  head_cell: "text-muted-foreground rounded-lg flex-1 font-semibold text-sm py-2",
                  row: "flex w-full mt-1",
                  cell: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1"
                  ),
                  day: cn(
                    "h-12 w-full p-0 font-normal aria-selected:opacity-100 rounded-lg transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20"
                  ),
                  day_selected: "",
                  day_today: "",
                  day_outside: "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                  day_disabled: "text-muted-foreground opacity-30",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible"
                }}
                components={{
                  DayContent: ({ date }) => renderDay(date) || <span className="font-medium">{date.getDate()}</span>
                }}
              />
            </div>
          </Card>

          {/* Date Summary Section - Repositioned below calendar */}
          {selectedDateData && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm rounded-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </h3>
                        <p className="text-sm text-gray-600">Attendance Summary</p>
                      </div>
                    </div>
                    {hasAttendanceData && onExportPDF && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportPDF}
                        className="bg-white/80 hover:bg-white border-blue-200 text-blue-700 hover:text-blue-800 gap-2"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {isHoliday ? (
                    <div className="text-center py-8">
                      <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                        <CalendarIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-1">Holiday</p>
                      <p className="text-sm text-gray-600">No attendance recorded for this date</p>
                    </div>
                  ) : !hasAttendanceData ? (
                    <div className="text-center py-8">
                      <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                        <CalendarIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-1">No data available</p>
                      <p className="text-sm text-gray-600">No attendance data found for this date</p>
                    </div>
                  ) : (
                    <div className={cn("grid gap-4", isMobile ? "grid-cols-2" : "grid-cols-4")}>
                      <div className="bg-white/60 rounded-xl p-4 border border-white/40">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <CalendarIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {selectedDateData.stats.present + selectedDateData.stats.absent + selectedDateData.stats.leave}
                            </p>
                            <p className="text-sm text-gray-600">Total Students</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/60 rounded-xl p-4 border border-white/40">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Check className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-emerald-700">{selectedDateData.stats.present}</p>
                            <p className="text-sm text-gray-600">Present</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/60 rounded-xl p-4 border border-white/40">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <X className="h-4 w-4 text-red-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-red-700">{selectedDateData.stats.absent}</p>
                            <p className="text-sm text-gray-600">Absent</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/60 rounded-xl p-4 border border-white/40">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <Clock className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-amber-700">{selectedDateData.stats.leave}</p>
                            <p className="text-sm text-gray-600">On Leave</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Enhanced Attendance Status Guide */}
          <Card className="bg-gradient-to-br from-gray-50 to-white border shadow-sm rounded-2xl">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-bold text-gray-900 text-base">Attendance Guide</h4>
              </div>
              
              <div className="grid gap-4 sm:gap-6">
                {/* Attendance Rate Categories */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Color indicators show attendance rates:</p>
                  <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4")}>
                    <div className="flex items-center gap-3 p-3 border-2 border-emerald-200 rounded-xl bg-emerald-50/80 hover:bg-emerald-50 transition-colors duration-200">
                      <div className="h-5 w-5 rounded bg-emerald-500 shadow-sm"></div>
                      <div>
                        <span className="font-semibold text-emerald-800 text-sm">Excellent</span>
                        <p className="text-xs text-emerald-700">90%+ attendance</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border-2 border-blue-200 rounded-xl bg-blue-50/80 hover:bg-blue-50 transition-colors duration-200">
                      <div className="h-5 w-5 rounded bg-blue-500 shadow-sm"></div>
                      <div>
                        <span className="font-semibold text-blue-800 text-sm">Good</span>
                        <p className="text-xs text-blue-700">75-89% attendance</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border-2 border-amber-200 rounded-xl bg-amber-50/80 hover:bg-amber-50 transition-colors duration-200">
                      <div className="h-5 w-5 rounded bg-amber-500 shadow-sm"></div>
                      <div>
                        <span className="font-semibold text-amber-800 text-sm">Average</span>
                        <p className="text-xs text-amber-700">50-74% attendance</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border-2 border-red-200 rounded-xl bg-red-50/80 hover:bg-red-50 transition-colors duration-200">
                      <div className="h-5 w-5 rounded bg-red-500 shadow-sm"></div>
                      <div>
                        <span className="font-semibold text-red-800 text-sm">Poor</span>
                        <p className="text-xs text-red-700">Below 50% attendance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AttendanceHistoryTable } from "./AttendanceHistoryTable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
interface AttendanceHistoryCardProps {
  attendanceHistory: any[];
}
export function AttendanceHistoryCard({
  attendanceHistory
}: AttendanceHistoryCardProps) {
  const [attendanceView, setAttendanceView] = useState<"list" | "calendar">("list");
  const [expanded, setExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Get the first 3 months of data for the initial view
  const initialMonths = 3;
  const displayRecords = expanded ? attendanceHistory : attendanceHistory.slice(0, Math.min(attendanceHistory.length, 30));

  // Prepare attendance data for calendar display
  const attendanceDates = attendanceHistory.reduce((acc: Record<string, string>, record) => {
    acc[record.date] = record.status;
    return acc;
  }, {});

  // Function to render calendar with attendance data
  const renderAttendanceCalendar = () => {
    // Get selected month's attendance records
    const monthStart = selectedDate ? startOfMonth(selectedDate) : startOfMonth(new Date());
    const monthEnd = selectedDate ? endOfMonth(selectedDate) : endOfMonth(new Date());
    return <div className="flex flex-col items-center space-y-4">
        <CalendarComponent mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border shadow" modifiers={{
        present: date => {
          const dateString = format(date, 'yyyy-MM-dd');
          return attendanceDates[dateString] === 'Present';
        },
        absent: date => {
          const dateString = format(date, 'yyyy-MM-dd');
          return attendanceDates[dateString] === 'Absent';
        },
        leave: date => {
          const dateString = format(date, 'yyyy-MM-dd');
          return attendanceDates[dateString] === 'Leave';
        },
        holiday: date => {
          const dateString = format(date, 'yyyy-MM-dd');
          return attendanceDates[dateString] === 'Holiday';
        }
      }} modifiersClassNames={{
        present: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
        absent: "bg-red-100 text-red-700 hover:bg-red-200",
        leave: "bg-amber-100 text-amber-700 hover:bg-amber-200",
        holiday: "bg-blue-100 text-blue-700 hover:bg-blue-200"
      }} />
        
        <div className="flex flex-wrap gap-2 justify-center text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-green-600"></div>
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-[#ff0000]"></div>
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-amber-500"></div>
            <span>Leave</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span>Holiday</span>
          </div>
        </div>
      </div>;
  };
  return <Card className="bg-white shadow-sm border">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="sm:text-lg font-semibold text-lg">Attendance History</CardTitle>
            <CardDescription className="text-xs">
              Viewing attendance records for the past 12 months
            </CardDescription>
          </div>
          <Tabs value={attendanceView} onValueChange={value => setAttendanceView(value as "list" | "calendar")}>
            <TabsList className={isMobile ? "h-8" : ""}>
              <TabsTrigger value="list" className={cn("flex items-center gap-1.5", isMobile && "text-xs px-2 py-1")}>
                <FileText className={cn("h-4 w-4", isMobile && "h-3 w-3")} /> {!isMobile && "List View"}
              </TabsTrigger>
              <TabsTrigger value="calendar" className={cn("flex items-center gap-1.5", isMobile && "text-xs px-2 py-1")}>
                <Calendar className={cn("h-4 w-4", isMobile && "h-3 w-3")} /> {!isMobile && "Calendar"}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <Tabs value={attendanceView}>
        <TabsContent value="list" className="mt-0 focus-visible:outline-none">
          <CardContent className={cn("p-4 sm:p-6", isMobile && "p-3")}>
            <Collapsible open={expanded} onOpenChange={setExpanded}>
              <AttendanceHistoryTable attendanceHistory={displayRecords} />
              
              {attendanceHistory.length > 30 && <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full mt-4 border-dashed border border-gray-200 hover:bg-gray-50">
                    {expanded ? <span className="flex items-center gap-1">
                        <ChevronUp className="h-4 w-4" /> Show Less
                      </span> : <span className="flex items-center gap-1">
                        <ChevronDown className="h-4 w-4" /> View More ({attendanceHistory.length - 30} records)
                      </span>}
                  </Button>
                </CollapsibleTrigger>}
              
              <CollapsibleContent>
                {expanded && attendanceHistory.length > 30 && <div className="mt-4 pt-4 border-t">
                    <AttendanceHistoryTable attendanceHistory={attendanceHistory.slice(30)} />
                  </div>}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </TabsContent>

        <TabsContent value="calendar" className="mt-0 focus-visible:outline-none">
          <CardContent className={cn("p-4 sm:p-6", isMobile && "p-3")}>
            {renderAttendanceCalendar()}
          </CardContent>
        </TabsContent>
      </Tabs>

      <CardFooter className={cn("px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50 flex items-center justify-between", isMobile && "flex-col gap-2 items-stretch")}>
        <div className="text-xs sm:text-sm text-muted-foreground">
          Last updated: {format(new Date(), 'MMM d, yyyy')}
        </div>
        <Button variant="outline" className="flex items-center gap-1.5" size={isMobile ? "sm" : "default"}>
          <FileText className="h-4 w-4" /> Generate Full Report
        </Button>
      </CardFooter>
    </Card>;
}
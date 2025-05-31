
import { memo, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface AttendanceHistoryTableProps {
  attendanceHistory: any[];
}

// Using memo to prevent unnecessary re-renders
export const AttendanceHistoryTable = memo(({ attendanceHistory }: AttendanceHistoryTableProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Memoize status color logic to prevent recalculations
  const getStatusColor = useMemo(() => (status: string) => {
    switch (status) {
      case "Present":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Absent":
        return "bg-red-100 text-red-700 border-red-200";
      case "Leave":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Holiday":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  }, []);

  // Memoize the status icon for better performance
  const StatusIcon = useMemo(() => ({ status }: { status: string }) => {
    switch (status) {
      case "Present": 
        return <Check className={cn("h-5 w-5 text-emerald-500", isMobile && "h-4 w-4")} />;
      case "Absent": 
        return <X className={cn("h-5 w-5 text-red-500", isMobile && "h-4 w-4")} />;
      case "Leave": 
        return <Clock className={cn("h-5 w-5 text-amber-500", isMobile && "h-4 w-4")} />;
      case "Holiday": 
        return <Calendar className={cn("h-5 w-5 text-blue-500", isMobile && "h-4 w-4")} />;
      default: 
        return null;
    }
  }, [isMobile]);

  if (attendanceHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 border rounded-lg bg-gray-50/50">
        <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-3" />
        <p className="text-base sm:text-lg font-medium text-muted-foreground">No attendance records</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md text-center px-4">
          No attendance records found for this student in the past 12 months.
        </p>
      </div>
    );
  }

  // Using virtualization would be ideal for very large datasets,
  // but for now we'll optimize the render performance
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-gray-50">
              <TableHead className={cn("w-[130px]", isMobile && "text-xs")}>Date</TableHead>
              <TableHead className={isMobile ? "text-xs hidden sm:table-cell" : ""}>Day</TableHead>
              <TableHead className={cn("text-center", isMobile && "text-xs")}>Status</TableHead>
              <TableHead className={cn("text-right", isMobile && "text-xs")}>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceHistory.map(record => (
              <TableRow key={record.id}>
                <TableCell className={cn("font-medium", isMobile && "text-xs py-2")}>
                  {format(parseISO(record.date), isMobile ? "dd MMM" : "dd MMM yyyy")}
                </TableCell>
                <TableCell className={cn("text-muted-foreground", isMobile && "text-xs py-2 hidden sm:table-cell")}>
                  {format(parseISO(record.date), "EEEE")}
                </TableCell>
                <TableCell className={cn("text-center", isMobile && "text-xs py-2")}>
                  <div className="flex justify-center">
                    <StatusIcon status={record.status} />
                  </div>
                </TableCell>
                <TableCell className={cn("text-right", isMobile && "text-xs py-2")}>
                  <Badge variant="outline" className={cn(getStatusColor(record.status), isMobile && "text-xs py-0 px-1.5")}>
                    {record.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

AttendanceHistoryTable.displayName = "AttendanceHistoryTable";

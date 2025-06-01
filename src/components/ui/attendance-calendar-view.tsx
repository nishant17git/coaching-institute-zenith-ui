
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface AttendanceCalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function AttendanceCalendarView({ selectedDate, onDateChange }: AttendanceCalendarViewProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Selected Date: {format(selectedDate, 'PPP')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Showing attendance for {format(selectedDate, 'EEEE, MMMM do, yyyy')}
        </p>
      </CardContent>
    </Card>
  );
}

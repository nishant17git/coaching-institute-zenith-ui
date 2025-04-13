
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";

interface DateSelectorProps {
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export function DateSelector({ 
  selectedMonth, 
  setSelectedMonth,
  selectedDate,
  setSelectedDate
}: DateSelectorProps) {
  const goToPrevMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const goToNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today);
    setSelectedDate(today);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={goToPrevMonth}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous month</span>
      </Button>
      <div className="text-sm font-medium min-w-[120px] text-center">
        {format(selectedMonth, "MMMM yyyy")}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={goToNextMonth}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next month</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="ml-2 h-8"
        onClick={goToToday}
      >
        Today
      </Button>
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarClock } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { motion } from "framer-motion";
import { 
  Tooltip,
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

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
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={goToPrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous month</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous month</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <motion.div 
        key={format(selectedMonth, 'MMMM yyyy')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm font-medium min-w-[120px] text-center"
      >
        {format(selectedMonth, "MMMM yyyy")}
      </motion.div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next month</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next month</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 h-8 rounded-full"
              onClick={goToToday}
            >
              <CalendarClock className="h-4 w-4 mr-1.5" />
              Today
            </Button>
          </TooltipTrigger>
          <TooltipContent>Go to today</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}


"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  date?: Date
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  disabled?: (date: Date) => boolean
  className?: string
  fromYear?: number
  toYear?: number
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Pick a date",
  disabled,
  className,
  fromYear = 1900,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Generate years array
  const years = Array.from(
    { length: toYear - fromYear + 1 }, 
    (_, i) => fromYear + i
  ).reverse()

  // Generate months array
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const handleYearChange = (year: string) => {
    const currentDate = date || new Date()
    const newDate = new Date(currentDate)
    newDate.setFullYear(parseInt(year))
    onSelect(newDate)
  }

  const handleMonthChange = (month: string) => {
    const currentDate = date || new Date()
    const newDate = new Date(currentDate)
    newDate.setMonth(months.indexOf(month))
    onSelect(newDate)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          {date ? format(date, "PPP") : placeholder}
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <div className="p-3 space-y-3">
          {/* Year and Month Selectors */}
          <div className="flex gap-2">
            <Select 
              value={date ? date.getFullYear().toString() : undefined}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={date ? months[date.getMonth()] : undefined}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Calendar */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onSelect(selectedDate)
              if (selectedDate) {
                setIsOpen(false)
              }
            }}
            disabled={disabled}
            month={date}
            onMonthChange={onSelect}
            initialFocus
            className="pointer-events-auto"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

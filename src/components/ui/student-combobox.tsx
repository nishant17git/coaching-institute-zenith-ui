
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Student {
  id: string
  name?: string
  full_name?: string
  class: string | number
}

interface StudentComboboxProps {
  students: Student[]
  value?: string
  onSelect: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function StudentCombobox({
  students,
  value,
  onSelect,
  placeholder = "Select student",
  disabled = false,
  className = "w-full"
}: StudentComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedStudent = students.find((student) => student.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-11 font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedStudent
            ? `${selectedStudent.name || selectedStudent.full_name} - Class ${selectedStudent.class}`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-50" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput
            placeholder="Search students..."
            className="h-9"
          />
          <CommandList className="max-h-[250px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <CommandEmpty>No student found.</CommandEmpty>
            <CommandGroup>
              {students.map((student) => (
                <CommandItem
                  value={`${student.name || student.full_name} - Class ${student.class}`}
                  key={student.id}
                  onSelect={() => {
                    onSelect(student.id)
                    setOpen(false)
                  }}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground py-2 px-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {student.name || student.full_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Class {student.class}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4 shrink-0",
                      student.id === value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

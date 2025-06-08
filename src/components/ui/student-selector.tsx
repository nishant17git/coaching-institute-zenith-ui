
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, User } from "lucide-react";

interface StudentOption {
  id: string;
  name: string;
  class: number;
  rollNumber?: number;
  feeStatus: string;
}

interface StudentSelectorProps {
  students: StudentOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function StudentSelector({ 
  students, 
  value, 
  onValueChange, 
  placeholder = "Select a student",
  className = "w-full"
}: StudentSelectorProps) {
  // Group students by class
  const studentsByClass = students.reduce((groups, student) => {
    const className = `Class ${student.class}`;
    if (!groups[className]) {
      groups[className] = [];
    }
    groups[className].push(student);
    return groups;
  }, {} as Record<string, StudentOption[]>);

  // Sort classes numerically
  const sortedClasses = Object.keys(studentsByClass).sort((a, b) => {
    const classA = parseInt(a.replace('Class ', ''));
    const classB = parseInt(b.replace('Class ', ''));
    return classA - classB;
  });

  const getFeeStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "text-green-600";
      case "Partial":
        return "text-amber-600";
      default:
        return "text-red-600";
    }
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {sortedClasses.map(className => (
          <SelectGroup key={className}>
            <SelectLabel className="flex items-center gap-2 py-2">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              {className}
              <span className="text-xs text-muted-foreground">
                ({studentsByClass[className].length} students)
              </span>
            </SelectLabel>
            {studentsByClass[className]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(student => (
                <SelectItem 
                  key={student.id} 
                  value={student.id}
                  className="pl-8"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-slate-500" />
                      <span className="font-medium">{student.name}</span>
                      {student.rollNumber && (
                        <span className="text-xs text-muted-foreground">
                          (Roll: {student.rollNumber})
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${getFeeStatusColor(student.feeStatus)}`}>
                      {student.feeStatus}
                    </span>
                  </div>
                </SelectItem>
              ))}
          </SelectGroup>
        ))}
        {students.length === 0 && (
          <div className="text-center py-6 text-slate-500">
            No students available
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
